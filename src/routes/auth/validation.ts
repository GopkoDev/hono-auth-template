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

export const emailVerifySchema = z.object({
  pin: z.string().length(6, 'Pin must be 6 digits long'),
  token: z.string().uuid('Invalid token format'),
});

export const resendEmailTokenSchema = z.object({
  email: z.string().email().min(5, 'Too short email'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email().min(5, 'Too short email'),
});

export const resetPasswordSchema = z.object({
  token: z.string().uuid('Invalid token format'),
  pin: z.string().length(6, 'Pin must be 6 digits long'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});
