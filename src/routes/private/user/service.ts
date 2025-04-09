import type { User } from '@prisma/client';
import { db } from '../../../config/db.js';
import {
  prepareUserForClient,
  type SafeUser,
} from '../../../utils/user/prepare-user.js';

export class UserService {
  public async findUser({ userId }: { userId: string }): Promise<{
    success: boolean;
    message?: string;
    user?: SafeUser;
  }> {
    const user = await db.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    const safeUser = prepareUserForClient(user);

    return { success: true, user: safeUser };
  }
}
