import { db } from '../../../lib/db.js';
import type { Context } from 'hono';
import { AuthService } from './service.js';

export class UserController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }
  async get(c: Context) {
    const userId = c.get('userId');

    const result = await this.authService.findUser({ userId });

    if (!result.success) {
      return c.json({ error: result.message }, 404);
    }

    return c.json({ user: result.user });
  }
}
