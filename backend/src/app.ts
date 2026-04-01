import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import linesRoutes from './routes/lines.js';
import stationsRoutes from './routes/stations.js';
import trainsRoutes from './routes/trains.js';
import alertsRoutes from './routes/alerts.js';
import weatherRoutes from './routes/weather.js';
import schedulesRoutes from './routes/schedules.js';
import journeyRoutes from './routes/journey.js';

const app = express();

// ─── Security & Parsing ───────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);
app.use(express.json());

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/lines', linesRoutes);
app.use('/api/stations', stationsRoutes);
app.use('/api/trains', trainsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/journey', journeyRoutes);

// ─── 404 ──────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

export default app;
