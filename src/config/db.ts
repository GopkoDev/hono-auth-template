import { PrismaClient } from '@prisma/client';
import { config } from '../../envconfig.js';

declare global {
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (config.server.nodeEnv !== 'production') globalThis.prisma = db;

db.$connect()
  .then(() => {
    console.log('Potgress: successfully connected');
  })
  .catch((error) => {
    console.error('Potgress: connection error:', error);
    process.exit(1);
  });
