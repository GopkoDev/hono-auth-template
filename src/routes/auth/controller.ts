import type { Context } from 'hono';
import { setCookie, getCookie, deleteCookie } from 'hono/cookie';
import { compare, hash } from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Prisma } from '@prisma/client'; // Додайте цей імпорт
import { db } from '../../lib/db.js';
import {
  generateMailPin,
  generateUuidToken,
  generateTokens,
} from './service.js';
import { sendEmail } from '../../lib/sendEmail.js';
import { verificationMail } from '../../mails/auth/verify-email.js';
import { resetPasswordMail } from '../../mails/auth/reset-password.js';
import { config } from '../../../envconfig.js';

export class AuthController {
  async register(c: Context) {
    try {
      const { name, email, password } = c.get('validator').body;

      const existingUser = await db.user.findUnique({ where: { email } });
      if (existingUser) {
        return c.json({ error: 'User already exists' }, 400);
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
              expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
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

      return c.json({
        message: 'User created successfully. Please verify your email.',
      });
    } catch (error) {
      console.error('[REGISTER] Error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  async login(c: Context) {
    try {
      const { email, password } = c.get('validator').body;

      const user = await db.user.findUnique({ where: { email } });

      if (!user || !(await compare(password, user.password || ''))) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      if (!user.emailVerified) {
        return c.json(
          { error: 'Email not verified', canResend: true, email },
          401
        );
      }

      const { accessToken, refreshToken } = generateTokens(user.id);
      await db.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      setCookie(c, 'refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        path: '/api/auth',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
      return c.json({
        accessToken,
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (error) {
      console.error('[LOGIN] Error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  async logout(c: Context) {
    try {
      const refreshToken = getCookie(c, 'refreshToken');
      if (!refreshToken) {
        return c.json({ error: 'Already logged out' }, 400);
      }

      const existingToken = await db.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (existingToken) {
        await db.refreshToken.delete({ where: { token: refreshToken } });
      }

      // Видаляємо cookie в будь-якому випадку
      deleteCookie(c, 'refreshToken', {
        path: '/api/auth',
      });

      return c.json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('[LOGOUT] Error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  async refresh(c: Context) {
    try {
      const refreshToken = getCookie(c, 'refreshToken');
      if (!refreshToken) return c.json({ error: 'No refresh token' }, 401);

      const payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as {
        userId: string;
      };
      const dbToken = await db.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!dbToken) return c.json({ error: 'Invalid refresh token' }, 401);
      const { accessToken, refreshToken: newRefreshToken } = generateTokens(
        payload.userId
      );

      await db.refreshToken.update({
        where: { id: dbToken.id },
        data: {
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      setCookie(c, 'refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        path: '/api/auth',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
      return c.json({ accessToken });
    } catch (error) {
      console.error('[REFRESH] Error:', error);
      return c.json({ error: '[REFRESH] Internal server error' }, 500);
    }
  }

  async verifyEmailToken(c: Context) {
    try {
      const { pin, token } = c.get('validator').body;

      const verificationToken = await db.emailVerificationToken.findUnique({
        where: { token },
      });

      if (!verificationToken) return c.json({ error: 'Invalid token' }, 400);

      if (verificationToken.expiresAt < new Date()) {
        await db.emailVerificationToken.delete({
          where: { token },
        });

        return c.json(
          {
            error: 'Verification token has expired. Please request a new one.',
            canResend: true,
            email: verificationToken.email,
          },
          400
        );
      }

      if (verificationToken.pin !== pin)
        return c.json({ error: 'Invalid pin' }, 400);

      const user = await db.user.findUnique({
        where: { email: verificationToken.email },
      });

      if (!user) return c.json({ error: 'User not found' }, 404);

      if (user.emailVerified)
        return c.json({ error: 'User already verified' }, 400);

      await db.user.update({
        where: { email: verificationToken.email },
        data: { emailVerified: new Date() },
      });

      await db.emailVerificationToken.delete({
        where: { token },
      });

      const { accessToken, refreshToken } = generateTokens(user.id);

      await db.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      setCookie(c, 'refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Strict',
        path: '/api/auth',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return c.json({
        message: 'Email verified successfully',
        accessToken,
        user: { id: user.id, name: user.name, email: user.email },
      });
    } catch (error) {
      console.error('[VERIFY EMAIL] Error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  async verifyEmailTokenResend(c: Context) {
    try {
      const { email } = c.get('validator').body;

      const user = await db.user.findUnique({ where: { email } });
      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }

      if (user.emailVerified) {
        return c.json({ error: 'Email already verified' }, 400);
      }

      const verificationToken = generateUuidToken();
      const verificationPin = generateMailPin();

      const existingToken = await db.emailVerificationToken.findFirst({
        where: { email },
      });

      if (existingToken) {
        await db.emailVerificationToken.update({
          where: { id: existingToken.id },
          data: {
            token: verificationToken,
            pin: verificationPin,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          },
        });
      } else {
        await db.emailVerificationToken.create({
          data: {
            token: verificationToken,
            pin: verificationPin,
            email,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
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

      return c.json({
        message: 'Verification email sent successfully',
        email,
      });
    } catch (error) {
      console.error('[VERIFY EMAIL RESEND] Error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  async forgotPassword(c: Context) {
    try {
      const { email } = c.get('validator').body;

      const user = await db.user.findUnique({ where: { email } });
      if (!user) {
        return c.json({ error: 'User not found' }, 404);
      }

      const resetToken = generateUuidToken();
      const resetPin = generateMailPin();

      await db.passwordResetToken.upsert({
        where: { email_token: { email, token: resetToken } },
        create: {
          email,
          token: resetToken,
          pin: resetPin,
          expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1h
        },
        update: {
          token: resetToken,
          pin: resetPin,
          expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1h
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

      return c.json({
        message: 'Password reset instructions sent to your email',
        email,
      });
    } catch (error) {
      console.error('[FORGOT PASSWORD] Error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }

  async resetPassword(c: Context) {
    try {
      const { token, pin, password } = c.get('validator').body;

      const resetToken = await db.passwordResetToken.findUnique({
        where: { token },
      });

      if (!resetToken) {
        return c.json({ error: 'Invalid reset token' }, 400);
      }

      if (resetToken.expiresAt < new Date()) {
        await db.passwordResetToken.delete({ where: { token } });
        return c.json({ error: 'Reset token has expired' }, 400);
      }

      if (resetToken.pin !== pin) {
        return c.json({ error: 'Invalid PIN code' }, 400);
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

      return c.json({
        message: 'Password reset successfully',
      });
    } catch (error) {
      console.error('[RESET PASSWORD] Error:', error);
      return c.json({ error: 'Internal server error' }, 500);
    }
  }
}
