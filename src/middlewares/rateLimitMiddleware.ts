import type { Context, Next } from 'hono';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { rateLimiterConfig } from '../config/security.js';

const rateLimiter = new RateLimiterRedis(rateLimiterConfig);

export const rateLimiterMiddleware = async (c: Context, next: Next) => {
  if (c.req.path.endsWith('/api/auth/logout')) {
    return next();
  }

  try {
    const ip =
      c.req.header('x-forwarded-for')?.split(',')[0].trim() ||
      c.req.header('x-real-ip') ||
      c.req.header('cf-connecting-ip') ||
      c.env.incoming.socket.remoteAddress ||
      'unknown';
    const url = c.req.url;
    const key = `${url}_${ip}`;

    await rateLimiter.consume(key);
    await next();
  } catch (error) {
    return c.json(
      {
        error: 'Too many requests, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
      },
      429
    );
  }
};
