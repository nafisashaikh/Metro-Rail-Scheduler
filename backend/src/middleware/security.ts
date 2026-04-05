import { Request, Response, NextFunction } from 'express';

/**
 * Input sanitization middleware
 * Removes potentially dangerous characters and patterns
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query params
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
}

function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (obj && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key]);
    }
    return sanitized;
  }

  return obj;
}

function sanitizeString(str: string): string {
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .trim();
}

/**
 * HTTPS enforcement middleware (for production)
 */
export function enforceHTTPS(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'production' && !req.secure && req.get('X-Forwarded-Proto') !== 'https') {
    return res.redirect(`https://${req.get('host')}${req.url}`);
  }
  next();
}

/**
 * Security headers middleware
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  );
  
  // HTTP Strict Transport Security (HSTS)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
}

/**
 * Request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const { method, url, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    
    // Log format: [timestamp] METHOD /path STATUS (duration ms) IP
    console.log(
      `[${new Date().toISOString()}] ${method} ${url} ${statusCode} (${duration}ms) ${ip}`
    );

    // Log sensitive operations
    if (url.includes('/users/register') || url.includes('/users/verify-otp')) {
      console.log(`  → Security: ${method} ${url} from ${ip}`);
    }
  });

  next();
}
