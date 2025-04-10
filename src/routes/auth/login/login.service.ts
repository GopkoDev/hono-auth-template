import { compare } from 'bcrypt';
import { authenticator } from 'otplib';
import { db } from '../../../config/db.js';
import type { Tokens } from '../_helpers/generate-tokens.js';
import { generateTokens } from '../_helpers/generate-tokens.js';
import { AUTH_CONFIG } from '../constants.js';
import {
  prepareUserForClient,
  type SafeUser,
} from '../../../utils/user/prepare-user.js';

interface LoginServiceRequest {
  email: string;
  inputPassword: string;
  mfaToken?: string;
}

interface LoginServiceResponse {
  success: boolean;
  tokens?: Tokens;
  user?: SafeUser;
  error?: string;
  canResend?: boolean;
  requiresTwoFactor?: boolean;
}

export const loginService = async ({
  email,
  inputPassword,
  mfaToken,
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

    if (user.twoFactorEnabled) {
      if (!mfaToken) {
        return {
          success: false,
          requiresTwoFactor: true,
          error: 'Two-factor authentication required',
        };
      }

      const isValidToken = authenticator.verify({
        secret: user.twoFactorSecret!,
        token: mfaToken,
      });

      if (!isValidToken) {
        return {
          success: false,
          error: 'Invalid two-factor code',
        };
      }
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

    const safeUser = prepareUserForClient(user);

    return {
      success: true,
      tokens,
      user: safeUser,
    };
  } catch (error) {
    console.error('[LOGIN] Error:', error);
    return { success: false, error: 'Failed to login' };
  }
};
