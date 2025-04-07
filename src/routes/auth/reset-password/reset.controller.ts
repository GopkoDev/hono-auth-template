import type { Context } from 'hono';
import { resetPasswordService } from './reset.service.js';

export const resetPasswordController = async (c: Context) => {
  try {
    const { token, pin, password } = c.get('validator').body;

    const result = await resetPasswordService({ token, pin, password });

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
