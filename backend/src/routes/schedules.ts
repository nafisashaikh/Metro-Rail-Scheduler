import { Router } from 'express';
import { scheduleData } from '../data/schedules.js';
import { requireAuth } from '../middleware/auth.js';

export const schedulesRouter = Router();

schedulesRouter.get('/', requireAuth, (_req, res) => {
  res.status(200).json({ schedules: scheduleData });
});
