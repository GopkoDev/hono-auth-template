import { Hono } from 'hono';
import { authMiddleware } from '../../middlewares/auth-middleware.js';

import { userRoutes } from './user/index.js';

const privateRoutes = new Hono();

privateRoutes.use('*', authMiddleware);
privateRoutes.route('/user', userRoutes);

export { privateRoutes };
