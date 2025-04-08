import { describe, it, expect } from 'vitest';
import { generateUuidToken } from '../generate-uuid-token.js';
import { validate as uuidValidate } from 'uuid';

describe('generateUuidToken', () => {
  it('should generate valid UUID', () => {
    const token = generateUuidToken();
    expect(uuidValidate(token)).toBe(true);
  });

  it('should generate different UUIDs on each call', () => {
    const token1 = generateUuidToken();
    const token2 = generateUuidToken();
    expect(token1).not.toBe(token2);
  });

  it('should generate UUID v4', () => {
    const token = generateUuidToken();
    expect(token).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });
});
