import { Hono } from 'hono';
import {
  getUserController,
  updatePasswordController,
  updateUserController,
} from './user.controller.js';
import { updatePasswordSchema, updateUserSchema } from './user.schema.js';
import { zodValidator } from '../../../middlewares/zod-validator.js';

const userRoutes = new Hono();

userRoutes.get('/', getUserController);

userRoutes.patch(
  '/profile',
  zodValidator({ body: updateUserSchema }),
  updateUserController
);

userRoutes.patch(
  '/password',
  zodValidator({ body: updatePasswordSchema }),
  updatePasswordController
);

export default userRoutes;
