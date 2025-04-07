import { Hono } from 'hono';
import { registrationController } from './registration.controller.js';
import { zodValidator } from '../../../middlewares/zodValidator.js';
import { registerationSchema } from './registration.schema.js';

const registerationRouter = new Hono();

registerationRouter.post(
  '/',
  zodValidator({ body: registerationSchema }),
  registrationController
);

export default registerationRouter;
