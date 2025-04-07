import { Hono } from 'hono';
import { resendVerifyEmailController } from './resend-verify-email.controller.js';
import { zodValidator } from '../../../middlewares/zodValidator.js';
import { resendEmailTokenSchema } from './resend-verify-email.schema.js';

const resenrVerifyEmailRouter = new Hono();

resenrVerifyEmailRouter.post(
  '/',
  zodValidator({ body: resendEmailTokenSchema }),
  resendVerifyEmailController
);

export default resenrVerifyEmailRouter;
