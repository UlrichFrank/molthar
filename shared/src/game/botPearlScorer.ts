/**
 * botPearlScorer — strategy-aware pearl slot scoring for NPC bots.
 *
 * Three signals combined into a weighted score:
 *   score = w_help × helpfulness + w_urgency × urgency - w_contest × contestedness
 *
 * Signal 1 – Helpfulness: does this pearl reduce estimateEffort for my target card?
 * Signal 2 – Urgency: how scarce is this value in the remaining deck?
 * Signal 3 – Contestedness: how many other players benefit from this value?
 */

import type { CharacterCard, GameState, NpcStrategy, PearlCard } from './types.js';
import { findCostAssignment } from './costCalculation.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PearlWeights {
  help: number;
  urgency: number;
  contest: number;
}

// ---------------------------------------------------------------------------
// Strategy weights
// ---------------------------------------------------------------------------

const STRATEGY_WEIGHTS: Record<NpcStrategy, PearlWeights> = {
  greedy:     { help: 3,   urgency: 1.5, contest: 0.5 },
  efficient:  { help: 3,   urgency: 2,   contest: 0.5 },
  diamond:    { help: 3,   urgency: 1.5, contest: 0.5 },
  aggressive: { help: 2,   urgency: 1.5, contest: 3   },
  random:     { help: 0,   urgency: 0,   contest: 0   },
};

export function getStrategyWeights(strategy: NpcStrategy): PearlWeights {
  return STRATEGY_WEIGHTS[strategy];
}

// ---------------------------------------------------------------------------
// estimateEffort — how many more pearls are needed to pay for a card?
// 0 = already payable now.
// ---------------------------------------------------------------------------

export function estimateEffort(
  card: CharacterCard,
  hand: PearlCard[],
  diamondCount: number,
): number {
  if (findCostAssignment(card.cost, hand, diamondCount) !== null) return 0;
  let missing = 0;
  for (const comp of card.cost ?? []) {
    if (comp.type === 'diamond') {
      if (diamondCount < (comp.value ?? 1)) missing++;
    } else {
      missing++;
    }
  }
  return Math.max(1, missing);
}

// ---------------------------------------------------------------------------
// pickTargetCard — which card is the bot currently working towards?
// Portal-first, then characterSlots display, then null.
// ---------------------------------------------------------------------------

export function pickTargetCard(
  G: GameState,
  playerID: string,
  strategy: NpcStrategy,
): CharacterCard | null {
  const player = G.players[playerID];
  if (!player) return null;

  const portalCards = player.portal.map(e => e.card);
  const displayCards = G.characterSlots;

  const candidates = [...portalCards, ...displayCards];
  if (candidates.length === 0) return null;

  switch (strategy) {
    case 'greedy':
      // highest power points
      return candidates.reduce((best, c) =>
        c.powerPoints > best.powerPoints ? c : best,
      );

    case 'efficient': {
      // best points / (effort + 1) ratio
      const diamonds = player.diamondCards.length;
      return candidates.reduce((best, c) => {
        const effortC = estimateEffort(c, player.hand, diamonds);
        const effortB = estimateEffort(best, player.hand, diamonds);
        const scoreC = effortC === 0 ? c.powerPoints : c.powerPoints / (effortC + 1);
        const scoreB = effortB === 0 ? best.powerPoints : best.powerPoints / (effortB + 1);
        return scoreC > scoreB ? c : best;
      });
    }

    case 'diamond':
      // most diamonds, tiebreak: most power points
      return candidates.reduce((best, c) =>
        c.diamonds > best.diamonds ||
        (c.diamonds === best.diamonds && c.powerPoints > best.powerPoints)
          ? c
          : best,
      );

    case 'aggressive': {
      // card with red ability if available, otherwise highest points
      const hasRed = (card: CharacterCard) =>
        card.abilities.some(
          a =>
            !a.persistent &&
            ['discardOpponentCharacter', 'stealOpponentHandCard'].includes(a.type),
        );
      const redCards = candidates.filter(hasRed);
      const pool = redCards.length > 0 ? redCards : candidates;
      return pool.reduce((best, c) =>
        c.powerPoints > best.powerPoints ? c : best,
      );
    }

    default:
      return candidates[0] ?? null;
  }
}

// ---------------------------------------------------------------------------
// scorePearlSlot — compute a weighted score for taking a pearl of `pearlValue`
// ---------------------------------------------------------------------------

