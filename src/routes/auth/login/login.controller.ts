import type { Context } from 'hono';
import { loginService } from './login.service.js';
import { setCookie } from 'hono/cookie';
import { AUTH_CONFIG } from '../constants.js';

const {
  COOKIE_KEY,
  COOKIE_OPTIONS: { httpOnly, secure, sameSite, path, maxAge },
} = AUTH_CONFIG;

export const loginController = async (c: Context) => {
  try {
    const { email, password, mfaToken } = c.get('validator').body;

    const result = await loginService({
      email,
      inputPassword: password,
      mfaToken,
    });

    if (!result.success) {
      if (result.canResend) {
        return c.json({ error: result.error, canResend: true, email }, 401);
      }

      if (result.requiresTwoFactor) {
        return c.json(
          {
            error: result.error,
            details: {
              requiresTwoFactor: true,
            },
          },
          401
        );
      }
      return c.json({ error: result.error }, 401);
    }

    setCookie(c, COOKIE_KEY, result.tokens!.refreshToken, {
      httpOnly,
      secure,
      sameSite,
      path,
      maxAge,
    });

    return c.json({
      accessToken: result.tokens!.accessToken,
      user: result.user,
    });
  } catch (error) {
    console.error('[LOGIN] Error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};
