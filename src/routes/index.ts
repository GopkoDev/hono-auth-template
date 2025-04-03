import { Hono } from 'hono';
import { authRoutes } from './auth/index.js';

const api = new Hono();

api.route('/auth', authRoutes);

export default api;
