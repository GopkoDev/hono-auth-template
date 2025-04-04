import type { User } from '@prisma/client';
import { db } from '../../../lib/db.js';

export class AuthService {
  public async findUser({
    userId,
  }: {
    userId: string;
  }): Promise<{ success: boolean; message?: string; user?: User }> {
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    return { success: true, user };
  }
}
