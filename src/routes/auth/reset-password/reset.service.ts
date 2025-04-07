import { Prisma } from '@prisma/client';
import { db } from '../../../lib/db.js';
import { hash } from 'bcrypt';

interface resetPasswordServiceRequest {
  token: string;
  pin: string;
  password: string;
}

interface resetPasswordServiceResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export const resetPasswordService = async ({
  token,
  pin,
  password,
}: resetPasswordServiceRequest): Promise<resetPasswordServiceResponse> => {
  try {
    const resetToken = await db.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { success: false, error: 'Invalid reset token' };
    }

    if (resetToken.expiresAt < new Date()) {
      await db.passwordResetToken.delete({ where: { token } });
      return { success: false, error: 'Reset token has expired' };
    }

    if (resetToken.pin !== pin) {
      return { success: false, error: 'Invalid PIN code' };
    }

    const hashedPassword = await hash(password, 10);

    await db.$transaction(
      [
        db.user.update({
          where: { email: resetToken.email },
          data: { password: hashedPassword },
        }),
        db.refreshToken.deleteMany({
          where: { user: { email: resetToken.email } },
        }),
        db.passwordResetToken.delete({
          where: { token },
        }),
      ],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    return {
      success: true,
      message: 'Password reset successfully',
    };
  } catch (error) {
    console.error('[RESET PASSWORD] Error:', error);
    return { success: false, error: 'Failed to reset password' };
  }
};
