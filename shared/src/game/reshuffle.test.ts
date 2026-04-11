import { describe, it, expect } from 'vitest';
import { PortaleVonMolthar } from './index';
import type { GameState, PearlCard, CharacterCard } from './types';

function makeGameState(numPlayers = 2): GameState {
  const playerIds = Array.from({ length: numPlayers }, (_, i) => String(i));
  return (PortaleVonMolthar as any).setup({ ctx: { playOrder: playerIds, numPlayers } });
}

function makePearlCard(id: string): PearlCard {
  return { id, value: 1, hasSwapSymbol: false, hasRefreshSymbol: false };
}

function makeCharacterCard(id: string): CharacterCard {
  return {
    id,
    name: id,
    imageName: '',
    cost: [],
    powerPoints: 1,
    diamonds: 0,
    abilities: [],
    sharedActivation: false,
  };
}

const moves = (PortaleVonMolthar as any).moves;

describe('reshuffle-empty-decks — pearl deck', () => {
  it('4.1 isReshufflingPearlDeck starts false', () => {
    const G = makeGameState(2);
    expect(G.isReshufflingPearlDeck).toBe(false);
  });

  it('4.1 isReshufflingPearlDeck becomes true when refillSlots reshuffles', () => {
    const G = makeGameState(2);
    // Empty the deck, put cards in discard pile
    G.pearlDeck = [];
    G.pearlSlots = []; // empty slots to trigger refill
    G.pearlDiscardPile = [makePearlCard('p1'), makePearlCard('p2')];

    const ctx = { currentPlayer: '0', activePlayers: {} };
    // takePearlCard with slotIndex=-1 draws from deck; slot is empty so deck.pop() fails → reshuffle
    // Actually we need to trigger refillSlots. Let's take a card via slot -1 after depleting deck.
    // First put one card in deck so the move itself succeeds, but discard has more:
    G.pearlDeck = [makePearlCard('p0')];
    moves.takePearlCard({ G, ctx, events: {} }, -1);
    // After taking, refillSlots runs: deck empty, discard has cards → reshuffle
    expect(G.isReshufflingPearlDeck).toBe(true);
  });

  it('4.3 acknowledgeReshuffle pearl resets flag', () => {
    const G = makeGameState(2);
    G.isReshufflingPearlDeck = true;
    const ctx = { currentPlayer: '0', activePlayers: {} };
    moves.acknowledgeReshuffle({ G, ctx }, 'pearl');
    expect(G.isReshufflingPearlDeck).toBe(false);
  });

  it('4.3 acknowledgeReshuffle pearl is idempotent when already false', () => {
    const G = makeGameState(2);
    G.isReshufflingPearlDeck = false;
    const ctx = { currentPlayer: '0', activePlayers: {} };
    moves.acknowledgeReshuffle({ G, ctx }, 'pearl');
    expect(G.isReshufflingPearlDeck).toBe(false);
  });
});

describe('reshuffle-empty-decks — character deck', () => {
  it('4.2 isReshufflingCharacterDeck starts false', () => {
    const G = makeGameState(2);
    expect(G.isReshufflingCharacterDeck).toBe(false);
  });

  it('4.2 isReshufflingCharacterDeck becomes true when refillSlots reshuffles', () => {
    const G = makeGameState(2);
    // Set up: empty character deck, one card in discard
    G.characterDeck = [makeCharacterCard('c0')];
    G.characterSlots = [];
    G.characterDiscardPile = [makeCharacterCard('c1')];

    const ctx = { currentPlayer: '0', activePlayers: {} };
    // Player portal is empty, take card from slot -1 (deck)
    G.players['0']!.portal = [];
    G.actionCount = 0;
    moves.takeCharacterCard({ G, ctx, events: {} }, -1);
    // After taking c0, refillSlots runs: deck empty, discard has c1 → reshuffle
    expect(G.isReshufflingCharacterDeck).toBe(true);
  });

  it('4.3 acknowledgeReshuffle character resets flag', () => {
    const G = makeGameState(2);
    G.isReshufflingCharacterDeck = true;
    const ctx = { currentPlayer: '0', activePlayers: {} };
    moves.acknowledgeReshuffle({ G, ctx }, 'character');
    expect(G.isReshufflingCharacterDeck).toBe(false);
  });

  it('4.3 acknowledgeReshuffle character is idempotent when already false', () => {
    const G = makeGameState(2);
    G.isReshufflingCharacterDeck = false;
    const ctx = { currentPlayer: '0', activePlayers: {} };
    moves.acknowledgeReshuffle({ G, ctx }, 'character');
    expect(G.isReshufflingCharacterDeck).toBe(false);
  });
});