/**
 * Score how desirable it is to take a pearl of `pearlValue`.
 * Higher = better.
 *
 * @param pearlValue  The value of the pearl being evaluated (1–8)
 * @param targetCard  The bot's current target card (may be null)
 * @param G           Full game state
 * @param myPlayerID  The bot's player ID
 * @param weights     Strategy-specific weights
 */
export function scorePearlSlot(
  pearlValue: number,
  targetCard: CharacterCard | null,
  G: GameState,
  myPlayerID: string,
  weights: PearlWeights,
): number {
  const player = G.players[myPlayerID];
  if (!player) return 0;

  // --- Signal 1: Helpfulness ---
  let helpfulness = 0;
  if (targetCard && weights.help > 0) {
    const diamonds = player.diamondCards.length;
    const effortBefore = estimateEffort(targetCard, player.hand, diamonds);
    const virtualHand: PearlCard[] = [
      ...player.hand,
      { id: '__virtual__', value: pearlValue as PearlCard['value'], hasSwapSymbol: false, hasRefreshSymbol: false },
    ];
    const effortAfter = estimateEffort(targetCard, virtualHand, diamonds);
    helpfulness = Math.max(0, effortBefore - effortAfter);
  }

  // --- Signal 2: Urgency ---
  let urgency = 0;
  if (weights.urgency > 0) {
    const deckSize = G.pearlDeck.length;
    const remaining = G.pearlDeck.filter(p => p.value === pearlValue).length;

    if (deckSize > 0) {
      const availability = remaining / deckSize;
      urgency = 1 - availability;
      // Dampen urgency when reshuffle is imminent (deck almost empty)
      if (deckSize < 4) urgency *= 0.5;
    }
    // If deck is empty, reshuffle is immediate — urgency irrelevant
  }

  // --- Signal 3: Contestedness ---
  let contestedness = 0;
  if (weights.contest > 0) {
    const myPos = G.playerOrder.indexOf(myPlayerID);
    const totalPlayers = G.playerOrder.length;

    for (const otherID of G.playerOrder) {
      if (otherID === myPlayerID) continue;
      const other = G.players[otherID];
      if (!other) continue;

      // Find other player's target card (highest-points card in their portal)
      const otherTargets = other.portal.map(e => e.card);
      if (otherTargets.length === 0) continue;
      const otherTarget = otherTargets.reduce((best, c) =>
        c.powerPoints > best.powerPoints ? c : best,
      );

      const otherDiamonds = other.diamondCards.length;
      const otherEffortBefore = estimateEffort(otherTarget, other.hand, otherDiamonds);
      const otherVirtualHand: PearlCard[] = [
        ...other.hand,
        { id: '__virtual__', value: pearlValue as PearlCard['value'], hasSwapSymbol: false, hasRefreshSymbol: false },
      ];
      const otherEffortAfter = estimateEffort(otherTarget, otherVirtualHand, otherDiamonds);
      const benefit = Math.max(0, otherEffortBefore - otherEffortAfter);

      if (benefit > 0) {
        // Weight by turn proximity: next player counts double
        const otherPos = G.playerOrder.indexOf(otherID);
        const turnsUntil = ((otherPos - myPos + totalPlayers) % totalPlayers);
        const proximityWeight = turnsUntil === 1 ? 2 : 1;
        contestedness += benefit * proximityWeight;
      }
    }
  }

  return weights.help * helpfulness + weights.urgency * urgency - weights.contest * contestedness;
}

// ---------------------------------------------------------------------------
// bestPearlSlotByScore — pick the slot index with the highest score
// Returns null if no pearl slots are available.
// ---------------------------------------------------------------------------

/**
 * Gibt alle nicht-leeren Perlenslots mit ihrem Score zurück.
 * Bots können darauf Softmax anwenden.
 */
export function scoredPearlSlots(
  G: GameState,
  playerID: string,
  strategy: NpcStrategy,
): Array<{ slot: number; score: number }> {
  const weights = getStrategyWeights(strategy);
  const targetCard = pickTargetCard(G, playerID, strategy);

  const result: Array<{ slot: number; score: number }> = [];

  for (let i = 0; i < G.pearlSlots.length; i++) {
    const pearl = G.pearlSlots[i];
    if (!pearl) continue;
    const score = scorePearlSlot(pearl.value, targetCard, G, playerID, weights);
    result.push({ slot: i, score });
  }

  return result;
}

export function bestPearlSlotByScore(
  G: GameState,
  playerID: string,
  strategy: NpcStrategy,
): number | null {
  const scored = scoredPearlSlots(G, playerID, strategy);
  if (scored.length === 0) return null;

  return scored.reduce((best, curr) => (curr.score > best.score ? curr : best)).slot;
}
