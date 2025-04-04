import 'dotenv/config';

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `[ENV] Environment variable ${name} is required but not set.`
    );
  }
  return value;
};

export const config = {
  server: {
    port: Number(requireEnv('PORT')),
    nodeEnv: requireEnv('NODE_ENV'),
    frontendUrl: requireEnv('FRONTEND_URL'),
  },
  db: {
    url: requireEnv('DATABASE_URL'),
  },
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    refreshSecret: requireEnv('REFRESH_SECRET'),
    accessTokenExpiry: requireEnv('ACCESS_TOKEN_EXPIRY'),
    refreshTokenExpiry: requireEnv('REFRESH_TOKEN_EXPIRY'),
  },
  smtp: {
    service: requireEnv('SMTP_SERVICE'),
    host: requireEnv('SMTP_HOST'),
    port: Number(requireEnv('SMTP_PORT')),
    secure: requireEnv('SMTP_SECURE') === 'true',
    user: requireEnv('SMTP_USER'),
    pass: requireEnv('SMTP_PASS'),
    from: requireEnv('SMTP_FROM'),
  },
};
