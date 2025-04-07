import { z } from 'zod';

export const resendEmailTokenSchema = z.object({
  email: z.string().email().min(5, 'Too short email'),
});
