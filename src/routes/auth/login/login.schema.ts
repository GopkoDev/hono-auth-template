import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email().min(5, 'Too short email'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  mfaToken: z.string().length(6, 'Token must be 6 characters long').optional(),
});
