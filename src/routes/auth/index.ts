import { Hono } from 'hono';
import { AuthController } from './controller.js';

const authRoutes = new Hono();
const authController = new AuthController();

authRoutes.post('/register', authController.register);
authRoutes.post('/login', authController.login);
authRoutes.post('/logout', authController.logout);
authRoutes.post('/refresh', authController.refresh);

export { authRoutes };
