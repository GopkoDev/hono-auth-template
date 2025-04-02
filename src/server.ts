import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import 'dotenv/config';

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

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
