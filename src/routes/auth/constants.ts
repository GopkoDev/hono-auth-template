import { config } from '../../../envconfig.js';

const TIME = {
  SECOND: 1, // 1s
  MINUTE: 60, // 60 s
  HOUR: 60 * 60, // 3600 s
  DAY: 24 * 60 * 60, // 86400 s
} as const;

export const AUTH_CONFIG = {
  ACCESS_TOKEN_EXPIRY: 1 * TIME.HOUR, // 1h in seconds
  REFRESH_TOKEN_EXPIRY: 7 * TIME.DAY, // 7d in seconds
  VERIFICATION_EXPIRY: 24 * TIME.HOUR, // 24h in seconds
  PASSWORD_RESET_EXPIRY: 1 * TIME.HOUR, // 1h in seconds

  COOKIE_KEY: 'refreshToken',
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: config.server.nodeEnv === 'development' ? false : true,
    sameSite: 'Lax',
    path: '/api/auth',
    maxAge: 7 * TIME.DAY,
  },
} as const;
