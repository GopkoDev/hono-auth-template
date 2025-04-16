import { authenticator } from 'otplib';
import * as qrcode from 'qrcode';

import { db } from '../../../config/db.js';
import { config } from '../../../../envconfig.js';
import { encrypt, decrypt } from '../../../helpers/crypto.helper.js';

interface GenerateTwoFactorServiceRequest {
  userId: string;
}

type GenerateTwoFactorServiceResponse =
  | {
      success: true;
      secret: string;
      qrCodeUrl: string;
    }
  | {
      success: false;
      error: string;
      code: 404 | 400 | 500;
    };

export const generateTwoFactorService = async ({
  userId,
}: GenerateTwoFactorServiceRequest): Promise<GenerateTwoFactorServiceResponse> => {
  const user = await db.user.findUnique({ where: { id: userId } });

  if (!user) {
    return { success: false, error: 'User not found', code: 404 };
  }

  if (user.twoFactorEnabled) {
    return {
      success: false,
      error: 'Two-factor authentication already set up',
      code: 400,
    };
  }

  const secret = authenticator.generateSecret();
  const encryptedSecret = await encrypt(secret);
  const otpauth = authenticator.keyuri(user.email!, config.app.name, secret);
  const qrCodeUrl = await qrcode.toDataURL(otpauth);

  await db.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: encryptedSecret,
    },
  });

  return { success: true, secret, qrCodeUrl };
};

interface VerifyTwoFactorServiceRequest {
  userId: string;
  token: string;
}
type VerifyTwoFactorServiceResponse =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
      code: 400;
    };

export const verifyTwoFactorService = async ({
  userId,
  token,
}: VerifyTwoFactorServiceRequest): Promise<VerifyTwoFactorServiceResponse> => {
  const user = await db.user.findUnique({ where: { id: userId } });

  if (!user?.twoFactorSecret) {
    return {
      success: false,
      error: 'Two-factor authentication not set up',
      code: 400,
    };
  }

  const decryptedSecret = await decrypt(user.twoFactorSecret);

  const isValid = authenticator.verify({
    secret: decryptedSecret,
    token,
  });

  if (!isValid) {
    return { success: false, error: 'Invalid pin', code: 400 };
  }

  await db.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
    },
  });

  return { success: true, message: 'Token verified successfully' };
};

interface DisableTwoFactorServiceRequest {
  userId: string;
  token: string;
}
type DisableTwoFactorServiceResponse =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
      code: 404 | 400 | 500;
    };

export const disableTwoFactorService = async ({
  userId,
  token,
}: DisableTwoFactorServiceRequest): Promise<DisableTwoFactorServiceResponse> => {
  const user = await db.user.findUnique({ where: { id: userId } });

  if (!user) {
    return { success: false, error: 'User not found', code: 404 };
  }

  if (!user.twoFactorSecret) {
    return {
      success: false,
      error: 'Two-factor authentication not set up',
      code: 404,
    };
  }

  const decryptedSecret = await decrypt(user.twoFactorSecret);

  const isValid = authenticator.verify({
    secret: decryptedSecret,
    token,
  });

  if (!isValid) {
    return { success: false, error: 'Invalid pin', code: 400 };
  }

  await db.user.update({
    where: { id: userId },
    data: {
      twoFactorSecret: null,
      twoFactorEnabled: false,
    },
  });

  return { success: true, message: 'Two-factor authentication disabled' };
};
