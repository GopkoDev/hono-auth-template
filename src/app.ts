import { Hono } from 'hono';
import apiRoutes from './routes/index.js';

import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { rateLimiter } from 'hono-rate-limiter';
import { logger } from 'hono/logger';

import {
  corsConfig,
  rateLimiterConfig,
  securityHeadersConfig,
} from './config/security.js';

const app = new Hono();

app.use('*', secureHeaders(securityHeadersConfig));
app.use('/api/auth/*', rateLimiter(rateLimiterConfig));
app.use('*', cors(corsConfig));
app.use(logger());

app.route('/api', apiRoutes);
app.notFound((c) => c.json({ error: 'Not Found', code: 'NOT_FOUND' }, 404));

export default app;
