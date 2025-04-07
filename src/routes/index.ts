import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/auth-middleware.js';

import { authRoutes } from './auth/index.js';
import { privateRoutes } from './private/index.js';

const api = new Hono();

api.route('/auth', authRoutes);
api.route('/', privateRoutes);

export default api;
