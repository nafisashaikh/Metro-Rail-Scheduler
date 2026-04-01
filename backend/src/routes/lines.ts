import { Router } from 'express';
import { getDb } from '../config/database.js';
import type { MetroLine, StationCoord } from '../types/index.js';

const router = Router();

type DbLine = {
  id: string;
  name: string;
  color: string;
  network_type: string;
  operational_status: string;
  total_length: string | null;
  description: string | null;
  section: string;
};

type DbStation = {
  id: number;
  line_id: string;
  name: string;
  lat: number;
  lng: number;
  station_order: number;
};

function buildLine(row: DbLine, stations: DbStation[]): MetroLine {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    networkType: row.network_type as MetroLine['networkType'],
    operationalStatus: row.operational_status as MetroLine['operationalStatus'],
    totalLength: row.total_length ?? undefined,
    description: row.description ?? undefined,
    section: row.section as MetroLine['section'],
    stations: stations.map((s) => s.name),
    stationCoords: stations.map((s): StationCoord => ({ name: s.name, lat: s.lat, lng: s.lng })),
  };
}

// GET /api/lines?section=metro|railway
router.get('/', (req, res) => {
  const db = getDb();
  const { section } = req.query;

  const rows = section
    ? (db.prepare('SELECT * FROM lines WHERE section = ?').all(String(section)) as DbLine[])
    : (db.prepare('SELECT * FROM lines').all() as DbLine[]);

  const result: MetroLine[] = rows.map((row) => {
    const stations = db
      .prepare('SELECT * FROM stations WHERE line_id = ? ORDER BY station_order')
      .all(row.id) as DbStation[];
    return buildLine(row, stations);
  });

  res.json(result);
});

// GET /api/lines/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const row = db
    .prepare('SELECT * FROM lines WHERE id = ?')
    .get(req.params.id) as DbLine | undefined;

  if (!row) {
    res.status(404).json({ error: 'Line not found' });
    return;
  }

  const stations = db
    .prepare('SELECT * FROM stations WHERE line_id = ? ORDER BY station_order')
    .all(row.id) as DbStation[];

  res.json(buildLine(row, stations));
});

// GET /api/lines/:id/stations
router.get('/:id/stations', (req, res) => {
  const db = getDb();
  const line = db
    .prepare('SELECT id FROM lines WHERE id = ?')
    .get(req.params.id) as { id: string } | undefined;

  if (!line) {
    res.status(404).json({ error: 'Line not found' });
    return;
  }

  const stations = db
    .prepare('SELECT name, lat, lng, station_order FROM stations WHERE line_id = ? ORDER BY station_order')
    .all(line.id) as Pick<DbStation, 'name' | 'lat' | 'lng' | 'station_order'>[];

  res.json(stations.map((s): StationCoord => ({ name: s.name, lat: s.lat, lng: s.lng })));
});

export default router;
