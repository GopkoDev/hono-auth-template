import { Hono } from 'hono';
import { zodValidator } from '../../../middlewares/zod-validator.js';
import { resetPasswordSchema } from './reset.schema.js';
import { resetPasswordController } from './reset.controller.js';

const resetPasswordRouter = new Hono();

resetPasswordRouter.post(
  '/',
  zodValidator({ body: resetPasswordSchema }),
  resetPasswordController
);

export default resetPasswordRouter;
