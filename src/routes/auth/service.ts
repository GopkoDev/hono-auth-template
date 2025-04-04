import type { Secret, SignOptions } from 'jsonwebtoken';
import type { AuthUser, Tokens } from './types.js';

import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { compare, hash } from 'bcrypt';
import { Prisma } from '@prisma/client';
import { db } from '../../lib/db.js';
import { sendEmail } from '../../lib/sendEmail.js';
import { config } from '../../../envconfig.js';
import { AUTH_CONFIG } from './constants.js';

import { verificationMail } from '../../mails/auth/verify-email.js';
import { resetPasswordMail } from '../../mails/auth/reset-password.js';

export class AuthService {
  public generateTokens(userId: string): Tokens {
    if (!config.jwt.secret || !config.jwt.refreshSecret) {
      throw new Error('JWT secrets are not defined in environment variables');
    }

    const accessToken: string = jwt.sign(
      { userId },
      config.jwt.secret as Secret,
      {
        expiresIn: AUTH_CONFIG.ACCESS_TOKEN_EXPIRY,
      } as SignOptions
    );

    const refreshToken: string = jwt.sign(
      { userId },
      config.jwt.refreshSecret as Secret,
      {
        expiresIn: AUTH_CONFIG.REFRESH_TOKEN_EXPIRY,
      } as SignOptions
    );

    return { accessToken, refreshToken };
  }

