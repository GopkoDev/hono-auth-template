import { describe, it, expect } from 'vitest';
import { verifyToken } from '../verify-token.js';
import { generateTokens } from '../generate-tokens.js';

describe('verifyToken', () => {
  const userId = '123456';

  it('should verify valid token', () => {
    const { accessToken } = generateTokens(userId);
    const result = verifyToken(accessToken);

    expect(result.valid).toBe(true);
    expect(result.userId).toBe(userId);
  });

  it('should return invalid for expired token', () => {
    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjM0NTYiLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjIzOTAyM30.4Adcj3UFYzPUVaVF43FmMze9_rGTB2s-IxQY1QNd45Y';

    const result = verifyToken(expiredToken);
    expect(result.valid).toBe(false);
    expect(result.userId).toBeUndefined();
  });

  it('should return invalid for malformed token', () => {
    const result = verifyToken('invalid-token');
    expect(result.valid).toBe(false);
    expect(result.userId).toBeUndefined();
  });
});
