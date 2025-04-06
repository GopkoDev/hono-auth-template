import { Redis } from 'ioredis';
import { config } from '../../envconfig.js';

export const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  retryStrategy: (times) => {
    if (times > 3) {
      return null;
    }
    return Math.min(times * 100, 3000);
  },
  maxRetriesPerRequest: 3,
});

redis.on('error', (err) => console.error('Redis Client Error:', err));
redis.on('connect', () => console.log('Redis Client Connected'));

redis.on('ready', () => {
  console.log('Redis is ready');
});

redis.on('reconnecting', () => {
  console.log('Redis reconnecting...');
});
