/**
 * blueAbilities — active use of persistent (blue) character abilities.
 *
 * Fixes Lücke 5: no bot ever invoked previewCharacter / swapPortalCharacter /
 * tradeForDiamond, even though the moves exist and are free (no action cost).
 *
 * Handler order (all early-return null when ability is inactive or move is
 * not useful right now):
 *   1. peekCharacterDeck  — before first action, once per turn
 *   2. swapPortalCharacter — before first action, once per turn
 *   3. tradeForDiamond    — anytime, when a 2-pearl is worth trading
 *
 * Note on rehandCards: the engine auto-ends the turn when actionCount ≥
 * maxActions, so no bot hook is available at that point. See tasks.md for
 * follow-up work on this limitation.
 */

import type { GameState, NpcStrategy, CharacterCard } from '@portale-von-molthar/shared';
import { estimateEffort } from '@portale-von-molthar/shared';
import { evaluatePortalSwap, scoreCardForStrategy } from '@portale-von-molthar/shared';
import type { BotAction } from './enumerate';

// ---------------------------------------------------------------------------
// Public entry
// ---------------------------------------------------------------------------

export function pickBlueAbilityAction(
  G: GameState,
  playerID: string,
  strategy: NpcStrategy,
): BotAction | null {
  const player = G.players[playerID];
  if (!player) return null;
  if (!player.activeAbilities || player.activeAbilities.length === 0) return null;

  // ─ Handler 1: peekCharacterDeck (before first action)
  const peek = maybePeek(G, playerID);
  if (peek) return peek;

  // ─ Handler 2: swapPortalCharacter (before first action)
  const swap = maybeSwap(G, playerID, strategy);
  if (swap) return swap;

  // ─ Handler 3: tradeForDiamond (anytime)
  const trade = maybeTrade(G, playerID, strategy);
  if (trade) return trade;

  return null;
}

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

function maybePeek(G: GameState, playerID: string): BotAction | null {
  const player = G.players[playerID];
  if (!player) return null;
  if (G.actionCount > 0) return null;
  if (player.peekedCard) return null; // already peeked this turn
  if (!player.activeAbilities.some(a => a.type === 'previewCharacter')) return null;
  if (G.characterDeck.length === 0) return null;

  return { move: 'peekCharacterDeck', args: [] };
}

function maybeSwap(
  G: GameState,
  playerID: string,
  strategy: NpcStrategy,
): BotAction | null {
  const player = G.players[playerID];
  if (!player) return null;
  if (G.actionCount > 0) return null;
  if (!player.activeAbilities.some(a => a.type === 'changeCharacterActions')) return null;
  if (player.portal.length === 0) return null;
  if (G.characterSlots.length === 0) return null;

  // For each display card, check if swapping in improves the portal.
  let best: { portalSlot: 0 | 1; tableSlot: number; delta: number } | null = null;
  for (let tableIdx = 0; tableIdx < G.characterSlots.length; tableIdx++) {
    const candidate = G.characterSlots[tableIdx];
    if (!candidate) continue;

    // If portal has room, taking the card is normally better than swapping.
    // We only consider swap when portal is full OR when a full swap would
    // strictly improve the weakest slot.
    if (player.portal.length < 2) {
      // Compare candidate to weakest portal card via the same helper.
      // Force-evaluation as if portal were full is not helpful — skip to
      // let the normal takeCharacterCard flow handle this case.
      continue;
    }

    const decision = evaluatePortalSwap(G, playerID, candidate, strategy);
    if (decision.swap && decision.portalSlot !== undefined) {
      if (!best || decision.delta > best.delta) {
        best = { portalSlot: decision.portalSlot, tableSlot: tableIdx, delta: decision.delta };
      }
    }
  }

  if (!best) return null;
  return { move: 'swapPortalCharacter', args: [best.portalSlot, best.tableSlot] };
}

function maybeTrade(
  G: GameState,
  playerID: string,
  strategy: NpcStrategy,
): BotAction | null {
  const player = G.players[playerID];
  if (!player) return null;
  if (!player.activeAbilities.some(a => a.type === 'tradeTwoForDiamond')) return null;

  // Must have a 2-pearl to trade.
  const twoIdx = player.hand.findIndex(c => c.value === 2);
  if (twoIdx === -1) return null;

  // Don't trade if the 2 is currently useful to activate a portal card.
  // Heuristic: if any portal card's cost mentions a 2 explicitly, keep it.
  const twoIsUseful = player.portal.some(entry =>
    entry.card.cost.some(comp => comp.type === 'number' && comp.value === 2),
  );
  if (twoIsUseful) return null;

  // Diamond strategy: always favour trade when possible.
  if (strategy === 'diamond') {
    return { move: 'tradeForDiamond', args: [twoIdx] };
  }

  // Other strategies: only trade when target card has high diamond cost or effort.
  const target = pickHighestEffortPortalTarget(G, playerID);
  if (target) {
    const effort = estimateEffort(target, player.hand, player.diamondCards.length);
    if (effort >= 2) {
      // Score gain from having one more diamond is roughly effort - 1.
      // Only trade when we're not close to activation via the 2.
      const alsoLookScore = scoreCardForStrategy(target, strategy, effort);
      if (alsoLookScore > 4) {
        return { move: 'tradeForDiamond', args: [twoIdx] };
      }
    }
  }

  return null;
}

function pickHighestEffortPortalTarget(
  G: GameState,
  playerID: string,
): CharacterCard | null {
  const player = G.players[playerID];
  if (!player) return null;
  let best: { card: CharacterCard; effort: number } | null = null;
  for (const entry of player.portal) {
    const effort = estimateEffort(entry.card, player.hand, player.diamondCards.length);
    if (!best || effort > best.effort) best = { card: entry.card, effort };
  }
  return best?.card ?? null;
}
