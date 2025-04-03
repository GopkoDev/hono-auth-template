import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .max(50, 'Name must be at most 50 characters long')
    .optional(),
  email: z.string().email().min(5, 'Too short email'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email().min(5, 'Too short email'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});
