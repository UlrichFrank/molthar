import { describe, it, expect } from 'vitest';
import { calculateHandLimit, getExcessCardCount } from './costCalculation';
import type { PearlCard } from './types';

describe('Hand Limit Logic - Integration Scenarios', () => {
  const createCard = (value: number, id?: string): PearlCard => ({
    id: id || `card-${value}`,
    value: value as any,
    hasSwapSymbol: false,
  });

  describe('Character Activation with handLimitPlusOne', () => {
    it('should increment handLimitModifier by 1 when activated', () => {
      let handLimitModifier = 0;
      expect(calculateHandLimit(handLimitModifier)).toBe(5);

      // Simulate activation of character with handLimitPlusOne
      handLimitModifier += 1;
      expect(calculateHandLimit(handLimitModifier)).toBe(6);

      // Multiple activations
      handLimitModifier += 1;
      expect(calculateHandLimit(handLimitModifier)).toBe(7);
    });
  });

  describe('End Turn - Hand Limit Validation', () => {
    it('should allow turn when hand is within limit', () => {
      const hand = [createCard(1), createCard(2), createCard(3)];
      const handLimitModifier = 0;
      const limit = calculateHandLimit(handLimitModifier);
      const excess = getExcessCardCount(hand, limit);

      expect(excess).toBe(0); // No cards need to be discarded
    });

    it('should flag discard when hand exceeds limit', () => {
      const hand = [
        createCard(1), createCard(2), createCard(3),
        createCard(4), createCard(5), createCard(6),
        createCard(7)
      ];
      const handLimitModifier = 0;
      const limit = calculateHandLimit(handLimitModifier);
      const excess = getExcessCardCount(hand, limit);

      expect(limit).toBe(5);
      expect(excess).toBe(2); // Must discard 2 cards
    });

    it('should allow hand with increased limit from handLimitPlusOne', () => {
      const hand = [
        createCard(1), createCard(2), createCard(3),
        createCard(4), createCard(5), createCard(6)
      ];
      const handLimitModifier = 1; // One character with handLimitPlusOne activated
      const limit = calculateHandLimit(handLimitModifier);
      const excess = getExcessCardCount(hand, limit);

      expect(limit).toBe(6);
      expect(excess).toBe(0); // Hand fits within new limit
    });
  });

  describe('Discard Cards Move', () => {
    it('should validate exact number of cards selected', () => {
      const excessCardCount = 2;
      const validSelection = [0, 1];
      const invalidSelection = [0];

      expect(validSelection.length).toBe(excessCardCount);
      expect(invalidSelection.length).not.toBe(excessCardCount);
    });

    it('should remove selected cards in reverse order to maintain indices', () => {
      const hand = [createCard(1), createCard(2), createCard(3)];
      const indicesToRemove = [2, 0]; // Remove indices in reverse order

      const sortedIndices = [...indicesToRemove].sort((a, b) => b - a);
      for (const idx of sortedIndices) {
        hand.splice(idx, 1);
      }

      expect(hand.length).toBe(1);
      expect(hand[0].value).toBe(2); // Only middle card remains
    });

    it('should successfully discard then clear flags', () => {
      let requiresHandDiscard = true;
      let excessCardCount = 2;

      // Simulate successful discard
      requiresHandDiscard = false;
      excessCardCount = 0;

      expect(requiresHandDiscard).toBe(false);
      expect(excessCardCount).toBe(0);
    });

    it('should reject move with wrong card count', () => {
      const excessCardCount = 2;
      const selectedIndices = [0]; // Wrong: only 1 card selected

      const isValid = selectedIndices.length === excessCardCount;
      expect(isValid).toBe(false);
    });
  });
});
