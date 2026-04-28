import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import { getTasks, addTask, updateTask, deleteTask } from '../data/tasks.js';

export const tasksRouter = Router();

function requireStaffRole(role: unknown): boolean {
  return role === 'admin' || role === 'supervisor' || role === 'employee';
}

const taskSchema = z.object({
  title: z.string().min(1).max(100),
  station: z.string().min(1).max(50),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['pending', 'completed']),
  time: z.string()
});

tasksRouter.get('/', requireAuth, (req, res) => {
  if (!req.auth || !requireStaffRole(req.auth.role)) {
    res.status(403).json({ error: 'Forbidden.' });
    return;
  }
  res.status(200).json({ tasks: getTasks() });
});

tasksRouter.post('/', requireAuth, (req, res) => {
  if (!req.auth || !requireStaffRole(req.auth.role)) {
    res.status(403).json({ error: 'Forbidden.' });
    return;
  }
  const parsed = taskSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request payload', details: parsed.error.issues });
    return;
  }
  const created = addTask(parsed.data);
  res.status(201).json({ task: created });
});

tasksRouter.put('/:id', requireAuth, (req, res) => {
  if (!req.auth || !requireStaffRole(req.auth.role)) {
    res.status(403).json({ error: 'Forbidden.' });
    return;
  }
  const parsed = taskSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request payload', details: parsed.error.issues });
    return;
  }
  const updated = updateTask(req.params.id, parsed.data);
  if (!updated) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.status(200).json({ task: updated });
});

tasksRouter.delete('/:id', requireAuth, (req, res) => {
  if (!req.auth || !requireStaffRole(req.auth.role)) {
    res.status(403).json({ error: 'Forbidden.' });
    return;
  }
  const ok = deleteTask(req.params.id);
  if (!ok) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.status(204).send();
});
