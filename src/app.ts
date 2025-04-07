import { Hono } from 'hono';
import apiRoutes from './routes/index.js';

import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { logger } from 'hono/logger';
import { rateLimiterMiddleware } from './middlewares/rateLimitMiddleware.js';

import { corsConfig, securityHeadersConfig } from './config/security.js';

const app = new Hono();

app.use('*', secureHeaders(securityHeadersConfig));
app.use('/api/auth/*', rateLimiterMiddleware);
app.use('*', cors(corsConfig));
app.use(logger());

app.route('/api', apiRoutes);
app.notFound((c) => c.json({ error: 'Not Found', code: 'NOT_FOUND' }, 404));

export default app;
export type ApiRoutes = typeof apiRoutes;
