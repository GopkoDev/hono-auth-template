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
