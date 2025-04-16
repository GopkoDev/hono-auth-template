import { Hono } from 'hono';
import apiRoutes from './routes/index.js';

import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { logger as honoLogger } from 'hono/logger';
import { rateLimiterMiddleware } from './middlewares/rate-limit-middleware.js';
import { requestLogger, errorLogger } from './lib/logger.js';

import { corsConfig, securityHeadersConfig } from './config/security.js';

const app = new Hono();

// security
app.use('*', secureHeaders(securityHeadersConfig));
app.use('/api/auth/*', rateLimiterMiddleware);
app.use('*', cors(corsConfig));

// logging
app.use('*', requestLogger);
app.use('*', honoLogger());
app.onError(errorLogger);

// routes
app.route('/api', apiRoutes);
app.notFound((c) => c.json({ error: 'Not Found', code: 'NOT_FOUND' }, 404));

export default app;
export type ApiRoutes = typeof apiRoutes;
