import { serve } from '@hono/node-server';
import app from './src/app.js';
import 'dotenv/config';

const port = parseInt(process.env.PORT || '4200', 10);

serve(
  {
    fetch: app.fetch,
    port: port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
