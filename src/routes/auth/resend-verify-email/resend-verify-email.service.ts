import { config } from '../../../../envconfig.js';
import { db } from '../../../config/db.js';
import { sendEmail } from '../../../lib/sendEmail.js';
import { renderRegistrationEmail } from '../../../mails/auth/render-registration-email.js';
import { generateMailPin } from '../../../helpers/mail-pin.helper.js';
import { generateUuidToken } from '../../../helpers/uuid.helper.js';
import { AUTH_CONFIG } from '../constants.js';

interface ResendVerificationEmailRequest {
  email: string;
}

interface ResendVerificationEmailResponse {
  success: boolean;
  message?: string;
  error?: string;
  path?: string;
}

export const resendVerifyEmailService = async ({
  email,
}: ResendVerificationEmailRequest): Promise<ResendVerificationEmailResponse> => {
  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.emailVerified) {
      return { success: false, error: 'Email already verified' };
    }

    const verificationToken = generateUuidToken();
    const verificationPin = generateMailPin();

    const existingToken = await db.emailVerificationToken.findFirst({
      where: { email, type: 'REGISTRATION' },
    });

    if (existingToken) {
      await db.emailVerificationToken.update({
        where: { id: existingToken.id },
        data: {
          token: verificationToken,
          pin: verificationPin,
          expiresAt: new Date(
            Date.now() + AUTH_CONFIG.VERIFICATION_EXPIRY * 1000
          ),
        },
      });
    } else {
      await db.emailVerificationToken.create({
        data: {
          token: verificationToken,
          pin: verificationPin,
          email,
          type: 'REGISTRATION',
          expiresAt: new Date(
            Date.now() + AUTH_CONFIG.VERIFICATION_EXPIRY * 1000
          ),
        },
      });
    }

    const verificationPath = `/confirm-email/${verificationToken}?email=${encodeURIComponent(
      email
    )}`;
    const verificationLink = `${config.server.frontendUrl}${verificationPath}`;

    const emailContent = await renderRegistrationEmail({
      username: user.name || 'User',
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
      message: 'Verification email sent successfully',
      path: verificationPath,
    };
  } catch (error) {
    console.error('[VERIFY EMAIL RESEND] Error:', error);
    return { success: false, error: 'Failed to resend verification email' };
  }
};
