import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { authRouter } from './routes/auth.js';
import { healthRouter } from './routes/health.js';
import { schedulesRouter } from './routes/schedules.js';

export const app = express();

app.use(
  cors({
    origin: env.frontendOrigin,
    credentials: true,
  })
);
app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'Metro Rail Scheduler API',
    version: '0.1.0',
    endpoints: ['/health', '/auth/login', '/auth/signup/passenger', '/auth/me', '/schedules'],
  });
});

app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/schedules', schedulesRouter);
