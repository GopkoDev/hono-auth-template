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
  app: {
    name: requireEnv('APP_NAME'),
  },
  db: {
    url: requireEnv('DATABASE_URL'),
  },
  redis: {
    host: requireEnv('REDIS_HOST'),
    port: Number(requireEnv('REDIS_PORT')),
    password: requireEnv('REDIS_PASSWORD'),
  },
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    refreshSecret: requireEnv('REFRESH_SECRET'),
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
