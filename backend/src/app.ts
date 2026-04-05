import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.js';
import { healthRouter } from './routes/health.js';
import { schedulesRouter } from './routes/schedules.js';
import { rateLimiter, cleanupRateLimitStore } from './middleware/rateLimiter.js';
import { sanitizeInput, enforceHTTPS, securityHeaders, requestLogger } from './middleware/security.js';

export const app = express();

// Security middleware
app.use(securityHeaders);
app.use(enforceHTTPS);
app.use(requestLogger);
app.use(sanitizeInput);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow same-machine Vite dev ports without constant .env edits.
      if (!origin) {
        callback(null, true);
        return;
      }

      const isConfiguredOrigin = origin === env.frontendOrigin;
      const isLocalhostDevOrigin = /^http:\/\/localhost:\d+$/.test(origin);

      if (isConfiguredOrigin || isLocalhostDevOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());

// Database removed - sticking to mock data for simplicity

app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Metro Rail Scheduler API',
    version: '0.1.0',
    endpoints: [
      '/health', 
      '/auth/login', 
      '/auth/signup/passenger', 
      '/auth/me', 
      '/schedules'
    ],
  });
});

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/schedules', schedulesRouter);
