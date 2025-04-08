import { compare } from 'bcrypt';
import { db } from '../../../config/db.js';
import type { Tokens } from '../_helpers/generate-tokens.js';
import type { User } from '@prisma/client';
import { generateTokens } from '../_helpers/generate-tokens.js';
import { AUTH_CONFIG } from '../constants.js';

interface LoginServiceRequest {
  email: string;
  inputPassword: string;
}

interface LoginServiceResponse {
  success: boolean;
  tokens?: Tokens;
  user?: Omit<User, 'password'>;
  error?: string;
  canResend?: boolean;
}

export const loginService = async ({
  email,
  inputPassword,
}: LoginServiceRequest): Promise<LoginServiceResponse> => {
  try {
    const user = await db.user.findUnique({ where: { email } });

    if (!user || !(await compare(inputPassword, user.password || ''))) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (!user.emailVerified) {
      return {
        success: false,
        error: 'Email not verified',
        canResend: true,
      };
    }

    const tokens = generateTokens(user.id);
    await db.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(
          Date.now() + AUTH_CONFIG.REFRESH_TOKEN_EXPIRY * 1000
        ),
      },
    });

    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      tokens,
      user: userWithoutPassword,
    };
  } catch (error) {
    console.error('[LOGIN] Error:', error);
    return { success: false, error: 'Failed to login' };
  }
};
