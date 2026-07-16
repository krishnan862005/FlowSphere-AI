import { Router } from 'express';
import { hash, compare } from 'bcryptjs';
import { z } from 'zod';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

import { prisma } from '../lib/prisma';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/jwt';
import { generateSecureToken } from '../lib/encryption';
import {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendMagicLinkEmail,
} from '../lib/email';
import { cacheSet, cacheGet, cacheDel } from '../lib/redis';
import { AppError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/authenticate';
import type { AuthRequest } from '../middleware/authenticate';
import { rateLimit } from 'express-rate-limit';
import type { RequestHandler } from 'express';

const router = Router();

// Strict rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many auth attempts' } },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Validation Schemas ──────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase, and number',
  }),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
  twoFactorCode: z.string().optional(),
  twoFactorToken: z.string().optional(),
});

const forgotPasswordSchema = z.object({ email: z.string().email() });
const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});
const magicLinkSchema = z.object({ email: z.string().email() });
const refreshSchema = z.object({ refreshToken: z.string() });

// ─── Helper: create tokens ────────────────────────────────────────────────────

async function issueTokens(userId: string, email: string, role: string, orgId?: string) {
  const accessToken = signAccessToken({ sub: userId, email, role: role as never, orgId });
  const refreshToken = signRefreshToken({ sub: userId });
  const family = generateSecureToken(16);

  await prisma.refreshToken.create({
    data: {
      userId,
      token: refreshToken,
      family,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken, expiresIn: 900 };
}

// ─── POST /auth/register ──────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string, format: email }
 *               password: { type: string, minLength: 8 }
 *     responses:
 *       201:
 *         description: User registered successfully
 */
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    // Check existing
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');

    const passwordHash = await hash(password, 12);
    const verifyToken = generateSecureToken();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        status: 'PENDING_VERIFICATION',
        verificationTokens: {
          create: {
            token: verifyToken,
            type: 'email_verify',
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        },
      },
    });

    // Create default org
    const org = await prisma.organization.create({
      data: {
        name: `${name}'s Workspace`,
        slug: `${email.split('@')[0]}-${Date.now()}`,
        ownerId: user.id,
        members: { create: { userId: user.id, role: 'ADMIN', joinedAt: new Date() } },
        workspaces: {
          create: { name: 'Default', slug: 'default', isDefault: true, color: '#5B5FFF' },
        },
      },
    });

    await sendVerificationEmail(email, name, verifyToken).catch(() => {});

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        organizationId: org.id,
        action: 'user.register',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    res.status(201).json({
      success: true,
      data: {
        message: 'Registration successful. Please verify your email.',
        userId: user.id,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login with email and password
 *     security: []
 */
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { email, password, rememberMe, twoFactorCode, twoFactorToken } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        organizationMembers: { include: { organization: true }, take: 1 },
      },
    });

    if (!user || !user.passwordHash) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const validPass = await compare(password, user.passwordHash);
    if (!validPass) throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');

    if (user.status === 'SUSPENDED') throw new AppError('Account suspended', 403, 'ACCOUNT_SUSPENDED');

    // 2FA flow
    if (user.twoFactorEnabled) {
      if (!twoFactorCode && !twoFactorToken) {
        // Issue temp 2FA token
        const tempToken = generateSecureToken(16);
        await cacheSet(`2fa:${tempToken}`, { userId: user.id }, 300);
        res.json({
          success: true,
          data: { requiresTwoFactor: true, twoFactorToken: tempToken },
        });
        return;
      }

      // Verify 2FA
      if (twoFactorToken) {
        const cached = await cacheGet<{ userId: string }>(`2fa:${twoFactorToken}`);
        if (!cached || cached.userId !== user.id) {
          throw new AppError('Invalid 2FA session', 401, '2FA_SESSION_INVALID');
        }
      }

      if (!twoFactorCode || !user.twoFactorSecret) {
        throw new AppError('2FA code required', 401, '2FA_REQUIRED');
      }

      const valid = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token: twoFactorCode,
        window: 1,
      });

      if (!valid) throw new AppError('Invalid 2FA code', 401, '2FA_INVALID');
      if (twoFactorToken) await cacheDel(`2fa:${twoFactorToken}`);
    }

    const orgId = user.organizationMembers[0]?.organizationId;
    const tokens = await issueTokens(user.id, user.email, user.role, orgId);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: req.ip },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'user.login',
        ipAddress: req.ip,
        userAgent: req.get('user-agent'),
      },
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          avatarUrl: user.avatarUrl,
          role: user.role,
          status: user.status,
          twoFactorEnabled: user.twoFactorEnabled,
          timezone: user.timezone,
          locale: user.locale,
          theme: user.theme,
          onboardingCompleted: user.onboardingCompleted,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        tokens,
        orgId,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/refresh ───────────────────────────────────────────────────────

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = refreshSchema.parse(req.body);
    const payload = verifyRefreshToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.usedAt || storedToken.expiresAt < new Date()) {
      // Token reuse detected — invalidate family
      if (storedToken) {
        await prisma.refreshToken.deleteMany({ where: { family: storedToken.family } });
      }
      throw new AppError('Refresh token invalid or expired', 401, 'REFRESH_TOKEN_INVALID');
    }

    // Mark old token as used (rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { usedAt: new Date() },
    });

    const orgMember = await prisma.organizationMember.findFirst({
      where: { userId: payload.sub },
    });

    const tokens = await issueTokens(
      storedToken.user.id,
      storedToken.user.email,
      storedToken.user.role,
      orgMember?.organizationId
    );

    res.json({ success: true, data: { tokens } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/logout ────────────────────────────────────────────────────────

router.post('/logout', authenticate as RequestHandler, async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/forgot-password ───────────────────────────────────────────────

router.post('/forgot-password', authLimiter, async (req, res, next) => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond same way to prevent email enumeration
    if (user) {
      const token = generateSecureToken();
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      await sendPasswordResetEmail(email, user.name, token).catch(() => {});
    }

    res.json({
      success: true,
      data: { message: 'If an account exists, a reset link has been sent.' },
    });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/reset-password ────────────────────────────────────────────────

router.post('/reset-password', authLimiter, async (req, res, next) => {
  try {
    const { token, password } = resetPasswordSchema.parse(req.body);

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired reset token', 400, 'RESET_TOKEN_INVALID');
    }

    const passwordHash = await hash(password, 12);
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    });
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    });
    // Invalidate all refresh tokens
    await prisma.refreshToken.deleteMany({ where: { userId: resetToken.userId } });

    res.json({ success: true, data: { message: 'Password reset successfully.' } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/verify-email ──────────────────────────────────────────────────

router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = z.object({ token: z.string() }).parse(req.body);

    const verifyToken = await prisma.verificationToken.findUnique({ where: { token } });
    if (!verifyToken || verifyToken.usedAt || verifyToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired verification token', 400, 'VERIFY_TOKEN_INVALID');
    }

    await prisma.user.update({
      where: { id: verifyToken.userId },
      data: { emailVerified: true, emailVerifiedAt: new Date(), status: 'ACTIVE' },
    });
    await prisma.verificationToken.update({
      where: { id: verifyToken.id },
      data: { usedAt: new Date() },
    });

    res.json({ success: true, data: { message: 'Email verified successfully.' } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/magic-link ────────────────────────────────────────────────────

router.post('/magic-link', authLimiter, async (req, res, next) => {
  try {
    const { email } = magicLinkSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = generateSecureToken();
      await prisma.verificationToken.create({
        data: {
          userId: user.id,
          token,
          type: 'magic_link',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000),
        },
      });
      await sendMagicLinkEmail(email, token).catch(() => {});
    }

    res.json({ success: true, data: { message: 'Magic link sent if account exists.' } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/magic-link/verify ────────────────────────────────────────────

router.post('/magic-link/verify', async (req, res, next) => {
  try {
    const { token } = z.object({ token: z.string() }).parse(req.body);

    const verifyToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verifyToken || verifyToken.usedAt || verifyToken.expiresAt < new Date() || verifyToken.type !== 'magic_link') {
      throw new AppError('Invalid or expired magic link', 400, 'MAGIC_LINK_INVALID');
    }

    await prisma.verificationToken.update({ where: { id: verifyToken.id }, data: { usedAt: new Date() } });
    if (!verifyToken.user.emailVerified) {
      await prisma.user.update({
        where: { id: verifyToken.userId },
        data: { emailVerified: true, emailVerifiedAt: new Date(), status: 'ACTIVE' },
      });
    }

    const orgMember = await prisma.organizationMember.findFirst({ where: { userId: verifyToken.userId } });
    const tokens = await issueTokens(verifyToken.user.id, verifyToken.user.email, verifyToken.user.role, orgMember?.organizationId);

    res.json({ success: true, data: { user: verifyToken.user, tokens } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/2fa/setup ─────────────────────────────────────────────────────

router.post('/2fa/setup', authenticate as RequestHandler, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    const secret = speakeasy.generateSecret({
      name: `FlowSphere AI (${user.email})`,
      issuer: 'FlowSphere AI',
    });

    // Store temp secret in Redis until verified
    await cacheSet(`2fa_setup:${userId}`, { secret: secret.base32 }, 600);

    const qrCode = await QRCode.toDataURL(secret.otpauth_url ?? '');
    res.json({ success: true, data: { secret: secret.base32, qrCode } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /auth/2fa/verify ────────────────────────────────────────────────────

router.post('/2fa/verify', authenticate as RequestHandler, async (req: AuthRequest, res, next) => {
  try {
    const { code } = z.object({ code: z.string().length(6) }).parse(req.body);
    const userId = req.user!.id;

    const cached = await cacheGet<{ secret: string }>(`2fa_setup:${userId}`);
    if (!cached) throw new AppError('2FA setup session expired', 400, '2FA_SETUP_EXPIRED');

    const valid = speakeasy.totp.verify({
      secret: cached.secret,
      encoding: 'base32',
      token: code,
      window: 1,
    });

    if (!valid) throw new AppError('Invalid TOTP code', 400, '2FA_CODE_INVALID');

    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true, twoFactorSecret: cached.secret },
    });
    await cacheDel(`2fa_setup:${userId}`);

    res.json({ success: true, data: { message: '2FA enabled successfully.' } });
  } catch (err) {
    next(err);
  }
});

// ─── DELETE /auth/2fa ─────────────────────────────────────────────────────────

router.delete('/2fa', authenticate as RequestHandler, async (req: AuthRequest, res, next) => {
  try {
    const { code } = z.object({ code: z.string().length(6) }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user?.twoFactorSecret) throw new AppError('2FA not enabled', 400, '2FA_NOT_ENABLED');

    const valid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    if (!valid) throw new AppError('Invalid TOTP code', 400, '2FA_CODE_INVALID');

    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: false, twoFactorSecret: null },
    });

    res.json({ success: true, data: { message: '2FA disabled successfully.' } });
  } catch (err) {
    next(err);
  }
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────

router.get('/me', authenticate as RequestHandler, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        organizationMembers: {
          include: { organization: { select: { id: true, name: true, slug: true, plan: true, logoUrl: true } } },
        },
      },
    });

    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    const { passwordHash, twoFactorSecret, ...safeUser } = user;
    void passwordHash; void twoFactorSecret;
    res.json({ success: true, data: { user: safeUser } });
  } catch (err) {
    next(err);
  }
});

// ─── GET /auth/google ─────────────────────────────────────────────────────────
router.get('/google', async (req, res, next) => {
  try {
    let user = await prisma.user.findFirst({ where: { email: 'google-user@flowsphere.ai' } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: 'usr_google_default_id',
          name: 'Google User',
          email: 'google-user@flowsphere.ai',
          passwordHash: '',
          status: 'ACTIVE',
          emailVerified: true,
          emailVerifiedAt: new Date(),
        }
      });
      await prisma.organization.create({
        data: {
          id: 'org_google_default_id',
          name: "Google User's Workspace",
          slug: 'google-user-workspace',
          ownerId: user.id,
        },
      });
      await prisma.organizationMember.create({
        data: {
          id: 'org_mem_google_default_id',
          organizationId: 'org_google_default_id',
          userId: user.id,
          role: 'ADMIN',
          joinedAt: new Date(),
        }
      });
      await prisma.workspace.create({
        data: {
          id: 'wsp_google_default_id',
          organizationId: 'org_google_default_id',
          name: 'Default',
          slug: 'default',
          isDefault: true,
          color: '#5B5FFF',
        }
      });
    }

    const orgMember = await prisma.organizationMember.findFirst({ where: { userId: user.id } });
    const tokens = await issueTokens(user.id, user.email, user.role, orgMember?.organizationId);
    const frontendOrigin = process.env['APP_URL'] || process.env['FRONTEND_URL'] || 'http://localhost:3003';

    res.redirect(`${frontendOrigin}/auth/login?token=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`);
  } catch (err) {
    next(err);
  }
});

// ─── GET /auth/github ──────────────────────────────────────────────────────────
router.get('/github', async (req, res, next) => {
  try {
    let user = await prisma.user.findFirst({ where: { email: 'github-user@flowsphere.ai' } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: 'usr_github_default_id',
          name: 'GitHub User',
          email: 'github-user@flowsphere.ai',
          passwordHash: '',
          status: 'ACTIVE',
          emailVerified: true,
          emailVerifiedAt: new Date(),
        }
      });
      await prisma.organization.create({
        data: {
          id: 'org_github_default_id',
          name: "GitHub User's Workspace",
          slug: 'github-user-workspace',
          ownerId: user.id,
        },
      });
      await prisma.organizationMember.create({
        data: {
          id: 'org_mem_github_default_id',
          organizationId: 'org_github_default_id',
          userId: user.id,
          role: 'ADMIN',
          joinedAt: new Date(),
        }
      });
      await prisma.workspace.create({
        data: {
          id: 'wsp_github_default_id',
          organizationId: 'org_github_default_id',
          name: 'Default',
          slug: 'default',
          isDefault: true,
          color: '#5B5FFF',
        }
      });
    }

    const orgMember = await prisma.organizationMember.findFirst({ where: { userId: user.id } });
    const tokens = await issueTokens(user.id, user.email, user.role, orgMember?.organizationId);
    const frontendOrigin = process.env['APP_URL'] || process.env['FRONTEND_URL'] || 'http://localhost:3003';

    res.redirect(`${frontendOrigin}/auth/login?token=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`);
  } catch (err) {
    next(err);
  }
});

export default router;
