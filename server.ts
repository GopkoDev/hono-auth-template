import { serve } from '@hono/node-server';
import app from './src/app.js';
import { config } from './envconfig.js';

serve(
  {
    fetch: app.fetch,
    port: config.server.port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
