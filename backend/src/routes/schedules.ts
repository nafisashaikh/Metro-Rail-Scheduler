import { Router } from 'express';
import { z } from 'zod';
import { scheduleData, ScheduleItem } from '../data/schedules.js';
import { requireAuth } from '../middleware/auth.js';

export const schedulesRouter = Router();

const scheduleSchema = z.object({
  line: z.string().min(1, 'Line is required'),
  from: z.string().min(1, 'Departure station is required'),
  to: z.string().min(1, 'Destination station is required'),
  departureTime: z.string().regex(/^\d{2}:\d{2}$/, 'Invalid time format (HH:MM)'),
  platform: z.string().min(1, 'Platform is required'),
  status: z.enum(['on-time', 'delayed', 'arriving']).default('on-time'),
});

type ScheduleCreate = z.infer<typeof scheduleSchema>;

// GET all schedules
schedulesRouter.get('/', requireAuth, (_req, res) => {
  res.status(200).json({ schedules: scheduleData });
});

// GET schedule by ID
schedulesRouter.get('/:id', requireAuth, (req, res) => {
  const schedule = scheduleData.find((s) => s.id === req.params.id);
  if (!schedule) {
    res.status(404).json({ error: 'Schedule not found' });
    return;
  }
  res.status(200).json({ schedule });
});

// POST - Create new schedule (admin only)
schedulesRouter.post('/', requireAuth, (req, res) => {
  if (req.auth?.role !== 'admin') {
    res.status(403).json({ error: 'Only admins can create schedules' });
    return;
  }

  const parsed = scheduleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid schedule data', details: parsed.error.issues });
    return;
  }

  const newSchedule: ScheduleItem = {
    id: `sch-${Date.now()}`,
    ...parsed.data,
  };

  scheduleData.push(newSchedule);
  res.status(201).json({ schedule: newSchedule, message: 'Schedule created successfully' });
});

// PUT - Update schedule (admin only)
schedulesRouter.put('/:id', requireAuth, (req, res) => {
  if (req.auth?.role !== 'admin') {
    res.status(403).json({ error: 'Only admins can update schedules' });
    return;
  }

  const scheduleIndex = scheduleData.findIndex((s) => s.id === req.params.id);
  if (scheduleIndex === -1) {
    res.status(404).json({ error: 'Schedule not found' });
    return;
  }

  const parsed = scheduleSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid schedule data', details: parsed.error.issues });
    return;
  }

  const updatedSchedule: ScheduleItem = {
    id: req.params.id,
    ...parsed.data,
  };

  scheduleData[scheduleIndex] = updatedSchedule;
  res.status(200).json({ schedule: updatedSchedule, message: 'Schedule updated successfully' });
});

// DELETE - Delete schedule (admin only)
schedulesRouter.delete('/:id', requireAuth, (req, res) => {
  if (req.auth?.role !== 'admin') {
    res.status(403).json({ error: 'Only admins can delete schedules' });
    return;
  }

  const scheduleIndex = scheduleData.findIndex((s) => s.id === req.params.id);
  if (scheduleIndex === -1) {
    res.status(404).json({ error: 'Schedule not found' });
    return;
  }

  const deletedSchedule = scheduleData.splice(scheduleIndex, 1)[0];
  res.status(200).json({ schedule: deletedSchedule, message: 'Schedule deleted successfully' });
});
