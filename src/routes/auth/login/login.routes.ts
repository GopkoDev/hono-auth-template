import { Hono } from 'hono';
import { loginController } from './login.controller.js';
import { zodValidator } from '../../../middlewares/zod-validator.js';
import { loginSchema } from './login.schema.js';

const loginRouter = new Hono();

loginRouter.post('/', zodValidator({ body: loginSchema }), loginController);

export default loginRouter;
