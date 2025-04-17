import { z } from 'zod';

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  avatar: z.string().url().optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
  logoutAllDevices: z.boolean(),
});

export const initiateEmailUpdateSchema = z.object({
  newEmail: z.string().email('Invalid email format'),
});

export const verifyEmailUpdateSchema = z.object({
  pin: z.string().length(6, 'Pin must be 6 digits long'),
  token: z.string().uuid('Invalid token format'),
});
