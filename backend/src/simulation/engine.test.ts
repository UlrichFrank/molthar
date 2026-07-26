/**
 * Simulation engine tests — determinism and basic correctness.
 */

import { describe, it, expect } from 'vitest';
import { runGame } from './engine';

describe('runGame determinism', () => {
  it('same seed produces identical result', () => {
    const config = {
      gameId: 'test-1',
      strategies: { '0': 'greedy' as const, '1': 'diamond' as const },
      seed: 'determinism-test',
    };
    const r1 = runGame(config);
    const r2 = runGame({ ...config, gameId: 'test-2' });

    expect(r1.ranking.map(r => r.powerPoints)).toEqual(r2.ranking.map(r => r.powerPoints));
    expect(r1.ranking.map(r => r.strategy)).toEqual(r2.ranking.map(r => r.strategy));
    expect(r1.rounds).toBe(r2.rounds);
    expect(r1.totalActions).toBe(r2.totalActions);
  });

  it('different seeds produce different games', () => {
    const base = {
      strategies: { '0': 'greedy' as const, '1': 'diamond' as const },
    };
    const results = Array.from({ length: 5 }, (_, i) =>
      runGame({ ...base, gameId: `g${i}`, seed: `vary:${i}` }),
    );
    const actionCounts = results.map(r => r.totalActions);
    // At least 2 out of 5 games should differ in length
    const unique = new Set(actionCounts);
    expect(unique.size).toBeGreaterThan(1);
  });

  it('game completes without abort', () => {
    const result = runGame({
      gameId: 'complete-test',
      strategies: { '0': 'efficient' as const, '1': 'aggressive' as const },
      seed: 'complete-test',
    });
    expect(result.aborted).toBe(false);
    expect(result.ranking.length).toBe(2);
    expect(result.ranking[0]!.powerPoints).toBeGreaterThanOrEqual(12);
  });

  it('verbose log has entries when enabled', () => {
    const result = runGame({
      gameId: 'verbose-test',
      strategies: { '0': 'random' as const, '1': 'greedy' as const },
      seed: 'verbose-test',
      verbose: true,
    });
    expect(result.log.length).toBeGreaterThan(0);
    expect(result.log[0]).toHaveProperty('move');
    expect(result.log[0]).toHaveProperty('snapshot');
  });

  it('no log when verbose is false', () => {
    const result = runGame({
      gameId: 'no-verbose',
      strategies: { '0': 'random' as const, '1': 'greedy' as const },
      seed: 'no-verbose',
      verbose: false,
    });
    expect(result.log).toHaveLength(0);
  });
});
