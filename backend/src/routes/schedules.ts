import { Router } from 'express';
import { allLines } from '../data/lines.js';
import { generateTrainsForStation, predictArrival } from '../data/generators.js';

const router = Router();

// GET /api/schedules?station=X&lineId=Y
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

  res.json({
    stationName: station,
    lineName: line.name,
    departures: trains.map((t) => ({
      trainNumber: t.trainNumber,
      departureTime: t.departureTime,
      destination: t.destination,
      platform: t.platform,
      status: t.status,
    })),
  });
});

// POST /api/schedules/predict
router.post('/predict', (req, res) => {
  const { trainId, station, lineId } = req.body as {
    trainId?: string;
    station?: string;
    lineId?: string;
  };

  if (!trainId || !station || !lineId) {
    res.status(400).json({ error: 'trainId, station, and lineId are required' });
    return;
  }

  const line = allLines.find((l) => l.id === lineId);
  if (!line) {
    res.status(404).json({ error: 'Line not found' });
    return;
  }

  const trains = generateTrainsForStation(station, line);
  const train = trains.find((t) => t.id === trainId);

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
