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
 *   4. rehandCards        — end-of-turn only (actionCount ≥ maxActions),
 *                            when hand can't afford any portal card
 *
 * The `options.onlyEndOfTurn` flag restricts the dispatcher to handlers that
 * are valid at turn-end (currently: rehandCards only). The simulation engine
 * uses this to invoke rehandCards before auto-ending the turn.
 */

import type { GameState, NpcStrategy, CharacterCard } from '@portale-von-molthar/shared';
import { estimateEffort, canPayCard } from '@portale-von-molthar/shared';
import { evaluatePortalSwap, scoreCardForStrategy } from '@portale-von-molthar/shared';
import type { MoveAction } from './enumerate';

// ---------------------------------------------------------------------------
// Public entry
// ---------------------------------------------------------------------------

export function pickBlueAbilityAction(
  G: GameState,
  playerID: string,
  strategy: NpcStrategy,
  options?: { onlyEndOfTurn?: boolean },
): MoveAction | null {
  const player = G.players[playerID];
  if (!player) return null;
  if (!player.activeAbilities || player.activeAbilities.length === 0) return null;

  const onlyEndOfTurn = options?.onlyEndOfTurn === true;

  if (onlyEndOfTurn) {
    // End-of-turn handlers only — skip peek/swap/trade (all pre-first-action
    // or anytime, and either useless or invalid once actionCount is at max).
    return maybeRehand(G, playerID, strategy);
  }

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

function maybePeek(G: GameState, playerID: string): MoveAction | null {
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
): MoveAction | null {
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

    const decision = evaluatePortalSwap(G, playerID, candidate, strategy, G.pearlDeck.length);
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
): MoveAction | null {
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
      const alsoLookScore = scoreCardForStrategy(target, strategy, effort, G.pearlDeck.length);
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

/**
 * maybeRehand — fires at end of turn when the current hand is dead-weight.
 *
 * Only proposes `rehandCards` when:
 *   - The player has the `changeHandActions` ability active
 *   - actionCount >= maxActions (the move's server-side guard)
 *   - Player has at least one portal card (something to save the hand for)
 *   - The current hand cannot pay any portal card
 *
 * Doesn't call itself twice per turn — the engine tracks that separately.
 */
function maybeRehand(
  G: GameState,
  playerID: string,
  _strategy: NpcStrategy,
): MoveAction | null {
  const player = G.players[playerID];
  if (!player) return null;
  if (!player.activeAbilities.some(a => a.type === 'changeHandActions')) return null;
  if (G.actionCount < G.maxActions) return null;
  if (player.portal.length === 0) return null;
  if (player.hand.length === 0) return null;

  const diamonds = player.diamondCards.length;
  const anyPayable = player.portal.some(entry =>
    canPayCard(entry.card, player.hand, diamonds),
  );
  if (anyPayable) return null;

  return { move: 'rehandCards', args: [] };
}
