import { describe, expect, it } from 'vitest';
import { getPasswordStrengthChecks } from './passwordStrength';

describe('getPasswordStrengthChecks', () => {
  it('reports all strength rules for a strong password', () => {
    expect(
      getPasswordStrengthChecks('Password1!').every((check) => check.passed)
    ).toBe(true);
  });

  it('reports missing rules for a weak password', () => {
    expect(
      getPasswordStrengthChecks('password').map((check) => check.passed)
    ).toEqual([false, false, true, false]);
  });
});
