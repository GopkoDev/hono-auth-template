import type { Secret, SignOptions } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';

import { config } from '../../../../envconfig.js';
import { AUTH_CONFIG } from '../constants.js';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export const generateTokens = (userId: string): Tokens => {
  if (!config.jwt.secret || !config.jwt.refreshSecret) {
    throw new Error('JWT secrets are not defined in environment variables');
  }

  const accessToken: string = jwt.sign(
    { userId },
    config.jwt.secret as Secret,
    {
      expiresIn: AUTH_CONFIG.ACCESS_TOKEN_EXPIRY,
    } as SignOptions
  );

  const refreshToken: string = jwt.sign(
    { userId },
    config.jwt.refreshSecret as Secret,
    {
      expiresIn: AUTH_CONFIG.REFRESH_TOKEN_EXPIRY,
    } as SignOptions
  );

  return { accessToken, refreshToken };
};
