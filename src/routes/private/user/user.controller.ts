import type { Context } from 'hono';
import {
  getUserService,
  updatePasswordService,
  updateUserService,
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
