import { z } from 'zod';

export const registerationSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters long')
    .max(50, 'Name must be at most 50 characters long'),
  email: z.string().email().min(5, 'Too short email'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});
