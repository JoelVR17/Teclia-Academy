import rateLimit from 'express-rate-limit';

const createLimiter = (options) =>
  rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
      });
    },
  });

export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
});
