import { Hono } from 'hono';
import { zodValidator } from '../../middlewares/zodValidator.js';

import { AuthController } from './controller.js';

import {
  emailVerifySchema,
  loginSchema,
  registerSchema,
  resendEmailTokenSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
} from './validation.js';

const authRoutes = new Hono();
const auth = new AuthController();

authRoutes.post('/login', zodValidator({ body: loginSchema }), auth.login);
authRoutes.post('/logout', auth.logout);
authRoutes.post('/refresh', auth.refresh);

authRoutes.post(
  '/register',
  zodValidator({ body: registerSchema }),
  auth.register
);

authRoutes.post(
  '/verify-mail',
  zodValidator({
    body: emailVerifySchema,
  }),
  auth.verifyEmailToken
);

authRoutes.post(
  '/resend-verify-mail',
  zodValidator({ body: resendEmailTokenSchema }),
  auth.verifyEmailTokenResend
);

authRoutes.post(
  '/forgot-password',
  zodValidator({ body: forgotPasswordSchema }),
  auth.forgotPassword
);

authRoutes.post(
  '/reset-password',
  zodValidator({ body: resetPasswordSchema }),
  auth.resetPassword
);

export { authRoutes };
