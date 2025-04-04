import type { Context } from 'hono';
import type { StatusCode } from 'hono/utils/http-status';

import { config } from '../../envconfig.js';

export const securityHeadersConfig = {
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    frameAncestors: ["'none'"],
  },
  strictTransportSecurity: 'max-age=63072000; includeSubDomains; preload',
  xssProtection: '1; mode=block',
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: 'same-origin',
  crossOriginResourcePolicy: 'same-origin',
  referrerPolicy: 'no-referrer',
};

export const rateLimiterConfig = {
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  keyGenerator: (c: Context) => {
    const ip =
      c.req.header('x-forwarded-for')?.split(',')[0] ||
      c.req.header('x-real-ip') ||
      c.req.header('cf-connecting-ip') ||
      'unknown';

    const userAgent = c.req.header('user-agent') || 'unknown';
    return `${ip}-${userAgent}`;
  },
  message: {
    error: 'Too many requests, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  statusCode: 429 as StatusCode,
};

export const corsConfig = {
  origin: config.server.frontendUrl,
  credentials: true,
  exposeHeaders: ['Content-Type', 'Authorization'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};
