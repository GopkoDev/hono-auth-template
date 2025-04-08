import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { generateTokens } from '../generate-tokens.js';
import { config } from '../../../../../envconfig.js';

vi.mock('../../../../../envconfig.js');

describe('generateTokens', () => {
  const userId = '123456';
  const TEST_SECRET = 'test-secret';
  const TEST_REFRESH_SECRET = 'test-refresh-secret';

  beforeEach(() => {
    vi.mocked(config).jwt = {
      secret: TEST_SECRET,
      refreshSecret: TEST_REFRESH_SECRET,
    };
  });

  it('should generate valid access and refresh tokens', () => {
    const tokens = generateTokens(userId);

    expect(tokens).toHaveProperty('accessToken');
    expect(tokens).toHaveProperty('refreshToken');

    const decodedAccess = jwt.verify(tokens.accessToken, TEST_SECRET) as {
      userId: string;
    };
    expect(decodedAccess.userId).toBe(userId);

    const decodedRefresh = jwt.verify(
      tokens.refreshToken,
      TEST_REFRESH_SECRET
    ) as { userId: string };
    expect(decodedRefresh.userId).toBe(userId);
  });

  it('should throw error when JWT secrets are not defined', () => {
    vi.mocked(config).jwt = {
      secret: '',
      refreshSecret: '',
    };

    expect(() => generateTokens(userId)).toThrow('JWT secrets are not defined');
  });

  afterEach(() => {
    vi.resetAllMocks();
  });
});
