import { describe, it, expect } from 'vitest';
import type { CostComponent } from '@portale-von-molthar/shared';
import { canPayHist, histOf } from './hist';
import { deficit } from './index';

const X = { diamonds: 0, wild: 0, onesCanBeEights: false, threesCanBeAny: false };
const c = (...cost: CostComponent[]) => cost;

describe('canPayHist', () => {
  it('handles fixed numbers', () => {
    expect(canPayHist(c({ type: 'number', value: 8 }, { type: 'number', value: 8 }), histOf([8, 8, 3]), X)).toBe(true);
    expect(canPayHist(c({ type: 'number', value: 8 }, { type: 'number', value: 8 }), histOf([8, 3]), X)).toBe(false);
  });

  it('handles tuples, runs and sums', () => {
    expect(canPayHist(c({ type: 'nTuple', n: 3 }), histOf([5, 5, 5, 1]), X)).toBe(true);
    expect(canPayHist(c({ type: 'run', length: 3 }), histOf([4, 6, 5]), X)).toBe(true);
    expect(canPayHist(c({ type: 'sumTuple', n: 3, sum: 20 }), histOf([8, 7, 5]), X)).toBe(true);
    expect(canPayHist(c({ type: 'sumAnyTuple', sum: 10 }), histOf([2, 1, 7]), X)).toBe(true);
    expect(canPayHist(c({ type: 'sumAnyTuple', sum: 10 }), histOf([4, 4]), X)).toBe(false);
    expect(canPayHist(c({ type: 'oddTuple', n: 3 }), histOf([1, 3, 3]), X)).toBe(true);
    expect(canPayHist(c({ type: 'tripleChoice', value1: 4, value2: 5 }), histOf([5, 5, 5]), X)).toBe(true);
  });

  it('respects diamond costs and pearl conversions', () => {
    const cost = c({ type: 'number', value: 2 }, { type: 'diamond', value: 1 });
    expect(canPayHist(cost, histOf([2]), X)).toBe(false);
    expect(canPayHist(cost, histOf([2]), { ...X, diamonds: 1 })).toBe(true);
    expect(canPayHist(c({ type: 'number', value: 8 }), histOf([1]), { ...X, onesCanBeEights: true })).toBe(true);
    expect(canPayHist(c({ type: 'number', value: 6 }), histOf([]), { ...X, wild: 1 })).toBe(true);
  });
});

describe('deficit', () => {
  it('counts missing pearls', () => {
    const eights = c(...Array.from({ length: 4 }, () => ({ type: 'number', value: 8 }) as CostComponent));
    expect(deficit(eights, histOf([8, 8]), X)).toBe(2);
    expect(deficit(c({ type: 'nTuple', n: 2 }), histOf([3]), X)).toBe(1);
    expect(deficit(c({ type: 'run', length: 5 }), histOf([]), X)).toBe(5);
  });

  it('is impossible without required diamonds', () => {
    expect(deficit(c({ type: 'diamond', value: 1 }), histOf([]), X)).toBeGreaterThanOrEqual(30);
  });
});
