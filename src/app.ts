import { Hono } from 'hono';
import { logger } from 'hono/logger';

import apiRoutes from './routes/index.js';

const app = new Hono();

app.use(logger());
app.route('/api', apiRoutes);

export default app;
