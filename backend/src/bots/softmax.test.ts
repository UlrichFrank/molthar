import { describe, it, expect } from 'vitest';
import { softmaxPick, STRATEGY_TEMPERATURES } from './softmax';

describe('softmaxPick', () => {
  it('returns the only item when array has one element', () => {
    const result = softmaxPick([{ item: 'only', score: 5 }], 1.0);
    expect(result).toBe('only');
  });

  it('throws on empty array', () => {
    expect(() => softmaxPick([], 1.0)).toThrow();
  });

  it('returns uniform distribution at high temperature', () => {
    const items = [
      { item: 'a', score: 10 },
      { item: 'b', score: 1 },
      { item: 'c', score: 1 },
    ];
    const counts: Record<string, number> = { a: 0, b: 0, c: 0 };
    for (let i = 0; i < 3000; i++) {
      counts[softmaxPick(items, 20)]!++;
    }
    // With very high temperature all items should be picked sometimes
    expect(counts['b']!).toBeGreaterThan(50);
    expect(counts['c']!).toBeGreaterThan(50);
  });

  it('picks best item almost always at low temperature', () => {
    const items = [
      { item: 'best', score: 100 },
      { item: 'bad', score: 1 },
    ];
    const counts: Record<string, number> = { best: 0, bad: 0 };
    for (let i = 0; i < 1000; i++) {
      counts[softmaxPick(items, 0.1)]!++;
    }
    expect(counts['best']!).toBeGreaterThan(950);
  });

  it('handles Infinity temperature as uniform distribution', () => {
    const items = [
      { item: 'a', score: 100 },
      { item: 'b', score: 1 },
    ];
    const counts = { a: 0, b: 0 };
    for (let i = 0; i < 2000; i++) {
      const r = softmaxPick(items, Infinity);
      counts[r as 'a' | 'b']++;
    }
    // Both should be picked roughly equally
    expect(counts.b).toBeGreaterThan(400);
  });

  it('handles negative scores correctly (shifts to min=0)', () => {
    const items = [
      { item: 'low', score: -3 },
      { item: 'mid', score: -1 },
      { item: 'high', score: 2 },
    ];
    const counts: Record<string, number> = { low: 0, mid: 0, high: 0 };
    for (let i = 0; i < 1000; i++) {
      counts[softmaxPick(items, 1.0)]!++;
    }
    // 'high' should be picked most often
    expect(counts['high']!).toBeGreaterThan(counts['mid']!);
    expect(counts['mid']!).toBeGreaterThan(counts['low']!);
    // All should be picked at least once in 1000 tries
    expect(counts['low']!).toBeGreaterThan(0);
  });

  it('STRATEGY_TEMPERATURES has entries for all strategies', () => {
    const strategies = ['random', 'greedy', 'aggressive', 'efficient', 'diamond'] as const;
    for (const s of strategies) {
      expect(STRATEGY_TEMPERATURES[s]).toBeDefined();
      expect(STRATEGY_TEMPERATURES[s]).toBeGreaterThan(0);
    }
    expect(STRATEGY_TEMPERATURES.random).toBe(Infinity);
    expect(STRATEGY_TEMPERATURES.diamond).toBeLessThan(STRATEGY_TEMPERATURES.greedy);
  });
});
