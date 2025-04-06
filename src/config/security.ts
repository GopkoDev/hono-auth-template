import { config } from '../../envconfig.js';
import { redis } from './redis.js';

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
  storeClient: redis,
  keyPrefix: 'rate_limit',
  points: 10,
  duration: 60, //seconds
  blockDuration: 60, //seconds
};

export const corsConfig = {
  origin: config.server.frontendUrl,
  credentials: true,
  exposeHeaders: ['Content-Type', 'Authorization'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};
