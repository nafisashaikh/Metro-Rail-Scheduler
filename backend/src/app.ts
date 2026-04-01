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

// Restrict CORS to an explicit list of trusted origins.
// In development the env var is expected to be set to the Vite dev server origin.
// Wildcard '*' is intentionally not used in production.
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
  : process.env.NODE_ENV === 'production'
    ? [] // deny all in production when not configured
    : ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000'];

app.use(
  cors({
    origin: corsOrigins,
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
