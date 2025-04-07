import { db } from '../../../config/db.js';
import { generateTokens, type Tokens } from '../_helpers/generateTokens.js';
import { Prisma, type User } from '@prisma/client';
import { AUTH_CONFIG } from '../constants.js';

interface VerifyEmailServiceRequest {
  pin: string;
  token: string;
}

interface VerifyEmailServiceResponse {
  success: boolean;
  message?: string;
  tokens?: Tokens;
  user?: User;
  error?: string;
  canResend?: boolean;
  email?: string;
}

export const verifyEmailService = async ({
  pin,
  token,
}: VerifyEmailServiceRequest): Promise<VerifyEmailServiceResponse> => {
  try {
    const verificationToken = await db.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return { success: false, error: 'Invalid token' };
    }

    if (verificationToken.expiresAt < new Date()) {
      await db.emailVerificationToken.delete({
        where: { token },
      });

      return {
        success: false,
        error: 'Verification token has expired. Please request a new one.',
        canResend: true,
        email: verificationToken.email,
      };
    }

    if (verificationToken.pin !== pin) {
      return { success: false, error: 'Invalid pin' };
    }

    const user = await db.user.findUnique({
      where: { email: verificationToken.email },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'User already verified' };
    }

    const tokens = generateTokens(user.id);

    await db.$transaction(
      [
        db.user.update({
          where: { email: verificationToken.email },
          data: { emailVerified: new Date() },
        }),
        db.emailVerificationToken.delete({
          where: { token },
        }),
        db.refreshToken.create({
          data: {
            token: tokens.refreshToken,
            userId: user.id,
            expiresAt: new Date(
              Date.now() + AUTH_CONFIG.REFRESH_TOKEN_EXPIRY * 1000
            ),
          },
        }),
      ],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    return {
      success: true,
      message: 'Email verified successfully',
      tokens,
      user,
    };
  } catch (error) {
    console.error('[VERIFY EMAIL] Error:', error);
    return { success: false, error: 'Failed to verify email' };
  }
};
