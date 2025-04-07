import { Hono } from 'hono';
import { logoutController } from './logout.controller.js';

const logoutRouter = new Hono();

logoutRouter.post('/', logoutController);

export default logoutRouter;
