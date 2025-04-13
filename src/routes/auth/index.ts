import { Hono } from 'hono';

import loginRouter from './login/login.routes.js';
import logoutRouter from './logout/logout.routes.js';
import registerationRouter from './registration/registration.routes.js';
import forgotRouter from './forgot-password/forgot.routes.js';
import resetPasswordRouter from './reset-password/reset.routes.js';
import refreshToken from './refresh-token/refresh.routes.js';
import verifyEmailRouter from './verify-email/verify-email.routes.js';
import resenrVerifyEmailRouter from './resend-verify-email/resend-verify-email.routes.js';

const authRoutes = new Hono();

authRoutes.route('/login', loginRouter);
authRoutes.route('/logout', logoutRouter);
authRoutes.route('/register', registerationRouter);
authRoutes.route('/forgot-password', forgotRouter);
authRoutes.route('/reset-password', resetPasswordRouter);
authRoutes.route('/refresh', refreshToken);
authRoutes.route('/verify-mail', verifyEmailRouter);
authRoutes.route('/resend-verify-mail', resenrVerifyEmailRouter);

export { authRoutes };
