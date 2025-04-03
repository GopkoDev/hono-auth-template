import type { Context } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { compare, hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from '../../lib/db.js';
import { generateTokens } from './service.js';
import { loginSchema, registerSchema } from './validation.js';

const REFRESH_SECRET: string = process.env.REFRESH_SECRET || '';

if (!REFRESH_SECRET) {
  throw new Error('REFRESH_SECRET is not defined in the environment variables');
}

export class AuthController {
  async register(c: Context) {
    try {
      const body = await c.req.json();

      const parsedData = registerSchema.safeParse(body);
      if (!parsedData.success) {
        return c.json({ error: parsedData.error.errors }, 400);
      }

      const { name, email, password } = parsedData.data;

      if (!password || !email) {
        return c.json({ error: 'Email and password are required' }, 400);
      }

      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        return c.json({ error: 'User already exists' }, 400);
      }

      const hashedPassword = await hash(password, 10);

      const user = await db.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      return c.json({ message: '[REGISTER] User created successfully', user });
    } catch (error) {
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  async login(c: Context) {
    try {
      const body = await c.req.json();
      const parsedData = loginSchema.safeParse(body);
      if (!parsedData.success) {
        return c.json({ error: parsedData.error.errors }, 400);
      }
      const { email, password } = parsedData.data;

      if (!password || !email) {
        return c.json({ error: 'Email and password are required' }, 400);
      }

      const user = await db.user.findUnique({ where: { email } });

      if (!user || !(await compare(password, user.password || ''))) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      const { accessToken, refreshToken } = generateTokens(user.id);
      await db.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      setCookie(c, 'refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
      });
      return c.json({ accessToken });
    } catch (error) {
      return c.json({ error: '[LOGIN] Internal server error' }, 500);
    }
  }

  async logout(c: Context) {
    try {
      const refreshToken = getCookie(c, 'refreshToken');
      if (refreshToken) {
        await db.refreshToken.delete({ where: { token: refreshToken } });
      }

      deleteCookie(c, 'refreshToken');
      return c.json({ message: 'Logged out' });
    } catch (error) {
      return c.json({ error: '[LOGOUT] Internal server error' }, 500);
    }
  }

  async refresh(c: Context) {
    try {
      const refreshToken = getCookie(c, 'refreshToken');
      if (!refreshToken) return c.json({ error: 'No refresh token' }, 401);

      const payload = jwt.verify(refreshToken, REFRESH_SECRET) as {
        userId: string;
      };
      const dbToken = await db.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!dbToken) return c.json({ error: 'Invalid refresh token' }, 401);
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(
        payload.userId
      );

      await db.refreshToken.update({
        where: { id: dbToken.id },
        data: {
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      setCookie(c, 'refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
      });
      return c.json({ accessToken });
    } catch (error) {
      return c.json({ error: '[REFRESH] Internal server error' }, 500);
    }
  }

  async resetPassword(c: Context) {}
  async forgotPassword(c: Context) {}
  async verifyEmailToken(c: Context) {}
  async verifyEmailTokenResend(c: Context) {}
}
