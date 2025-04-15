import { compare, hash } from 'bcrypt';
import { db } from '../../../config/db.js';
import {
  prepareUserForClient,
  type SafeUser,
} from '../../../utils/user/prepare-user.js';

interface GetUserParams {
  userId: string;
}

interface GetUserResponse {
  success: boolean;
  message?: string;
  user?: SafeUser;
}

export const getUserService = async ({
  userId,
}: GetUserParams): Promise<GetUserResponse> => {
  const user = await db.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return { success: false, message: 'User not found' };
  }

  const safeUser = prepareUserForClient(user);

  return { success: true, user: safeUser };
};

interface UpdateUserParams {
  userId: string;
  name?: string;
  avatar?: string;
}
interface UpdateUserResponse {
  success: boolean;
  user?: SafeUser;
  error?: string;
}

export const updateUserService = async ({
  userId,
  name,
  avatar,
}: UpdateUserParams): Promise<UpdateUserResponse> => {
  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      ...(name && { name }),
      ...(avatar && { photoUrl: avatar }),
    },
  });

  if (!updatedUser) {
    return { success: false, error: 'Failed to update user' };
  }

  return {
    success: true,
    user: prepareUserForClient(updatedUser),
  };
};

interface UpdatePasswordParams {
  userId: string;
  currentPassword: string;
  newPassword: string;
  logoutAllDevices?: boolean;
}

interface UpdatePasswordResponse {
  success: boolean;
  user?: SafeUser;
  message?: string;
  error?: string;
}

export const updatePasswordService = async ({
  userId,
  currentPassword,
  newPassword,
  logoutAllDevices = false,
}: UpdatePasswordParams): Promise<UpdatePasswordResponse> => {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      return { success: false, error: 'User not found' };
    }

    const isValid = await compare(currentPassword, user.password);

    if (!isValid) {
      return { success: false, error: 'Current password is incorrect' };
    }

    const hashedPassword = await hash(newPassword, 10);

    const [updatedUser] = await db.$transaction([
      db.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      }),
      ...(logoutAllDevices
        ? [
            db.refreshToken.deleteMany({
              where: { userId },
            }),
          ]
        : []),
    ]);

    if (!updatedUser) {
      return { success: false, error: 'Failed to update password' };
    }
    return {
      success: true,
      message: 'Password updated successfully',
      user: prepareUserForClient(updatedUser),
    };
  } catch (error) {
    console.error('[UPDATE PASSWORD] Error:', error);
    return { success: false, error: 'Failed to update password' };
  }
};
