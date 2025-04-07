import { Hono } from 'hono';
import { verifyEmailController } from './verify-email.controller.js';
import { zodValidator } from '../../../middlewares/zodValidator.js';
import { emailVerifySchema } from './verify-email.schema.js';

const verifyEmailRouter = new Hono();

verifyEmailRouter.post(
  '/',
  zodValidator({
    body: emailVerifySchema,
  }),
  verifyEmailController
);

export default verifyEmailRouter;
