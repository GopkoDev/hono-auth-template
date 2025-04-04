const TIME = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
} as const;

export const AUTH_CONFIG = {
  ACCESS_TOKEN_EXPIRY: 4 * TIME.HOUR, // 4h
  REFRESH_TOKEN_EXPIRY: 7 * TIME.DAY, // 7d
  VERIFICATION_EXPIRY: 24 * TIME.HOUR, // 24h
  PASSWORD_RESET_EXPIRY: 1 * TIME.HOUR, // 1h

  COOKIE_KEY: 'refreshToken',
  COOKIE_OPTIONS: {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict' as const,
    path: '/api/auth',
    maxAge: 7 * TIME.DAY, // 7d
  },
} as const;
