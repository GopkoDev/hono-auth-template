import { db } from '../../../config/db.js';
import type { Context } from 'hono';
import { UserService } from './service.js';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public get = async (c: Context) => {
    const userId = c.get('userId');

    const result = await this.userService.findUser({ userId });

    if (!result.success) {
      return c.json({ error: result.message }, 404);
    }

    return c.json({ user: result.user });
  };
}
