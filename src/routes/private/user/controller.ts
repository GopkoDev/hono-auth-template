import { db } from '../../../lib/db.js';
import type { Context } from 'hono';

export class UserController {
  async get(c: Context) {
    const userId = c.get('userId');
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    return c.json({ user });
  }
}
