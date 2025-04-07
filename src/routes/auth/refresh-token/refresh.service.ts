import jwt from 'jsonwebtoken';
import { config } from '../../../../envconfig.js';
import { db } from '../../../config/db.js';
import { generateTokens } from '../_helpers/generateTokens.js';
import { AUTH_CONFIG } from '../constants.js';

interface RefreshTokenServiceRequest {
  refreshToken: string | undefined;
}

interface RefreshTokenServiceResponse {
  success: boolean;
  accessToken?: string;
  newRefreshToken?: string;
  error?: string;
}

export const refreshTokenService = async ({
  refreshToken,
}: RefreshTokenServiceRequest): Promise<RefreshTokenServiceResponse> => {
  try {
    if (!refreshToken) {
      return { success: false, error: 'No refresh token' };
    }

    const payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
      userId: string;
    };

    const dbToken = await db.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!dbToken) {
      return { success: false, error: 'Invalid refresh token' };
    }

    const tokens = generateTokens(payload.userId);

    await db.refreshToken.update({
      where: { id: dbToken.id },
      data: {
        token: tokens.refreshToken,
        expiresAt: new Date(
          Date.now() + AUTH_CONFIG.REFRESH_TOKEN_EXPIRY * 1000
        ),
      },
    });

    return {
      success: true,
      accessToken: tokens.accessToken,
      newRefreshToken: tokens.refreshToken,
    };
  } catch (error) {
    console.error('[REFRESH] Error:', error);
    if (error instanceof jwt.TokenExpiredError) {
      return { success: false, error: 'Refresh token expired' };
    }
    return { success: false, error: 'Failed to refresh token' };
  }
};
