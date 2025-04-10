import type { User } from '@prisma/client';

export type SafeUser = Omit<
  User,
  'password' | 'createdAt' | 'updatedAt' | 'twoFactorSecret' | 'emailVerified'
>;

export const prepareUserForClient = (user: User): SafeUser => {
  const {
    password,
    createdAt,
    updatedAt,
    twoFactorSecret,
    emailVerified,
    ...safeUser
  } = user;
  return safeUser;
};
