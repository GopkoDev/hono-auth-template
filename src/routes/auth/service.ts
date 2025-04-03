import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;

if (!REFRESH_SECRET || !JWT_SECRET) {
  throw new Error(
    'REFRESH_SECRET or JWT_SECRET is not defined in the environment variables'
  );
}

export const generateTokens = (
  userId: string
): { accessToken: string; refreshToken: string } => {
  if (!JWT_SECRET || !REFRESH_SECRET)
    throw new Error('JWT secrets are not defined');

  const accessToken: string = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '4h',
  });

  const refreshToken: string = jwt.sign({ userId }, REFRESH_SECRET, {
    expiresIn: '7d',
  });

  return { accessToken, refreshToken };
};