  public generateMailPin(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  public generateUuidToken(): string {
    return uuidv4();
  }

  public async registerUser(
    name: string | undefined,
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        return { success: false, error: 'User already exists' };
      }

      const hashedPassword = await hash(password, 10);
      const verificationToken = this.generateUuidToken();
      const verificationPin = this.generateMailPin();

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
              expiresAt: new Date(Date.now() + AUTH_CONFIG.VERIFICATION_EXPIRY),
            },
          }),
        ],
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        }
      );

      const verificationLink = `${config.server.frontendUrl}/verify-mail?token=${verificationToken}`;
      const emailContent = verificationMail({
        link: verificationLink,
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
      };
    } catch (error) {
      console.error('[REGISTER] Error:', error);
      return { success: false, error: 'Failed to register user' };
    }
  }

  public async loginUser(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    tokens?: Tokens;
    user?: AuthUser;
    error?: string;
    canResend?: boolean;
  }> {
    try {
      const user = await db.user.findUnique({ where: { email } });

      if (!user || !(await compare(password, user.password || ''))) {
        return { success: false, error: 'Invalid credentials' };
      }

      if (!user.emailVerified) {
        return {
          success: false,
          error: 'Email not verified',
          canResend: true,
        };
      }

      const tokens = this.generateTokens(user.id);
      await db.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + AUTH_CONFIG.REFRESH_TOKEN_EXPIRY),
        },
      });

      return {
        success: true,
        tokens,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    } catch (error) {
      console.error('[LOGIN] Error:', error);
      return { success: false, error: 'Failed to login' };
    }
  }

  public async logoutUser(
    refreshToken: string | undefined
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      if (!refreshToken) {
        return { success: false, error: 'Already logged out' };
      }

      const existingToken = await db.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (existingToken) {
        await db.refreshToken.delete({ where: { token: refreshToken } });
      }

      return { success: true, message: 'Logged out successfully' };
    } catch (error) {
      console.error('[LOGOUT] Error:', error);
      return { success: false, error: 'Failed to logout' };
    }
  }

  public async refreshAccessToken(refreshToken: string | undefined): Promise<{
    success: boolean;
    accessToken?: string;
    newRefreshToken?: string;
    error?: string;
  }> {
    try {
      if (!refreshToken) {
        return { success: false, error: 'No refresh token' };
      }

      const payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
        userId: string;
      };

      const dbToken = await db.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!dbToken) {
        return { success: false, error: 'Invalid refresh token' };
      }

      const tokens = this.generateTokens(payload.userId);

      await db.refreshToken.update({
        where: { id: dbToken.id },
        data: {
          token: tokens.refreshToken,
          expiresAt: new Date(Date.now() + AUTH_CONFIG.REFRESH_TOKEN_EXPIRY),
        },
      });

      return {
        success: true,
        accessToken: tokens.accessToken,
        newRefreshToken: tokens.refreshToken,
      };
    } catch (error) {
      console.error('[REFRESH] Error:', error);
      if (error instanceof jwt.TokenExpiredError) {
        return { success: false, error: 'Refresh token expired' };
      }
      return { success: false, error: 'Failed to refresh token' };
    }
  }

  public async verifyEmail(
    pin: string,
    token: string
  ): Promise<{
    success: boolean;
    message?: string;
    tokens?: Tokens;
    user?: AuthUser;
    error?: string;
    canResend?: boolean;
    email?: string;
  }> {
    try {
      const verificationToken = await db.emailVerificationToken.findUnique({
        where: { token },
      });

      if (!verificationToken) {
        return { success: false, error: 'Invalid token' };
      }

      if (verificationToken.expiresAt < new Date()) {
        await db.emailVerificationToken.delete({
          where: { token },
        });

        return {
          success: false,
          error: 'Verification token has expired. Please request a new one.',
          canResend: true,
          email: verificationToken.email,
        };
      }

      if (verificationToken.pin !== pin) {
        return { success: false, error: 'Invalid pin' };
      }

      const user = await db.user.findUnique({
        where: { email: verificationToken.email },
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (user.emailVerified) {
        return { success: false, error: 'User already verified' };
      }

      const tokens = this.generateTokens(user.id);

      await db.$transaction(
        [
          db.user.update({
            where: { email: verificationToken.email },
            data: { emailVerified: new Date() },
          }),
          db.emailVerificationToken.delete({
            where: { token },
          }),
          db.refreshToken.create({
            data: {
              token: tokens.refreshToken,
              userId: user.id,
              expiresAt: new Date(
                Date.now() + AUTH_CONFIG.REFRESH_TOKEN_EXPIRY
              ),
            },
          }),
        ],
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        }
      );

      return {
        success: true,
        message: 'Email verified successfully',
        tokens,
        user: { id: user.id, name: user.name, email: user.email },
      };
    } catch (error) {
      console.error('[VERIFY EMAIL] Error:', error);
      return { success: false, error: 'Failed to verify email' };
    }
  }

  public async resendVerificationEmail(
    email: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const user = await db.user.findUnique({ where: { email } });
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      if (user.emailVerified) {
        return { success: false, error: 'Email already verified' };
      }

      const verificationToken = this.generateUuidToken();
      const verificationPin = this.generateMailPin();

      const existingToken = await db.emailVerificationToken.findFirst({
        where: { email },
      });

      if (existingToken) {
        await db.emailVerificationToken.update({
          where: { id: existingToken.id },
          data: {
            token: verificationToken,
            pin: verificationPin,
            expiresAt: new Date(Date.now() + AUTH_CONFIG.VERIFICATION_EXPIRY),
          },
        });
      } else {
        await db.emailVerificationToken.create({
          data: {
            token: verificationToken,
            pin: verificationPin,
            email,
            expiresAt: new Date(Date.now() + AUTH_CONFIG.VERIFICATION_EXPIRY),
          },
        });
      }

      const verificationLink = `${config.server.frontendUrl}/verify-mail?token=${verificationToken}`;
      const emailContent = verificationMail({
        link: verificationLink,
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
      };
    } catch (error) {
      console.error('[VERIFY EMAIL RESEND] Error:', error);
      return { success: false, error: 'Failed to resend verification email' };
    }
  }

  public async forgotPassword(
    email: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const user = await db.user.findUnique({ where: { email } });
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const resetToken = this.generateUuidToken();
      const resetPin = this.generateMailPin();

      await db.passwordResetToken.upsert({
        where: { email_token: { email, token: resetToken } },
        create: {
          email,
          token: resetToken,
          pin: resetPin,
          expiresAt: new Date(Date.now() + AUTH_CONFIG.PASSWORD_RESET_EXPIRY),
        },
        update: {
          token: resetToken,
          pin: resetPin,
          expiresAt: new Date(Date.now() + AUTH_CONFIG.PASSWORD_RESET_EXPIRY),
        },
      });

      const resetLink = `${config.server.frontendUrl}/reset-password?token=${resetToken}`;
      const emailContent = resetPasswordMail({
        url: resetLink,
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
      };
    } catch (error) {
      console.error('[FORGOT PASSWORD] Error:', error);
      return { success: false, error: 'Failed to send password reset email' };
    }
  }

  public async resetPassword(
    token: string,
    pin: string,
    password: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const resetToken = await db.passwordResetToken.findUnique({
        where: { token },
      });

      if (!resetToken) {
        return { success: false, error: 'Invalid reset token' };
      }

      if (resetToken.expiresAt < new Date()) {
        await db.passwordResetToken.delete({ where: { token } });
        return { success: false, error: 'Reset token has expired' };
      }

      if (resetToken.pin !== pin) {
        return { success: false, error: 'Invalid PIN code' };
      }

      const hashedPassword = await hash(password, 10);

      await db.$transaction(
        [
          db.user.update({
            where: { email: resetToken.email },
            data: { password: hashedPassword },
          }),
          db.refreshToken.deleteMany({
            where: { user: { email: resetToken.email } },
          }),
          db.passwordResetToken.delete({
            where: { token },
          }),
        ],
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        }
      );

      return {
        success: true,
        message: 'Password reset successfully',
      };
    } catch (error) {
      console.error('[RESET PASSWORD] Error:', error);
      return { success: false, error: 'Failed to reset password' };
    }
  }

  public verifyToken(token: string): { valid: boolean; userId?: string } {
    try {
      const payload = jwt.verify(token, config.jwt.secret) as {
        userId: string;
      };
      return { valid: true, userId: payload.userId };
    } catch (error) {
      return { valid: false };
    }
  }
}
