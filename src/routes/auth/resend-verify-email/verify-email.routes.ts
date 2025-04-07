import { Hono } from 'hono';
import { verifyEmailController } from './verify-email.controller.js';
import { zodValidator } from '../../../middlewares/zod-validator.js';
import { emailVerifySchema } from './verify-email.schema.js';

const verifyEmailRoutes = new Hono();

verifyEmailRoutes.post(
  '/',
  zodValidator({
    body: emailVerifySchema,
  }),
  verifyEmailController
);

export default verifyEmailRoutes;
