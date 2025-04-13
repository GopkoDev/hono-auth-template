import { getCookie, setCookie } from 'hono/cookie';
import { AUTH_CONFIG } from '../constants.js';
import type { Context } from 'hono';
import { refreshTokenService } from './refresh.service.js';

const {
  COOKIE_KEY,
  COOKIE_OPTIONS: { httpOnly, secure, sameSite, path, maxAge },
} = AUTH_CONFIG;

export const refreshTokenController = async (c: Context) => {
  try {
    const refreshToken = getCookie(c, COOKIE_KEY);

    console.log('refreshToken', refreshToken);

    const result = await refreshTokenService({ refreshToken });

    console.log('result', result);

    if (!result.success) {
      return c.json({ error: result.error }, 401);
    }

    setCookie(c, COOKIE_KEY, result.newRefreshToken!, {
      httpOnly,
      secure,
      sameSite,
      path,
      maxAge,
    });

    return c.json({ accessToken: result.accessToken });
  } catch (error) {
    console.error('[REFRESH] Error:', error);
    return c.json({ error: '[REFRESH] Internal server error' }, 500);
  }
};
