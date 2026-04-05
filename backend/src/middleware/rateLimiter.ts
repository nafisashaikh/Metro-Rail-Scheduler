import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Rate limiting middleware
 * Limits requests per IP address
 */
export function rateLimiter(options: {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const key = `${ip}:${req.path}`;

    // Initialize or get existing record
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      return next();
    }

    // Increment count
    store[key].count++;

    // Check if limit exceeded
    if (store[key].count > options.maxRequests) {
      const resetIn = Math.ceil((store[key].resetTime - now) / 1000);
      return res.status(429).json({
        success: false,
        message: options.message || `Too many requests. Please try again in ${resetIn} seconds.`,
        retryAfter: resetIn,
      });
    }

    next();
  };
}

/**
 * Cleanup old rate limit entries periodically
 */
export function cleanupRateLimitStore() {
  setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
      if (store[key].resetTime < now) {
        delete store[key];
      }
    });
  }, 60000); // Run every minute
}
