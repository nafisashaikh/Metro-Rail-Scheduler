import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { testDatabaseConnection, initializeDatabase } from './config/database.js';
import { authRouter } from './routes/auth.js';
import { healthRouter } from './routes/health.js';
import { schedulesRouter } from './routes/schedules.js';
import { usersRouter } from './routes/users.js';
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

// Initialize database on startup
(async () => {
  const connected = await testDatabaseConnection();
  if (connected) {
    await initializeDatabase();
  } else {
    console.warn('⚠️  Database not connected. User features will not work.');
  }
  
  // Start rate limit cleanup
  cleanupRateLimitStore();
})();

app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Metro Rail Scheduler API',
    version: '0.1.0',
    endpoints: [
      '/health', 
      '/auth/login', 
      '/auth/signup/passenger', 
      '/auth/me', 
      '/schedules',
      '/users/register',
      '/users/verify-otp',
      '/users/profile'
    ],
  });
});

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/schedules', schedulesRouter);

// Apply rate limiting to user endpoints
app.use(
  '/users',
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 10, // Max 10 requests per 15 minutes per IP
    message: 'Too many requests from this IP. Please try again later.',
  }),
  usersRouter
);
