import { Router } from 'express';
import { weatherData } from '../data/weather.js';

const router = Router();

// GET /api/weather?location=mumbai|thane|pune
// section=metro maps to mumbai; section=railway maps to thane (unless ?location= is given)
router.get('/', (req, res) => {
  const { location, section } = req.query as { location?: string; section?: string };

  let key = location?.toLowerCase();

  if (!key) {
    key = section === 'railway' ? 'thane' : 'mumbai';
  }

  const data = weatherData[key];
  if (!data) {
    const available = Object.keys(weatherData).join(', ');
    res.status(404).json({ error: `Weather location not found. Available: ${available}` });
    return;
  }

  res.json(data);
});

export default router;
