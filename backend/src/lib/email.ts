import nodemailer from 'nodemailer';

import { logger } from './logger';

const transporter = nodemailer.createTransport({
  host: process.env['SMTP_HOST'] ?? 'localhost',
  port: parseInt(process.env['SMTP_PORT'] ?? '587'),
  secure: process.env['SMTP_SECURE'] === 'true',
  auth: {
    user: process.env['SMTP_USER'],
    pass: process.env['SMTP_PASS'],
  },
});

const FROM = process.env['EMAIL_FROM'] ?? 'FlowSphere AI <noreply@flowsphere.ai>';
const APP_URL = process.env['APP_URL'] ?? 'http://localhost:3000';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

async function sendEmail(options: EmailOptions): Promise<void> {
  if (process.env['NODE_ENV'] === 'test') return;
  try {
    await transporter.sendMail({ from: FROM, ...options });
    logger.info(`Email sent to ${options.to}: ${options.subject}`);
  } catch (error) {
    logger.error('Email send error:', error);
    throw error;
  }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

function baseTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; background: #090D16; color: #fff; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #141A28; border-radius: 16px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); }
        .header { background: linear-gradient(135deg, #5B5FFF, #8A5CFF); padding: 40px; text-align: center; }
        .header h1 { margin: 0; color: #fff; font-size: 28px; font-weight: 700; }
        .header p { margin: 8px 0 0; color: rgba(255,255,255,0.8); }
        .content { padding: 40px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #5B5FFF, #8A5CFF); color: #fff; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; margin: 24px 0; }
        .footer { padding: 24px 40px; border-top: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.4); font-size: 13px; text-align: center; }
        p { color: rgba(255,255,255,0.7); line-height: 1.6; }
        code { background: rgba(91,95,255,0.2); color: #8A5CFF; padding: 2px 8px; border-radius: 4px; font-family: monospace; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚡ FlowSphere AI</h1>
          <p>Design. Automate. Scale.</p>
        </div>
        <div class="content">${content}</div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} FlowSphere AI. All rights reserved.</p>
          <p>If you didn't request this email, you can safely ignore it.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendVerificationEmail(to: string, name: string, token: string): Promise<void> {
  const url = `${APP_URL}/auth/verify-email?token=${token}`;
  await sendEmail({
    to,
    subject: 'Verify your FlowSphere AI account',
    html: baseTemplate(`
      <h2>Welcome, ${name}! 👋</h2>
      <p>Thanks for signing up for FlowSphere AI. Please verify your email address to get started.</p>
      <a href="${url}" class="btn">Verify Email Address</a>
      <p>This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    `),
    text: `Welcome to FlowSphere AI! Verify your email: ${url}`,
  });
}

export async function sendPasswordResetEmail(to: string, name: string, token: string): Promise<void> {
  const url = `${APP_URL}/auth/reset-password?token=${token}`;
  await sendEmail({
    to,
    subject: 'Reset your FlowSphere AI password',
    html: baseTemplate(`
      <h2>Password Reset Request</h2>
      <p>Hi ${name}, we received a request to reset your password.</p>
      <a href="${url}" class="btn">Reset Password</a>
      <p>This link expires in 1 hour. If you didn't request a reset, your password remains unchanged.</p>
    `),
    text: `Reset your password: ${url}`,
  });
}

export async function sendMagicLinkEmail(to: string, token: string): Promise<void> {
  const url = `${APP_URL}/auth/magic-link?token=${token}`;
  await sendEmail({
    to,
    subject: 'Your FlowSphere AI magic link',
    html: baseTemplate(`
      <h2>Magic Link Login ✨</h2>
      <p>Click the button below to sign in to your FlowSphere AI account instantly — no password needed.</p>
      <a href="${url}" class="btn">Sign In with Magic Link</a>
      <p>This link expires in 15 minutes and can only be used once.</p>
    `),
    text: `Sign in with your magic link: ${url}`,
  });
}

export async function sendTeamInviteEmail(to: string, inviterName: string, orgName: string, token: string): Promise<void> {
  const url = `${APP_URL}/invite?token=${token}`;
  await sendEmail({
    to,
    subject: `${inviterName} invited you to ${orgName} on FlowSphere AI`,
    html: baseTemplate(`
      <h2>You're invited! 🎉</h2>
      <p><strong>${inviterName}</strong> has invited you to join <strong>${orgName}</strong> on FlowSphere AI.</p>
      <a href="${url}" class="btn">Accept Invitation</a>
      <p>This invitation expires in 7 days.</p>
    `),
    text: `Accept your invitation to ${orgName}: ${url}`,
  });
}
