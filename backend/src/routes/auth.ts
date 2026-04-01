import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getDb } from '../config/database.js';
import { signToken, authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// ─── Staff Login ─────────────────────────────────────────────────────────────

const staffLoginSchema = z.object({
  employeeId: z.string().min(1),
  password: z.string().min(1),
});

router.post('/staff/login', authLimiter, async (req, res) => {
  const parse = staffLoginSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'employeeId and password are required' });
    return;
  }

  const { employeeId, password } = parse.data;
  const db = getDb();
  const user = db
    .prepare('SELECT * FROM staff_users WHERE employee_id = ?')
    .get(employeeId) as {
    id: string;
    name: string;
    role: string;
    employee_id: string;
    department: string;
    password_hash: string;
  } | undefined;

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    res.status(401).json({ error: 'Invalid employee ID or password' });
    return;
  }

  const token = signToken({
    sub: user.id,
    role: user.role as 'admin' | 'supervisor' | 'employee',
    employeeId: user.employee_id,
  });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      role: user.role,
      employeeId: user.employee_id,
      department: user.department,
    },
  });
});

// ─── Passenger Login ──────────────────────────────────────────────────────────

const passengerLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

router.post('/passenger/login', authLimiter, async (req, res) => {
  const parse = passengerLoginSchema.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: 'username and password are required' });
    return;
  }

  const { username, password } = parse.data;
  const db = getDb();
  const passenger = db
    .prepare('SELECT * FROM passengers WHERE LOWER(username) = LOWER(?)')
    .get(username) as {
    id: string;
    name: string;
    username: string;
    card_number: string | null;
    password_hash: string;
  } | undefined;

  if (!passenger || !(await bcrypt.compare(password, passenger.password_hash))) {
    res.status(401).json({ error: 'Invalid username or password' });
    return;
  }

  const token = signToken({
    sub: passenger.id,
    role: 'passenger',
    username: passenger.username,
  });

  res.json({
    token,
    user: {
      id: passenger.id,
      name: passenger.name,
      username: passenger.username,
      cardNumber: passenger.card_number ?? undefined,
      role: 'passenger',
    },
  });
});

// ─── Get Current User ─────────────────────────────────────────────────────────

router.get('/me', authLimiter, authenticate, (req, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const db = getDb();

  if (req.user.role === 'passenger') {
    const passenger = db
      .prepare('SELECT id, name, username, card_number FROM passengers WHERE id = ?')
      .get(req.user.sub) as {
      id: string;
      name: string;
      username: string;
      card_number: string | null;
    } | undefined;

    if (!passenger) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: passenger.id,
      name: passenger.name,
      username: passenger.username,
      cardNumber: passenger.card_number ?? undefined,
      role: 'passenger',
    });
    return;
  }

  const user = db
    .prepare('SELECT id, name, role, employee_id, department FROM staff_users WHERE id = ?')
    .get(req.user.sub) as {
    id: string;
    name: string;
    role: string;
    employee_id: string;
    department: string;
  } | undefined;

  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  res.json({
    id: user.id,
    name: user.name,
    role: user.role,
    employeeId: user.employee_id,
    department: user.department,
  });
});

export default router;
