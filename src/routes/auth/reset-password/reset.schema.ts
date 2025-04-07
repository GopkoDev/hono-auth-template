import { z } from 'zod';

export const resetPasswordSchema = z.object({
  token: z.string().uuid('Invalid token format'),
  pin: z.string().length(6, 'Pin must be 6 digits long'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});
