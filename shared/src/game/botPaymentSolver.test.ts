import { describe, it, expect } from 'vitest';
import { canPayCard, findBotPayment, chooseBestPayment } from './botPaymentSolver';
import type { CharacterCard, PearlCard, CostComponent, PaymentSelection } from './types';

function makeCard(value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): PearlCard {
  return { id: `p-${value}-${Math.random()}`, value, hasSwapSymbol: false, hasRefreshSymbol: false };
}

function makeCharacter(cost: CostComponent[], powerPoints = 3, diamonds = 0): CharacterCard {
  return {
    id: `char-${Math.random()}`,
    name: 'TestChar',
    imageName: 'test',
    cost,
    powerPoints,
    diamonds,
    abilities: [],
  };
}

describe('canPayCard', () => {
  it('returns true when exact card value matches', () => {
    const hand = [makeCard(5)];
    const char = makeCharacter([{ type: 'number', value: 5 }]);
    expect(canPayCard(char, hand, 0)).toBe(true);
  });

  it('returns false when hand does not match', () => {
    const hand = [makeCard(3)];
    const char = makeCharacter([{ type: 'number', value: 7 }]);
    expect(canPayCard(char, hand, 0)).toBe(false);
  });

  it('returns true for diamond cost when diamonds available', () => {
    const char = makeCharacter([{ type: 'diamond', value: 2 }]);
    expect(canPayCard(char, [], 2)).toBe(true);
  });

  it('returns false for diamond cost when not enough diamonds', () => {
    const char = makeCharacter([{ type: 'diamond', value: 2 }]);
    expect(canPayCard(char, [], 1)).toBe(false);
  });

  it('returns true for sumAnyTuple when sum is satisfied', () => {
    const hand = [makeCard(3), makeCard(7)];
    const char = makeCharacter([{ type: 'sumAnyTuple', sum: 10 }]);
    expect(canPayCard(char, hand, 0)).toBe(true);
  });

  it('returns false when no combination satisfies cost', () => {
    const hand = [makeCard(1), makeCard(2), makeCard(3)];
    const char = makeCharacter([{ type: 'number', value: 8 }]);
    expect(canPayCard(char, hand, 0)).toBe(false);
  });
});

describe('findBotPayment', () => {
  it('returns PaymentSelection for a simple number cost', () => {
    const hand = [makeCard(3), makeCard(5)];
    const char = makeCharacter([{ type: 'number', value: 5 }]);
    const payment = findBotPayment(char, hand, 0, 'greedy');
    expect(payment).not.toBeNull();
    expect(payment!.length).toBe(1);
    expect(payment![0]!.value).toBe(5);
    expect(payment![0]!.source).toBe('hand');
    expect(payment![0]!.handCardIndex).toBe(1);
  });

  it('returns null when card cannot be paid', () => {
    const hand = [makeCard(2), makeCard(3)];
    const char = makeCharacter([{ type: 'number', value: 8 }]);
    expect(findBotPayment(char, hand, 0, 'greedy')).toBeNull();
  });

  it('efficient strategy preserves high-value cards', () => {
    const hand = [makeCard(8), makeCard(3), makeCard(5)];
    const char = makeCharacter([{ type: 'number', value: 5 }]);
    const payment = findBotPayment(char, hand, 0, 'efficient');
    expect(payment).not.toBeNull();
    // Should use the 5 (value 5), not the 8
    expect(payment![0]!.value).toBe(5);
  });

  it('efficient strategy uses lowest-sum combination for sumAnyTuple', () => {
    // Hand: [2, 3, 8], cost: sumAnyTuple(5)
    // Possible: [2,3] or [5] not in hand... → uses [2,3]
    const hand = [makeCard(8), makeCard(2), makeCard(3)];
    const char = makeCharacter([{ type: 'sumAnyTuple', sum: 5 }]);
    const payment = findBotPayment(char, hand, 0, 'efficient');
    expect(payment).not.toBeNull();
    const totalValue = payment!.reduce((s, p) => s + p.value, 0);
    expect(totalValue).toBe(5);
    // The 8 should NOT be used
    expect(payment!.some(p => p.value === 8)).toBe(false);
  });

  it('works for nTuple cost (pair)', () => {
    const hand = [makeCard(4), makeCard(4), makeCard(7)];
    const char = makeCharacter([{ type: 'nTuple', n: 2 }]);
    const payment = findBotPayment(char, hand, 0, 'greedy');
    expect(payment).not.toBeNull();
    expect(payment!.length).toBe(2);
    expect(payment![0]!.value).toBe(payment![1]!.value);
  });

  it('works for run cost', () => {
    const hand = [makeCard(4), makeCard(5), makeCard(6), makeCard(8)];
    const char = makeCharacter([{ type: 'run', length: 3 }]);
    const payment = findBotPayment(char, hand, 0, 'random');
    expect(payment).not.toBeNull();
    expect(payment!.length).toBe(3);
    const values = payment!.map(p => p.value).sort((a, b) => a - b);
    expect(values[1]! - values[0]!).toBe(1);
    expect(values[2]! - values[1]!).toBe(1);
  });

  it('all strategies return valid payment for same card', () => {
    const hand = [makeCard(3), makeCard(4), makeCard(7)];
    const char = makeCharacter([{ type: 'sumAnyTuple', sum: 7 }]);
    for (const strategy of ['random', 'greedy', 'diamond', 'efficient', 'aggressive'] as const) {
      const payment = findBotPayment(char, hand, 0, strategy);
      expect(payment).not.toBeNull();
      const total = payment!.reduce((s, p) => s + p.value, 0);
      expect(total).toBe(7);
    }
  });
});

describe('chooseBestPayment', () => {
  const hand = [makeCard(2), makeCard(5), makeCard(8)];

  const combos: PaymentSelection[][] = [
    [{ source: 'hand', handCardIndex: 0, value: 2 }, { source: 'hand', handCardIndex: 1, value: 5 }],
    [{ source: 'hand', handCardIndex: 0, value: 2 }, { source: 'hand', handCardIndex: 2, value: 8 }],
  ];

  it('returns null for empty combinations', () => {
    expect(chooseBestPayment([], 'greedy')).toBeNull();
  });

  it('greedy returns first combo', () => {
    const result = chooseBestPayment(combos, 'greedy');
    expect(result).toBe(combos[0]);
  });

  it('efficient picks combo that leaves highest remaining hand value', () => {
    // combo[0] spends [2,5] → remaining: [8] (value 8)
    // combo[1] spends [2,8] → remaining: [5] (value 5)
    // efficient should prefer combo[0] (remaining 8 > 5)
    const result = chooseBestPayment(combos, 'efficient', hand);
    expect(result).toBe(combos[0]);
  });

  it('random returns one of the combos', () => {
    const result = chooseBestPayment(combos, 'random');
    expect(combos).toContain(result);
  });
});
