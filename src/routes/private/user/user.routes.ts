import { Hono } from 'hono';
import {
  getUserController,
  initiateEmailUpdateController,
  updatePasswordController,
  updateUserController,
  verifyEmailUpdateController,
} from './user.controller.js';
import {
  initiateEmailUpdateSchema,
  updatePasswordSchema,
  updateUserSchema,
  verifyEmailUpdateSchema,
} from './user.schema.js';
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

userRoutes.patch(
  '/email',
  zodValidator({ body: initiateEmailUpdateSchema }),
  initiateEmailUpdateController
);

userRoutes.patch(
  '/email/verify',
  zodValidator({ body: verifyEmailUpdateSchema }),
  verifyEmailUpdateController
);

export default userRoutes;
