import { Router } from 'express';
import { allLines } from '../data/lines.js';
import { generateTrainsForStation, predictArrival } from '../data/generators.js';
import type { Train } from '../types/index.js';

const router = Router();

// GET /api/trains?station=X&lineId=Y
router.get('/', (req, res) => {
  const { station, lineId } = req.query as { station?: string; lineId?: string };

  if (!station || !lineId) {
    res.status(400).json({ error: 'station and lineId query params are required' });
    return;
  }

  const line = allLines.find((l) => l.id === lineId);
  if (!line) {
    res.status(404).json({ error: 'Line not found' });
    return;
  }

  if (!line.stations.includes(station)) {
    res.status(404).json({ error: 'Station not found on this line' });
    return;
  }

  const trains = generateTrainsForStation(station, line);
  res.json(trains);
});

// GET /api/trains/:id?station=X&lineId=Y
router.get('/:id', (req, res) => {
  const { station, lineId } = req.query as { station?: string; lineId?: string };

  if (!station || !lineId) {
    res.status(400).json({ error: 'station and lineId query params are required' });
    return;
  }

  const line = allLines.find((l) => l.id === lineId);
  if (!line) {
    res.status(404).json({ error: 'Line not found' });
    return;
  }

  const trains = generateTrainsForStation(station, line);
  const train = trains.find((t: Train) => t.id === req.params.id);

  if (!train) {
    res.status(404).json({ error: 'Train not found' });
    return;
  }

  res.json(train);
});

// GET /api/trains/:id/health?station=X&lineId=Y
router.get('/:id/health', (req, res) => {
  const { station, lineId } = req.query as { station?: string; lineId?: string };

  if (!station || !lineId) {
    res.status(400).json({ error: 'station and lineId query params are required' });
    return;
  }

  const line = allLines.find((l) => l.id === lineId);
  if (!line) {
    res.status(404).json({ error: 'Line not found' });
    return;
  }

  const trains = generateTrainsForStation(station, line);
  const train = trains.find((t: Train) => t.id === req.params.id);

  if (!train) {
    res.status(404).json({ error: 'Train not found' });
    return;
  }

  res.json(train.health);
});

// GET /api/trains/:id/capacity?station=X&lineId=Y
router.get('/:id/capacity', (req, res) => {
  const { station, lineId } = req.query as { station?: string; lineId?: string };

  if (!station || !lineId) {
    res.status(400).json({ error: 'station and lineId query params are required' });
    return;
  }

  const line = allLines.find((l) => l.id === lineId);
  if (!line) {
    res.status(404).json({ error: 'Line not found' });
    return;
  }

  const trains = generateTrainsForStation(station, line);
  const train = trains.find((t: Train) => t.id === req.params.id);

  if (!train) {
    res.status(404).json({ error: 'Train not found' });
    return;
  }

  res.json(train.capacity);
});

// GET /api/trains/:id/predict?station=X&lineId=Y
router.get('/:id/predict', (req, res) => {
  const { station, lineId } = req.query as { station?: string; lineId?: string };

  if (!station || !lineId) {
    res.status(400).json({ error: 'station and lineId query params are required' });
    return;
  }

  const line = allLines.find((l) => l.id === lineId);
  if (!line) {
    res.status(404).json({ error: 'Line not found' });
    return;
  }

  const trains = generateTrainsForStation(station, line);
  const train = trains.find((t: Train) => t.id === req.params.id);

  if (!train) {
    res.status(404).json({ error: 'Train not found' });
    return;
  }

  const prediction = predictArrival(train);
  res.json({
    trainId: train.id,
    predictedArrival: prediction.predictedTime,
    confidence: prediction.confidence,
    factors: prediction.factors,
  });
});

export default router;
