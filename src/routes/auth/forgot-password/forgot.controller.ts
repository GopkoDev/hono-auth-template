import type { Context } from 'hono';
import { forgotService } from './forgot.service.js';

export const forgotController = async (c: Context) => {
  try {
    const { email } = c.get('validator').body;

    const result = await forgotService(email);

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
