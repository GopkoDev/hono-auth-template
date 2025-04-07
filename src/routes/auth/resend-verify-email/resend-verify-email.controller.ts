import type { Context } from 'hono';
import { resendVerifyEmailService } from './resend-verify-email.service.js';

export const resendVerifyEmailController = async (c: Context) => {
  try {
    const { email } = c.get('validator').body;

    const result = await resendVerifyEmailService(email);

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
