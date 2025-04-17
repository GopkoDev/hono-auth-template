import { config } from '../../../../envconfig.js';
import { db } from '../../../config/db.js';
import { sendEmail } from '../../../lib/sendEmail.js';
import { renderResetPasswordEmail } from '../../../mails/auth/render-reset-password.js';
import { generateMailPin } from '../../../helpers/mail-pin.helper.js';
import { generateUuidToken } from '../../../helpers/uuid.helper.js';
import { AUTH_CONFIG } from '../constants.js';

interface ForgotServiceRequest {
  email: string;
}

interface ForgotServiceResponse {
  success: boolean;
  message?: string;
  error?: string;
  path?: string;
}

export const forgotService = async ({
  email,
}: ForgotServiceRequest): Promise<ForgotServiceResponse> => {
  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    const resetToken = generateUuidToken();
    const resetPin = generateMailPin();

    await db.passwordResetToken.upsert({
      where: { email_token: { email, token: resetToken } },
      create: {
        email,
        token: resetToken,
        pin: resetPin,
        expiresAt: new Date(
          Date.now() + AUTH_CONFIG.PASSWORD_RESET_EXPIRY * 1000
        ),
      },
      update: {
        token: resetToken,
        pin: resetPin,
        expiresAt: new Date(
          Date.now() + AUTH_CONFIG.PASSWORD_RESET_EXPIRY * 1000
        ),
      },
    });

    const resetPath = `/reset-password/${resetToken}`;
    const resetLink = `${config.server.frontendUrl}${resetPath}`;

    const emailContent = await renderResetPasswordEmail({
      username: user.name || 'User',
      resetUrl: resetLink,
      pin: resetPin,
    });

    await sendEmail({
      email,
      subject: 'Reset your password',
      html: emailContent,
    });

    return {
      success: true,
      message: 'Password reset instructions sent to your email',
      path: resetPath,
    };
  } catch (error) {
    console.error('[FORGOT PASSWORD] Error:', error);
    return { success: false, error: 'Failed to send password reset email' };
  }
};
