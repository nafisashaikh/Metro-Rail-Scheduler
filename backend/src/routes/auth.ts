import { Router } from 'express';
import jwt from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import {
  createPassengerUser,
  findUserForLogin,
  findUserById,
  isPassengerUsernameTaken,
  toPublicUser,
} from '../data/users.js';
import { requireAuth } from '../middleware/auth.js';
import { hashPassword, verifyScryptPassword } from '../utils/password.js';

const loginSchema = z.object({
  role: z.enum(['admin', 'supervisor', 'employee', 'passenger']),
  identifier: z.string().min(1),
  password: z.string().min(1),
});

const signupSchema = z.object({
  name: z.string().min(2).max(80),
  username: z
    .string()
    .min(4)
    .max(30)
    .regex(/^[a-zA-Z0-9._@-]+$/),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(128)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
      'Password must include uppercase, lowercase, number, and special character.'
    ),
  cardNumber: z.string().max(40).optional(),
});

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request payload.', details: parsed.error.issues });
    return;
  }

  const { role, identifier, password } = parsed.data;
  const user = findUserForLogin(role, identifier);

  if (!user) {
    res.status(401).json({ error: 'Invalid credentials.' });
    return;
  }

  const validPassword = verifyScryptPassword(password, user.passwordSaltHex, user.passwordHashHex);
  if (!validPassword) {
    res.status(401).json({ error: 'Invalid credentials.' });
    return;
  }

  const token = jwt.sign({ role: user.role }, env.jwtSecret as Secret, {
    subject: user.id,
    expiresIn: env.jwtExpiresIn,
  } as SignOptions);

  res.status(200).json({ token, user: toPublicUser(user) });
});

authRouter.post('/signup/passenger', (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    res.status(400).json({
      error: firstIssue?.message ?? 'Invalid request payload.',
      details: parsed.error.issues,
    });
    return;
  }

  const { name, username, password, cardNumber } = parsed.data;
  if (isPassengerUsernameTaken(username)) {
    res.status(409).json({ error: 'Username already exists.' });
    return;
  }

  const { saltHex, hashHex } = hashPassword(password);
  const newUser = createPassengerUser({
    name,
    username,
    passwordSaltHex: saltHex,
    passwordHashHex: hashHex,
    cardNumber,
  });

  const token = jwt.sign({ role: newUser.role }, env.jwtSecret as Secret, {
    subject: newUser.id,
    expiresIn: env.jwtExpiresIn,
  } as SignOptions);

  res.status(201).json({ token, user: toPublicUser(newUser) });
});

authRouter.get('/me', requireAuth, (req, res) => {
  if (!req.auth) {
    res.status(401).json({ error: 'Unauthorized.' });
    return;
  }

  const user = findUserById(req.auth.sub);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  res.status(200).json({ user: toPublicUser(user) });
});
