import { Request, Response, NextFunction } from 'express';

const SUSPICIOUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
];

export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  const sanitize = (value: unknown): unknown => {
    if (typeof value === 'string') {
      let sanitized = value.trim();
      for (const pattern of SUSPICIOUS_PATTERNS) {
        sanitized = sanitized.replace(pattern, '');
      }
      return sanitized;
    }
    if (Array.isArray(value)) {
      return value.map(sanitize);
    }
    if (value !== null && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([k, v]) => [k, sanitize(v)])
      );
    }
    return value;
  };

  if (req.body && typeof req.body === 'object') {
    req.body = sanitize(req.body) as typeof req.body;
  }

  next();
}
