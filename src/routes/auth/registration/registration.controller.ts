import type { Context } from 'hono';
import { registrationService } from './registration.service.js';

export const registrationController = async (c: Context) => {
  try {
    const { name, email, password } = c.get('validator').body;

    const result = await registrationService({ name, email, password });

    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }

    return c.json({ message: result.message, path: result.path });
  } catch (error) {
    console.error('[REGISTER] Error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};
