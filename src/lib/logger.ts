import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import type { Context, MiddlewareHandler } from 'hono';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(process.cwd(), 'logs', 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
    fileRotateTransport,
  ],
});

export const requestLogger: MiddlewareHandler = async (c: Context, next) => {
  const start = Date.now();

  await next();

  const duration = Date.now() - start;
  logger.info(`${c.req.method} ${c.req.url}`, {
    status: c.res.status,
    duration: `${duration}ms`,
    ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
    userAgent: c.req.header('user-agent'),
  });
};

export const errorLogger = (err: Error, c: Context) => {
  logger.error(err.message, {
    stack: err.stack,
    path: c.req.path,
    method: c.req.method,
    ip: c.req.header('x-forwarded-for') || c.req.header('x-real-ip'),
  });

  return c.json(
    {
      error: 'Internal Server Error',
      message:
        process.env.NODE_ENV === 'production'
          ? 'Something went wrong'
          : err.message,
      code: 'INTERNAL_SERVER_ERROR',
    },
    500
  );
};

export default logger;
