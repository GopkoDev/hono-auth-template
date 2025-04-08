import { describe, it, expect } from 'vitest';
import { generateMailPin } from '../generate-mail-pin.js';

describe('generateMailPin', () => {
  it('should generate 6-digit pin', () => {
    const pin = generateMailPin();
    expect(pin).toMatch(/^\d{6}$/);
  });

  it('should generate different pins on each call', () => {
    const pin1 = generateMailPin();
    const pin2 = generateMailPin();
    expect(pin1).not.toBe(pin2);
  });

  it('should generate pin within valid range', () => {
    const pin = parseInt(generateMailPin());
    expect(pin).toBeGreaterThanOrEqual(100000);
    expect(pin).toBeLessThanOrEqual(999999);
  });
});
