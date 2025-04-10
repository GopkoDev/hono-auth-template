import { Hono } from 'hono';
import {
  disableTwoFactorController,
  generateTwoFactorController,
  verifyTwoFactorController,
} from './two-factor.controller.js';

const twoFactorRoutes = new Hono();

twoFactorRoutes.post('/generate', generateTwoFactorController);
twoFactorRoutes.post('/verify', verifyTwoFactorController);
twoFactorRoutes.post('/disable', disableTwoFactorController);

export default twoFactorRoutes;
