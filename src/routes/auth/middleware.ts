import type { Context } from 'hono';
import jwt from 'jsonwebtoken';
import { createMiddleware } from 'hono/factory';

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';

// Middleware для перевірки JWT токену
export const verifyToken = createMiddleware(
  async (c: Context, next: Function) => {
    const authorizationHeader = c.req.header('Authorization');
    if (!authorizationHeader) {
      return c.json({ error: 'No token provided' }, 401);
    }

    const token = authorizationHeader.split(' ')[1];
    if (!token) {
      return c.json({ error: 'Token not provided' }, 401);
    }

    try {
      // Перевірка токену
      const decoded = jwt.verify(token, SECRET_KEY);
      c.set('user', decoded);
      return next();
    } catch (error) {
      return c.json({ error: 'Invalid token' }, 401);
    }
  }
);
