import { Hono } from 'hono';
import { refreshTokenController } from './refresh.controller.js';

const refreshToken = new Hono();

refreshToken.post('/', refreshTokenController);

export default refreshToken;
