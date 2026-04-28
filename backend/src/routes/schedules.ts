import { Router } from 'express';
import { z } from 'zod';
import {
  createSchedule,
  deleteSchedule,
  listSchedules,
  scheduleToTrain,
  updateSchedule,
  type ScheduleDayOfWeek,
  type ScheduleRecord,
  type ScheduleStatus,
} from '../data/schedules.js';
import { requireAuth } from '../middleware/auth.js';

export const schedulesRouter = Router();

function requireScheduleWriteRole(role: unknown): boolean {
  return role === 'admin' || role === 'supervisor';
}

const timeHHMM = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'departureTime must be in HH:MM format');

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'date must be in YYYY-MM-DD format');

const statusSchema = z.enum(['on-time', 'delayed', 'cancelled']);

const daysSchema = z
  .array(z.enum(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']))
  .min(1)
  .max(7);

const createSchema = z.object({
  station: z.string().min(1).max(80),
  line: z.string().min(1).max(80),
  destination: z.string().min(1).max(80),
  departureTime: timeHHMM,
  arrivalTime: timeHHMM.optional(),
  platform: z.string().min(1).max(10),
  status: statusSchema.optional().default('on-time'),
  trainNumber: z.string().min(3).max(40),

  headwayMinutes: z.coerce.number().int().min(1).max(240).optional(),
  daysOfWeek: daysSchema.optional().default(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] satisfies ScheduleDayOfWeek[]),
  effectiveFrom: isoDate.optional(),
  effectiveTo: isoDate.optional(),
  published: z.boolean().optional().default(true),
});

const updateSchema = createSchema.partial().refine((obj) => Object.keys(obj).length > 0, {
  message: 'At least one field must be provided',
});

schedulesRouter.get('/', requireAuth, (req, res) => {
  const station = typeof req.query.station === 'string' ? req.query.station : undefined;
  const line = typeof req.query.line === 'string' ? req.query.line : undefined;
  const includeUnpublishedRequested = req.query.includeUnpublished === 'true';
  const includeUnpublished = Boolean(
    includeUnpublishedRequested && req.auth && requireScheduleWriteRole(req.auth.role)
  );

  const schedules = listSchedules({ station, line, includeUnpublished });
  const trains = schedules.map(scheduleToTrain);
  res.status(200).json({ schedules, trains });
});

schedulesRouter.post('/', requireAuth, (req, res) => {
  if (!req.auth || !requireScheduleWriteRole(req.auth.role)) {
    res.status(403).json({ error: 'Forbidden.' });
    return;
  }

  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request payload.', details: parsed.error.issues });
    return;
  }

  const created = createSchedule(parsed.data);
  res.status(201).json({ schedule: created, train: scheduleToTrain(created) });
});

schedulesRouter.put('/:id', requireAuth, (req, res) => {
  if (!req.auth || !requireScheduleWriteRole(req.auth.role)) {
    res.status(403).json({ error: 'Forbidden.' });
    return;
  }

  const id = String(req.params.id);
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request payload.', details: parsed.error.issues });
    return;
  }

  const updated = updateSchedule(id, parsed.data);
  if (!updated) {
    res.status(404).json({ error: 'Schedule not found.' });
    return;
  }

  res.status(200).json({ schedule: updated, train: scheduleToTrain(updated) });
});

schedulesRouter.delete('/:id', requireAuth, (req, res) => {
  if (!req.auth || !requireScheduleWriteRole(req.auth.role)) {
    res.status(403).json({ error: 'Forbidden.' });
    return;
  }

  const id = String(req.params.id);
  const ok = deleteSchedule(id);
  if (!ok) {
    res.status(404).json({ error: 'Schedule not found.' });
    return;
  }

  res.status(204).send();
});
