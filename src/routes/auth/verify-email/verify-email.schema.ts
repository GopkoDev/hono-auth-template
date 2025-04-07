import { z } from 'zod';

export const emailVerifySchema = z.object({
  pin: z.string().length(6, 'Pin must be 6 digits long'),
  token: z.string().uuid('Invalid token format'),
});
