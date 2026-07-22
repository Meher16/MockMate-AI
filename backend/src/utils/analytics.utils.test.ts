import { describe, expect, it } from 'vitest';
import { average, computeScoreChange } from './analytics.utils';

describe('average', () => {
  it('returns null for empty arrays', () => {
    expect(average([])).toBeNull();
  });

  it('computes rounded average', () => {
    expect(average([70, 80, 90])).toBe(80);
    expect(average([72.3, 73.7])).toBe(73);
  });
});

describe('computeScoreChange', () => {
  it('returns null when comparison groups are insufficient', () => {
    expect(computeScoreChange([], [70])).toBeNull();
    expect(computeScoreChange([80], [])).toBeNull();
  });

  it('returns positive change when recent scores improve', () => {
    expect(computeScoreChange([90, 85, 88], [70, 72, 68])).toBeGreaterThan(0);
  });

  it('returns negative change when recent scores decline', () => {
    expect(computeScoreChange([60, 65, 62], [80, 82, 78])).toBeLessThan(0);
  });
});
