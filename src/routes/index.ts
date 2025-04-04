import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/authMiddleware.js';

import { authRoutes } from './auth/index.js';
import { privateRoutes } from './private/index.js';

const api = new Hono();

//Public routes
api.route('/auth', authRoutes);

// Private routes
api.route('/', privateRoutes);

export default api;
