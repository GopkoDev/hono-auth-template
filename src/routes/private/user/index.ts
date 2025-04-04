import { Hono } from 'hono';
import { UserController } from './controller.js';

const userRoutes = new Hono();
const user = new UserController();

userRoutes.get('/', user.get);

export { userRoutes };
