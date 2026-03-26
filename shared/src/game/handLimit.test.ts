import { describe, it, expect } from 'vitest';
import { calculateHandLimit, getExcessCardCount } from './costCalculation';
import type { PearlCard } from './types';

describe('Hand Limit Utilities', () => {
  describe('calculateHandLimit', () => {
    it('should return 5 for modifier of 0', () => {
      expect(calculateHandLimit(0)).toBe(5);
    });

    it('should return 6 for modifier of 1', () => {
      expect(calculateHandLimit(1)).toBe(6);
    });

    it('should return 7 for modifier of 2', () => {
      expect(calculateHandLimit(2)).toBe(7);
    });

    it('should return 8 for modifier of 3', () => {
      expect(calculateHandLimit(3)).toBe(8);
    });

    it('should handle negative modifiers', () => {
      // Edge case: if somehow modifier becomes negative, still allow minimum of 5
      expect(calculateHandLimit(-1)).toBe(4);
    });
  });

  describe('getExcessCardCount', () => {
    const createCard = (value: number): PearlCard => ({
      id: `card-${value}`,
      value: value as any,
      hasSwapSymbol: false,
    });

    it('should return 0 when hand is under limit', () => {
      const hand = [createCard(1), createCard(2), createCard(3)];
      expect(getExcessCardCount(hand, 5)).toBe(0);
    });

    it('should return 0 when hand equals limit', () => {
      const hand = [createCard(1), createCard(2), createCard(3), createCard(4), createCard(5)];
      expect(getExcessCardCount(hand, 5)).toBe(0);
    });

    it('should return 1 when hand exceeds limit by 1', () => {
      const hand = [createCard(1), createCard(2), createCard(3), createCard(4), createCard(5), createCard(6)];
      expect(getExcessCardCount(hand, 5)).toBe(1);
    });

    it('should return 3 when hand exceeds limit by 3', () => {
      const hand = [
        createCard(1), createCard(2), createCard(3), createCard(4),
        createCard(5), createCard(6), createCard(7), createCard(8)
      ];
      expect(getExcessCardCount(hand, 5)).toBe(3);
    });

    it('should return 0 for empty hand', () => {
      expect(getExcessCardCount([], 5)).toBe(0);
    });

    it('should calculate correctly with modified hand limit', () => {
      const hand = [createCard(1), createCard(2), createCard(3), createCard(4), createCard(5), createCard(6)];
      // With limit of 6, 1 card exceeds
      expect(getExcessCardCount(hand, 6)).toBe(0);
      // With limit of 5, 1 card exceeds
      expect(getExcessCardCount(hand, 5)).toBe(1);
    });
  });
});
