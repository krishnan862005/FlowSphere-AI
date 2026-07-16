import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { requestId } from './middleware/requestId';
import { swaggerSpec } from './lib/swagger';
import { logger } from './lib/logger';

// Route imports
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import organizationsRouter from './routes/organizations';
import workflowsRouter from './routes/workflows';
import executionsRouter from './routes/executions';
import integrationsRouter from './routes/integrations';
import apiKeysRouter from './routes/apiKeys';
import notificationsRouter from './routes/notifications';
import aiRouter from './routes/ai';
import adminRouter from './routes/admin';
import webhookRouter from './routes/webhooks';
import healthRouter from './routes/health';

export const app = express();

// ─── Trust proxy (for production behind NGINX) ──────────────────────────────
app.set('trust proxy', 1);

// ─── Security middleware ─────────────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// ─── CORS ────────────────────────────────────────────────────────────────────
const corsOrigins = (process.env['CORS_ORIGINS'] ?? 'http://localhost:3000,http://localhost:3003').split(',').map((origin) => origin.trim()).filter(Boolean);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID', 'X-API-Key'],
  })
);

const globalLimiter = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] ?? '900000'),
  max: process.env['NODE_ENV'] === 'development' ? 10000 : parseInt(process.env['RATE_LIMIT_MAX_REQUESTS'] ?? '100'),
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMIT', message: 'Too many requests' } },
});
app.use('/api/', globalLimiter);

// ─── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(compression());

// ─── Logging ─────────────────────────────────────────────────────────────────
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
    skip: (req) => req.url === '/api/health',
  })
);
app.use(requestId);

// ─── API Documentation ───────────────────────────────────────────────────────
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { background: #090D16; }',
  customSiteTitle: 'FlowSphere AI API Docs',
}));

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/organizations', organizationsRouter);
app.use('/api/workflows', workflowsRouter);
app.use('/api/executions', executionsRouter);
app.use('/api/integrations', integrationsRouter);
app.use('/api/api-keys', apiKeysRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);
app.use('/api/webhooks', webhookRouter);

// ─── Error handling ──────────────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);
