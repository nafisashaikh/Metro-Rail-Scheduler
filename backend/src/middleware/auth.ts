import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { LoginTokenPayload } from '../types/auth.js';

declare global {
  namespace Express {
    interface Request {
      auth?: LoginTokenPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid authorization header.' });
    return;
  }

  const token = header.slice('Bearer '.length);
  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.auth = {
      sub: String(payload.sub),
      role: payload.role as LoginTokenPayload['role'],
    };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}
