import type { Context } from 'hono';
import { deleteCookie, getCookie } from 'hono/cookie';
import { AUTH_CONFIG } from '../constants.js';
import { logoutService } from './logout.service.js';

const {
  COOKIE_KEY,
  COOKIE_OPTIONS: { secure, path },
} = AUTH_CONFIG;

export const logoutController = async (c: Context) => {
  try {
    const refreshToken = getCookie(c, COOKIE_KEY);
    const result = await logoutService({ refreshToken });

    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }

    deleteCookie(c, COOKIE_KEY, {
      path,
      secure,
    });

    return c.json({ message: result.message });
  } catch (error) {
    console.error('[LOGOUT] Error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};
