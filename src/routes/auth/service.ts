import jwt from 'jsonwebtoken';
import type { Secret, SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../../envconfig.js';

export const generateTokens = (
  userId: string
): { accessToken: string; refreshToken: string } => {
  if (!config.jwt.secret || !config.jwt.refreshSecret)
    throw new Error('JWT secrets are not defined');

  const accessToken: string = jwt.sign(
    { userId },
    config.jwt.secret as Secret,
    {
      expiresIn: config.jwt.accessTokenExpiry,
    } as SignOptions
  );

  const refreshToken: string = jwt.sign(
    { userId },
    config.jwt.refreshSecret as Secret,
    {
      expiresIn: config.jwt.refreshTokenExpiry,
    } as SignOptions
  );

  return { accessToken, refreshToken };
};

export const generateMailPin = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const generateUuidToken = (): string => uuidv4();
