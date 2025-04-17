import type { Context } from 'hono';
import {
  getUserService,
  initiateEmailUpdateService,
  updatePasswordService,
  updateUserService,
  verifyEmailUpdateService,
} from './user.service.js';

export const getUserController = async (c: Context) => {
  try {
    const userId = c.get('userId');

    const result = await getUserService({ userId });

    if (!result.success) {
      return c.json({ error: result.message }, 404);
    }

    return c.json({ user: result.user });
  } catch (error) {
    console.error('Error in getUserController:', error);
    return c.json({ success: false, message: 'Internal server error' }, 500);
  }
};

export const updateUserController = async (c: Context) => {
  try {
    const userId = c.get('userId');
    const { name, avatar } = c.get('validator').body;

    const result = await updateUserService({ userId, name, avatar });

    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }

    return c.json({ user: result.user });
  } catch (error) {
    console.error('[UPDATE USER] Error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const updatePasswordController = async (c: Context) => {
  try {
    const userId = c.get('userId');
    const { currentPassword, newPassword, logoutAllDevices } =
      c.get('validator').body;

    const result = await updatePasswordService({
      userId,
      currentPassword,
      newPassword,
      logoutAllDevices,
    });

    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }

    return c.json({ message: result.message });
  } catch (error) {
    console.error('[UPDATE PASSWORD] Error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const initiateEmailUpdateController = async (c: Context) => {
  try {
    const userId = c.get('userId');
    const { newEmail } = c.get('validator').body;

    const result = await initiateEmailUpdateService({ userId, newEmail });

    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }

    return c.json({ message: result.message, token: result.token });
  } catch (error) {
    console.error('[INITIATE EMAIL UPDATE] Error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};

export const verifyEmailUpdateController = async (c: Context) => {
  try {
    const userId = c.get('userId');
    const { pin, token } = c.get('validator').body;

    const result = await verifyEmailUpdateService({ userId, pin, token });

    if (!result.success) {
      return c.json({ error: result.error }, 400);
    }

    return c.json({ message: result.message, user: result.user });
  } catch (error) {
    console.error('[VERIFY EMAIL UPDATE] Error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
};
