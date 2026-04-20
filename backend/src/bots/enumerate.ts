/**
 * Enumerates all valid moves for the current player in a given game state.
 * Used by IrrnisBot (RandomBot). Returns boardgame.io-compatible action objects.
 */

import type { GameState, NpcStrategy } from '@portale-von-molthar/shared';
import { canPayCard, findBotPayment } from '@portale-von-molthar/shared';

export interface MoveAction {
  move: string;
  args: unknown[];
}

export interface EventAction {
  event: string;
  args?: unknown[];
}

export type BotAction = MoveAction | EventAction;

/**
 * Return all valid actions the given player can take in the current state.
 */
export function enumerateMoves(
  G: GameState,
  _ctx: { currentPlayer: string },
  playerID: string,
  strategy: NpcStrategy = 'random',
): BotAction[] {
  const player = G.players[playerID];
  if (!player) return [];

  const actions: BotAction[] = [];

  if (G.actionCount >= G.maxActions) {
    actions.push({ event: 'endTurn' });
    return actions;
  }

  // Handle pending states first (these must be resolved before normal actions)
  if (G.pendingStealOpponentHandCard) {
    const opponents = Object.values(G.players).filter(
      p => p.id !== playerID && p.hand.length > 0,
    );
    for (const opp of opponents) {
      for (let i = 0; i < opp.hand.length; i++) {
        actions.push({ move: 'resolveStealOpponentHandCard', args: [opp.id, i] });
      }
    }
    return actions;
  }

  if (G.pendingDiscardOpponentCharacter) {
    const opponents = Object.values(G.players).filter(
      p => p.id !== playerID && p.portal.length > 0,
    );
    for (const opp of opponents) {
      for (let i = 0; i < opp.portal.length; i++) {
        actions.push({ move: 'resolveDiscardOpponentCharacter', args: [opp.id, i] });
      }
    }
    return actions;
  }

  if (G.pendingTakeBackPlayedPearl) {
    for (const pearlId of G.playedRealPearlIds) {
      if (G.pearlDiscardPile.some(p => p.id === pearlId)) {
        actions.push({ move: 'resolveReturnPearl', args: [pearlId] });
        break; // one option is sufficient for random bot
      }
    }
    if (actions.length === 0) {
      actions.push({ move: 'dismissReturnPearlDialog', args: [] });
    }
    return actions;
  }

  // activatePortalCard — one action per payable portal slot
  for (let i = 0; i < player.portal.length; i++) {
    const entry = player.portal[i];
    if (!entry) continue;
    if (canPayCard(entry.card, player.hand, player.diamondCards.length)) {
      const payment = findBotPayment(
        entry.card,
        player.hand,
        player.diamondCards.length,
        strategy,
      );
      if (payment) {
        actions.push({ move: 'activatePortalCard', args: [i, payment] });
      }
    }
  }

  // takePearlCard — 4 visible slots + blind from deck
  for (let i = 0; i < 4; i++) {
    if (G.pearlSlots[i] !== null && G.pearlSlots[i] !== undefined) {
      actions.push({ move: 'takePearlCard', args: [i] });
    }
  }
  if (G.pearlDeck.length > 0 || G.pearlDiscardPile.length > 0) {
    actions.push({ move: 'takePearlCard', args: [-1] });
  }

  // takeCharacterCard — visible display + blind
  for (let i = 0; i < G.characterSlots.length; i++) {
    if (player.portal.length < 2) {
      actions.push({ move: 'takeCharacterCard', args: [i] });
    } else {
      // Portal full: replace slot 0 or slot 1
      actions.push({ move: 'takeCharacterCard', args: [i, 0] });
      actions.push({ move: 'takeCharacterCard', args: [i, 1] });
    }
  }
  if (G.characterDeck.length > 0 || G.characterDiscardPile.length > 0) {
    if (player.portal.length < 2) {
      actions.push({ move: 'takeCharacterCard', args: [-1] });
    } else {
      actions.push({ move: 'takeCharacterCard', args: [-1, 0] });
    }
  }

  // replacePearlSlots
  actions.push({ move: 'replacePearlSlots', args: [] });

  // endTurn (always available once actions are used)
  actions.push({ event: 'endTurn' });

  return actions;
}
