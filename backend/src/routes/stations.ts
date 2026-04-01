import { Router } from 'express';
import { getDb } from '../config/database.js';
import { allLines } from '../data/lines.js';
import { getStationMetrics } from '../data/generators.js';

const router = Router();

// GET /api/stations?section=metro|railway
router.get('/', (req, res) => {
  const db = getDb();
  const { section } = req.query;

  const query = section
    ? `SELECT DISTINCT s.name, s.lat, s.lng, l.section, l.id as line_id, l.name as line_name
       FROM stations s JOIN lines l ON s.line_id = l.id WHERE l.section = ? ORDER BY s.name`
    : `SELECT DISTINCT s.name, s.lat, s.lng, l.section, l.id as line_id, l.name as line_name
       FROM stations s JOIN lines l ON s.line_id = l.id ORDER BY s.name`;

  const rows = section
    ? db.prepare(query).all(String(section))
    : db.prepare(query).all();

  res.json(rows);
});

// GET /api/stations/:name/metrics?section=metro|railway
router.get('/:name/metrics', (req, res) => {
  const stationName = decodeURIComponent(req.params.name);
  const section = (req.query.section as 'metro' | 'railway') ?? 'metro';

  // Check station exists across all lines
  const exists = allLines.some((line) =>
    line.stations.some((s) => s.toLowerCase() === stationName.toLowerCase())
  );

  if (!exists) {
    res.status(404).json({ error: 'Station not found' });
    return;
  }

  const metrics = getStationMetrics(stationName, section);
  res.json(metrics);
});

export default router;
