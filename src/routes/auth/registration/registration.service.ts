import { hash } from 'bcrypt';
import { db } from '../../../config/db.js';
import { generateUuidToken } from '../../../helpers/uuid.helper.js';
import { generateMailPin } from '../../../helpers/mail-pin.helper.js';
import { AUTH_CONFIG } from '../constants.js';
import { Prisma } from '@prisma/client';
import { config } from '../../../../envconfig.js';
import { sendEmail } from '../../../lib/sendEmail.js';
import { renderRegistrationEmail } from '../../../mails/auth/render-registration-email.js';

interface RegistrationRequest {
  name: string;
  email: string;
  password: string;
}
interface RegistrationResponse {
  success: boolean;
  path?: string;
  message?: string;
  error?: string;
}

export const registrationService = async ({
  name,
  email,
  password,
}: RegistrationRequest): Promise<RegistrationResponse> => {
  try {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: 'User already exists' };
    }

    const hashedPassword = await hash(password, 10);
    const verificationToken = generateUuidToken();
    const verificationPin = generateMailPin();

    await db.$transaction(
      [
        db.user.create({
          data: {
            name,
            email,
            password: hashedPassword,
          },
        }),
        db.emailVerificationToken.create({
          data: {
            token: verificationToken,
            pin: verificationPin,
            email,
            type: 'REGISTRATION',
            expiresAt: new Date(
              Date.now() + AUTH_CONFIG.VERIFICATION_EXPIRY * 1000
            ),
          },
        }),
      ],
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

    const verificationPath = `/confirm-email/${verificationToken}?email=${encodeURIComponent(
      email
    )}`;
    const verificationLink = `${config.server.frontendUrl}${verificationPath}`;

    const emailContent = await renderRegistrationEmail({
      username: name || 'User',
      verificationUrl: verificationLink,
      pin: verificationPin,
    });

    await sendEmail({
      email,
      subject: 'Verify your email',
      html: emailContent,
    });

    return {
      success: true,
      message: 'User created successfully. Please verify your email.',
      path: verificationPath,
    };
  } catch (error) {
    console.error('[REGISTER] Error:', error);
    return { success: false, error: 'Failed to register user' };
  }
};
