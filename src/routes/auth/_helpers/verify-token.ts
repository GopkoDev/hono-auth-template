import jwt from 'jsonwebtoken';
import { config } from '../../../../envconfig.js';

interface JwtPayload {
  valid: boolean;
  userId?: string;
}

export const verifyToken = (token: string): JwtPayload => {
  try {
    const payload = jwt.verify(token, config.jwt.secret) as {
      userId: string;
    };
    return { valid: true, userId: payload.userId };
  } catch (error) {
    return { valid: false };
  }
};
