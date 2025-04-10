import type { Context } from 'hono';
import {
  disableTwoFactorService,
  generateTwoFactorService,
  verifyTwoFactorService,
} from './two-factor.service.js';

export const generateTwoFactorController = async (c: Context) => {
  try {
    const userId = c.get('userId');
    const response = await generateTwoFactorService({ userId });

    if (!response.success) {
      return c.json(
        {
          success: false,
          error: response.error,
        },
        response.code
      );
    }

    return c.json({
      success: true,
      secret: response.secret,
      qrCodeUrl: response.qrCodeUrl,
    });
  } catch (error) {
    console.error('[TWO FACTOR GENERATE] Error:', error);
    return c.json(
      {
        success: false,
        error: 'Failed to generate two-factor authentication',
      },
      500
    );
  }
};

export const verifyTwoFactorController = async (c: Context) => {
  try {
    const userId = c.get('userId');
    const { token } = await c.req.json();

    const response = await verifyTwoFactorService({
      userId,
      token,
    });

    if (!response.success) {
      return c.json({ error: response.error }, response.code || 500);
    }

    return c.json({ message: response.message, success: response.success });
  } catch (error) {
    console.error('[TWO FACTOR VERIFY] Error:', error);
    return c.json({ error: 'Failed to verify two-factor authentication' }, 500);
  }
};

export const disableTwoFactorController = async (c: Context) => {
  try {
    const userId = c.get('userId');
    const { token } = await c.req.json();
    const response = await disableTwoFactorService({ userId, token });

    if (!response.success) {
      return c.json({ error: response.error }, response.code || 500);
    }

    return c.json({ message: response.message, success: response.success });
  } catch (error) {
    console.error('[TWO FACTOR DISABLE] Error:', error);
    return c.json(
      { error: 'Failed to disable two-factor authentication' },
      500
    );
  }
};
