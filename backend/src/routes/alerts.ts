import { Router } from 'express';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';
import { getDb } from '../config/database.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimiter.js';
import type { Alert } from '../types/index.js';

const router = Router();

type DbAlert = {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  station: string;
  next_station: string | null;
  train_id: string | null;
  section: string;
  timestamp: number;
  resolved: number;
  journey_continued: number | null;
};

function toAlert(row: DbAlert): Alert {
  return {
    id: row.id,
    type: row.type as Alert['type'],
    severity: row.severity as Alert['severity'],
    title: row.title,
    message: row.message,
    station: row.station,
    nextStation: row.next_station ?? undefined,
    trainId: row.train_id ?? undefined,
    section: row.section as Alert['section'],
    timestamp: new Date(row.timestamp).toISOString(),
    resolved: row.resolved === 1,
    journeyContinued: row.journey_continued != null ? row.journey_continued === 1 : undefined,
  };
}

// GET /api/alerts?section=metro|railway&resolved=true|false
router.get('/', (req, res) => {
  const db = getDb();
  const { section, resolved } = req.query;

  // Build the query dynamically with only the conditions needed.
  // We use separate prepared statements to keep typing straightforward.
  let rows: DbAlert[];
  if (section && resolved !== undefined) {
    rows = db
      .prepare('SELECT * FROM alerts WHERE section = ? AND resolved = ? ORDER BY timestamp DESC')
      .all(String(section), resolved === 'true' ? 1 : 0) as DbAlert[];
  } else if (section) {
    rows = db
      .prepare('SELECT * FROM alerts WHERE section = ? ORDER BY timestamp DESC')
      .all(String(section)) as DbAlert[];
  } else if (resolved !== undefined) {
    rows = db
      .prepare('SELECT * FROM alerts WHERE resolved = ? ORDER BY timestamp DESC')
      .all(resolved === 'true' ? 1 : 0) as DbAlert[];
  } else {
    rows = db.prepare('SELECT * FROM alerts ORDER BY timestamp DESC').all() as DbAlert[];
  }

  res.json(rows.map(toAlert));
});

// GET /api/alerts/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const row = db
    .prepare('SELECT * FROM alerts WHERE id = ?')
    .get(req.params.id) as DbAlert | undefined;

  if (!row) {
    res.status(404).json({ error: 'Alert not found' });
    return;
  }

  res.json(toAlert(row));
});

// POST /api/alerts (staff only)
const createAlertSchema = z.object({
  type: z.enum(['medical', 'technical', 'security', 'weather', 'delay']),
  severity: z.enum(['info', 'warning', 'critical']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  station: z.string().min(1),
  nextStation: z.string().optional(),
  trainId: z.string().optional(),
  section: z.enum(['metro', 'railway']),
  journeyContinued: z.boolean().optional(),
});

router.post(
  '/',
  writeLimiter,
  authenticate,
  requireRole('admin', 'supervisor', 'employee'),
  (req, res) => {
    const parse = createAlertSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Invalid alert data', details: parse.error.flatten() });
      return;
    }

    const data = parse.data;
    const id = randomUUID();
    const db = getDb();

    db.prepare(`
      INSERT INTO alerts (id, type, severity, title, message, station, next_station, train_id, section, timestamp, resolved, journey_continued)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(
      id,
      data.type,
      data.severity,
      data.title,
      data.message,
      data.station,
      data.nextStation ?? null,
      data.trainId ?? null,
      data.section,
      Date.now(),
      data.journeyContinued != null ? (data.journeyContinued ? 1 : 0) : null,
    );

    const row = db.prepare('SELECT * FROM alerts WHERE id = ?').get(id) as DbAlert;
    res.status(201).json(toAlert(row));
  },
);

// PATCH /api/alerts/:id/resolve (staff only)
router.patch(
  '/:id/resolve',
  writeLimiter,
  authenticate,
  requireRole('admin', 'supervisor', 'employee'),
  (req, res) => {
    const db = getDb();
    const result = db
      .prepare('UPDATE alerts SET resolved = 1 WHERE id = ?')
      .run(req.params.id);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    const row = db.prepare('SELECT * FROM alerts WHERE id = ?').get(req.params.id) as DbAlert;
    res.json(toAlert(row));
  },
);

// DELETE /api/alerts/:id (admin only)
router.delete(
  '/:id',
  writeLimiter,
  authenticate,
  requireRole('admin'),
  (req, res) => {
    const db = getDb();
    const result = db.prepare('DELETE FROM alerts WHERE id = ?').run(req.params.id);

    if (result.changes === 0) {
      res.status(404).json({ error: 'Alert not found' });
      return;
    }

    res.status(204).send();
  },
);

export default router;
