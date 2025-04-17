import { compare, hash } from 'bcrypt';
import { db } from '../../../config/db.js';
import {
  prepareUserForClient,
  type SafeUser,
} from '../../../utils/user/prepare-user.js';
import { sendEmail } from '../../../lib/sendEmail.js';
import { generateMailPin } from '../../../helpers/mail-pin.helper.js';
import { generateUuidToken } from '../../../helpers/uuid.helper.js';
import { renderChangeEmailAddressEmail } from '../../../mails/user/render-email-change.js';

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

interface initiateEmailUpdateParams {
  userId: string;
  newEmail: string;
}
interface initiateEmailUpdateResponse {
  success: boolean;
  message?: string;
  error?: string;
  token?: string;
}

export const initiateEmailUpdateService = async ({
  userId,
  newEmail,
}: initiateEmailUpdateParams): Promise<initiateEmailUpdateResponse> => {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  const existingUser = await db.user.findUnique({ where: { email: newEmail } });
  if (existingUser) {
    return { success: false, error: 'Email already in use' };
  }

  const pin = generateMailPin();
  const token = generateUuidToken();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5min

  const existingToken = await db.emailVerificationToken.findFirst({
    where: {
      email: newEmail,
      type: 'EMAIL_CHANGE',
    },
  });

  if (existingToken) {
    await db.emailVerificationToken.update({
      where: { id: existingToken.id },
      data: {
        email: newEmail,
        token,
        pin,
        expiresAt,
      },
    });
  } else {
    await db.emailVerificationToken.create({
      data: {
        email: newEmail,
        token,
        pin,
        type: 'EMAIL_CHANGE',
        expiresAt,
      },
    });
  }

  const emailContent = await renderChangeEmailAddressEmail({
    username: user.name || 'User',
    pin,
  });

  await sendEmail({
    email: newEmail,
    subject: 'Verify your new email',
    html: emailContent,
  });

  return { success: true, message: 'Verification email sent', token };
};

interface verifyEmailUpdateParams {
  userId: string;
  pin: string;
  token: string;
}

interface verifyEmailUpdateResponse {
  success: boolean;
  message?: string;
  error?: string;
  user?: SafeUser;
}

export const verifyEmailUpdateService = async ({
  userId,
  pin,
  token,
}: verifyEmailUpdateParams): Promise<verifyEmailUpdateResponse> => {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  const verificationToken = await db.emailVerificationToken.findFirst({
    where: { token, type: 'EMAIL_CHANGE' },
  });

  if (!verificationToken) {
    return { success: false, error: 'Invalid token' };
  }

  if (verificationToken.expiresAt < new Date()) {
    return { success: false, error: 'Token expired' };
  }

  if (verificationToken.pin !== pin) {
    return { success: false, error: 'Invalid pin' };
  }

  const updatedUser = await db.user.update({
    where: { id: userId },
    data: {
      email: verificationToken.email,
      emailVerified: new Date(),
    },
  });

  await db.emailVerificationToken.delete({
    where: { id: verificationToken.id },
  });

  return {
    success: true,
    message: 'Email updated successfully',
    user: prepareUserForClient(updatedUser),
  };
};
