import { Hono } from 'hono';
import { forgotController } from './forgot.controller.js';
import { zodValidator } from '../../../middlewares/zod-validator.js';
import { forgotSchema } from './forgot.schema.js';

const forgotRouter = new Hono();

forgotRouter.post('/', zodValidator({ body: forgotSchema }), forgotController);

export default forgotRouter;
