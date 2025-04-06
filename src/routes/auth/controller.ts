import type { Context } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { AuthService } from './service.js';
import { AUTH_CONFIG } from './constants.js';

const {
  COOKIE_KEY,
  COOKIE_OPTIONS: { httpOnly, secure, sameSite, path, maxAge },
} = AUTH_CONFIG;

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public register = async (c: Context) => {
    try {
      const { name, email, password } = c.get('validator').body;

      const result = await this.authService.registerUser(name, email, password);

      if (!result.success) {
        return c.json({ error: result.error }, 400);
      }

      return c.json({ message: result.message, path: result.path });
    } catch (error) {
      console.error('[REGISTER] Error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  };

  public login = async (c: Context) => {
    try {
      const { email, password } = c.get('validator').body;

      const result = await this.authService.loginUser(email, password);

      if (!result.success) {
        if (result.canResend) {
          return c.json({ error: result.error, canResend: true, email }, 401);
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

  public logout = async (c: Context) => {
    try {
      const refreshToken = getCookie(c, COOKIE_KEY);
      const result = await this.authService.logoutUser(refreshToken);

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

  public refresh = async (c: Context) => {
    try {
      const refreshToken = getCookie(c, COOKIE_KEY);

      const result = await this.authService.refreshAccessToken(refreshToken);

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

  public verifyEmailToken = async (c: Context) => {
    try {
      const { pin, token } = c.get('validator').body;

      const result = await this.authService.verifyEmail(pin, token);

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

  public verifyEmailTokenResend = async (c: Context) => {
    try {
      const { email } = c.get('validator').body;

      const result = await this.authService.resendVerificationEmail(email);

      if (!result.success) {
        return c.json({ error: result.error }, 400);
      }

      return c.json({
        message: result.message,
        path: result.path,
      });
    } catch (error) {
      console.error('[VERIFY EMAIL RESEND] Error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  };

  public forgotPassword = async (c: Context) => {
    try {
      const { email } = c.get('validator').body;

      const result = await this.authService.forgotPassword(email);

      if (!result.success) {
        return c.json({ error: result.error }, 400);
      }

      return c.json({
        message: result.message,
        email,
        path: result.path,
      });
    } catch (error) {
      console.error('[FORGOT PASSWORD] Error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  };

  public resetPassword = async (c: Context) => {
    try {
      const { token, pin, password } = c.get('validator').body;

      const result = await this.authService.resetPassword(token, pin, password);

      if (!result.success) {
        return c.json({ error: result.error }, 400);
      }

      return c.json({
        message: result.message,
      });
    } catch (error) {
      console.error('[RESET PASSWORD] Error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  };
}
