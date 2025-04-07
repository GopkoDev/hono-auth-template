import { compare } from 'bcrypt';
import { db } from '../../../lib/db.js';
import type { Tokens } from '../types.js';
import type { User } from '@prisma/client';
import { generateTokens } from '../_helpers/generateTokens.js';
import { AUTH_CONFIG } from '../constants.js';

interface LoginServiceRequest {
  email: string;
  password: string;
}

interface LoginServiceResponse {
  success: boolean;
  tokens?: Tokens;
  user?: User;
  error?: string;
  canResend?: boolean;
}

export const loginService = async ({
  email,
  password,
}: LoginServiceRequest): Promise<LoginServiceResponse> => {
  try {
    const user = await db.user.findUnique({ where: { email } });

    if (!user || !(await compare(password, user.password || ''))) {
      return { success: false, error: 'Invalid credentials' };
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

    return {
      success: true,
      tokens,
      user,
    };
  } catch (error) {
    console.error('[LOGIN] Error:', error);
    return { success: false, error: 'Failed to login' };
  }
};
