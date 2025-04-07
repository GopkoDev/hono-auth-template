import type { Context } from 'hono';
import { verifyEmailService } from './verify-email.service.js';
import { setCookie } from 'hono/cookie';
import { AUTH_CONFIG } from '../constants.js';

const {
  COOKIE_KEY,
  COOKIE_OPTIONS: { httpOnly, secure, sameSite, path, maxAge },
} = AUTH_CONFIG;

export const verifyEmailController = async (c: Context) => {
  try {
    const { pin, token } = c.get('validator').body;

    const result = await verifyEmailService({ pin, token });

    if (!result.success) {
      if (result.canResend) {
        return c.json(
          {
            error: result.error,
            canResend: true,
            email: result.email,
          },
          400
        );
      }
      return c.json({ error: result.error }, 400);
    }

    setCookie(c, COOKIE_KEY, result.tokens!.refreshToken, {
      httpOnly,
      secure,
      sameSite,
      path,
      maxAge,
    });

    return c.json({
      message: result.message,
      accessToken: result.tokens!.accessToken,
      user: result.user,
    });
  } catch (error) {
    console.error('[VERIFY EMAIL] Error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};
