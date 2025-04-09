import type { User } from '@prisma/client';

export type SafeUser = Omit<User, 'password' | 'createdAt' | 'updatedAt'>;

export const prepareUserForClient = (user: User): SafeUser => {
  const { password, createdAt, updatedAt, ...safeUser } = user;
  return safeUser;
};
