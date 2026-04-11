import { describe, it, expect } from 'vitest';
import { PortaleVonMolthar } from './index';
import { applyRedAbility } from './abilityHandlers';
import type { GameState, PearlCard } from './types';

function makeGameState(numPlayers = 2): GameState {
  const playerIds = Array.from({ length: numPlayers }, (_, i) => String(i));
  return (PortaleVonMolthar as any).setup({ ctx: { playOrder: playerIds, numPlayers } });
}

function makePearlCard(id: string): PearlCard {
  return { id, value: 3, hasSwapSymbol: false, hasRefreshSymbol: false };
}

const moves = (PortaleVonMolthar as any).moves;

describe('steal-opponent-hand-card — ability handler', () => {
  it('4.1 sets pendingStealOpponentHandCard when opponent has cards', () => {
    const G = makeGameState(2);
    G.players['1']!.hand = [makePearlCard('p1')];
    const ctx = { currentPlayer: '0', activePlayers: {} };
    // Simulate applyRedAbility via activatePortalCard flow is complex;
    // test the flag directly via abilityHandlers
    applyRedAbility(G, ctx, { id: 'test-steal', type: 'stealOpponentHandCard', persistent: false, description: '' });
    expect(G.pendingStealOpponentHandCard).toBe(true);
  });

  it('4.2 does NOT set flag when no opponent has cards', () => {
    const G = makeGameState(2);
    G.players['1']!.hand = [];
    const ctx = { currentPlayer: '0', activePlayers: {} };
    applyRedAbility(G, ctx, { id: 'test-steal', type: 'stealOpponentHandCard', persistent: false, description: '' });
    expect(G.pendingStealOpponentHandCard).toBe(false);
  });
});

describe('steal-opponent-hand-card — resolveStealOpponentHandCard move', () => {
  it('4.3 transfers card correctly and resets flag', () => {
    const G = makeGameState(2);
    const card = makePearlCard('stolen-card');
    G.players['1']!.hand = [card];
    G.pendingStealOpponentHandCard = true;
    const ctx = { currentPlayer: '0', activePlayers: {} };
    moves.resolveStealOpponentHandCard({ G, ctx }, '1', 0);
    expect(G.pendingStealOpponentHandCard).toBe(false);
    expect(G.players['1']!.hand).toHaveLength(0);
    expect(G.players['0']!.hand.some(c => c.id === 'stolen-card')).toBe(true);
  });

  it('4.4 no-op when flag not set', () => {
    const G = makeGameState(2);
    const card = makePearlCard('card1');
    G.players['1']!.hand = [card];
    G.pendingStealOpponentHandCard = false;
    const ctx = { currentPlayer: '0', activePlayers: {} };
    moves.resolveStealOpponentHandCard({ G, ctx }, '1', 0);
    expect(G.players['1']!.hand).toHaveLength(1);
    expect(G.players['0']!.hand.every(c => c.id !== 'card1')).toBe(true);
  });

  it('4.5 no-op when targetPlayerId is own player', () => {
    const G = makeGameState(2);
    G.players['0']!.hand = [makePearlCard('own-card')];
    G.pendingStealOpponentHandCard = true;
    const ctx = { currentPlayer: '0', activePlayers: {} };
    const handBefore = G.players['0']!.hand.length;
    moves.resolveStealOpponentHandCard({ G, ctx }, '0', 0);
    expect(G.pendingStealOpponentHandCard).toBe(true); // unchanged
    expect(G.players['0']!.hand).toHaveLength(handBefore);
  });

  it('4.6 no-op when handCardIndex is out of range', () => {
    const G = makeGameState(2);
    G.players['1']!.hand = [makePearlCard('p1')];
    G.pendingStealOpponentHandCard = true;
    const ctx = { currentPlayer: '0', activePlayers: {} };
    moves.resolveStealOpponentHandCard({ G, ctx }, '1', 5);
    expect(G.pendingStealOpponentHandCard).toBe(true); // unchanged
    expect(G.players['1']!.hand).toHaveLength(1);
  });
});
