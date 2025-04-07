import type { Context, Next } from 'hono';
import jwt from 'jsonwebtoken';
import { verifyToken } from '../routes/auth/_helpers/verify-token.js';

declare module 'hono' {
  interface ContextVariables {
    userId: string;
  }
}

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const token = authHeader.split(' ')[1];
    const result = verifyToken(token);

    if (!result.valid) {
      return c.json(
        {
          error: 'Invalid token',
          code: 'TOKEN_INVALID',
        },
        401
      );
    }

    c.set('userId', result.userId!);
    await next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return c.json(
        {
          error: 'Token expired',
          code: 'TOKEN_EXPIRED',
        },
        401
      );
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return c.json(
        {
          error: 'Invalid token',
          code: 'TOKEN_INVALID',
        },
        401
      );
    }
    return c.json(
      {
        error: 'Authentication failed',
        code: 'AUTH_FAILED',
      },
      401
    );
  }
};
