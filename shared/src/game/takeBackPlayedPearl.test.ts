import { describe, it, expect } from 'vitest';
import { PortaleVonMolthar } from './index';
import { applyRedAbility } from './abilityHandlers';
import type { GameState, PearlCard, CharacterCard } from './types';

function makeGameState(numPlayers = 2): GameState {
  const playerIds = Array.from({ length: numPlayers }, (_, i) => String(i));
  return (PortaleVonMolthar as any).setup({ ctx: { playOrder: playerIds, numPlayers } });
}

function makePearlCard(id: string, value: PearlCard['value'] = 3): PearlCard {
  return { id, value, hasSwapSymbol: false };
}

function makeCharCard(id: string): CharacterCard {
  return { id, name: id, imageName: '', cost: [{ type: 'number', value: 3 }], powerPoints: 1, diamonds: 0, abilities: [] };
}

const moves = (PortaleVonMolthar as any).moves;

describe('take-back-played-pearl — playedRealPearlIds tracking', () => {
  it('6.1 activatePortalCard adds consumed real pearl IDs to playedRealPearlIds', () => {
    const G = makeGameState(2);
    const pearlCard = makePearlCard('p1', 3);
    G.players['0']!.hand = [pearlCard];
    G.players['0']!.portal = [{ id: 'slot0', card: makeCharCard('c1'), activated: false }];
    const ctx = { currentPlayer: '0', activePlayers: {} };

    moves.activatePortalCard({ G, ctx, events: {} }, 0, [{ source: 'hand', handCardIndex: 0, value: 3 }]);

    expect(G.playedRealPearlIds).toContain('p1');
  });

  it('6.3 playedRealPearlIds is cleared at turn end (turn.onEnd)', () => {
    const G = makeGameState(2);
    G.playedRealPearlIds = ['p1', 'p2'];
    const ctx = { currentPlayer: '0', activePlayers: {} };
    // Simulate onEnd directly
    (PortaleVonMolthar as any).turn.onEnd({ G, ctx });
    expect(G.playedRealPearlIds).toEqual([]);
  });

  it('6.4 takeBackPlayedPearl ability sets pendingTakeBackPlayedPearl = true', () => {
    const G = makeGameState(2);
    const ctx = { currentPlayer: '0' };
    applyRedAbility(G, ctx, { id: 'a', type: 'takeBackPlayedPearl', persistent: false, description: '' });
    expect(G.pendingTakeBackPlayedPearl).toBe(true);
  });
});

describe('take-back-played-pearl — resolveReturnPearl move', () => {
  it('6.5 resolveReturnPearl moves card to hand, clears flag and log entry', () => {
    const G = makeGameState(2);
    const card = makePearlCard('pearl-x');
    G.pearlDiscardPile.push(card);
    G.playedRealPearlIds = ['pearl-x'];
    G.pendingTakeBackPlayedPearl = true;
    const ctx = { currentPlayer: '0', activePlayers: {} };

    moves.resolveReturnPearl({ G, ctx }, 'pearl-x');

    expect(G.pendingTakeBackPlayedPearl).toBe(false);
    expect(G.playedRealPearlIds).not.toContain('pearl-x');
    expect(G.pearlDiscardPile.find(c => c.id === 'pearl-x')).toBeUndefined();
    expect(G.players['0']!.hand.some(c => c.id === 'pearl-x')).toBe(true);
  });

  it('6.6 resolveReturnPearl no-op when flag not set', () => {
    const G = makeGameState(2);
    const card = makePearlCard('pearl-y');
    G.pearlDiscardPile.push(card);
    G.playedRealPearlIds = ['pearl-y'];
    G.pendingTakeBackPlayedPearl = false;
    const ctx = { currentPlayer: '0', activePlayers: {} };
    const handBefore = G.players['0']!.hand.length;

    moves.resolveReturnPearl({ G, ctx }, 'pearl-y');

    expect(G.pearlDiscardPile).toHaveLength(1);
    expect(G.players['0']!.hand).toHaveLength(handBefore); // unchanged
    expect(G.players['0']!.hand.every(c => c.id !== 'pearl-y')).toBe(true);
  });

  it('6.7 resolveReturnPearl no-op when pearlId not in playedRealPearlIds', () => {
    const G = makeGameState(2);
    const card = makePearlCard('pearl-z');
    G.pearlDiscardPile.push(card);
    G.playedRealPearlIds = ['other-id'];
    G.pendingTakeBackPlayedPearl = true;
    const ctx = { currentPlayer: '0', activePlayers: {} };
    const handBefore = G.players['0']!.hand.length;

    moves.resolveReturnPearl({ G, ctx }, 'pearl-z');

    expect(G.pearlDiscardPile).toHaveLength(1);
    expect(G.pendingTakeBackPlayedPearl).toBe(true);
    expect(G.players['0']!.hand).toHaveLength(handBefore); // unchanged
  });
});

describe('take-back-played-pearl — dismissReturnPearlDialog move', () => {
  it('6.8 dismissReturnPearlDialog clears only the flag', () => {
    const G = makeGameState(2);
    G.pendingTakeBackPlayedPearl = true;
    G.playedRealPearlIds = ['p1'];
    const ctx = { currentPlayer: '0', activePlayers: {} };

    moves.dismissReturnPearlDialog({ G, ctx });

    expect(G.pendingTakeBackPlayedPearl).toBe(false);
    expect(G.playedRealPearlIds).toEqual(['p1']); // log untouched
  });

  it('6.8 dismissReturnPearlDialog is idempotent when flag already false', () => {
    const G = makeGameState(2);
    G.pendingTakeBackPlayedPearl = false;
    const ctx = { currentPlayer: '0', activePlayers: {} };

    moves.dismissReturnPearlDialog({ G, ctx });

    expect(G.pendingTakeBackPlayedPearl).toBe(false);
  });
});
