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
    // Auslage voll (4 Karten), Deck hat 1 Karte, Discard hat Karten
    G.pearlDeck = [makePearlCard('p0')];
    G.pearlSlots = [makePearlCard('s1'), makePearlCard('s2'), makePearlCard('s3'), makePearlCard('s4')];
    G.pearlDiscardPile = [makePearlCard('p1'), makePearlCard('p2')];

    const ctx = { currentPlayer: '0', activePlayers: {} };
    // takePearlCard mit slotIndex=-1 zieht p0 vom Deck (Deck danach leer)
    // Proaktiver Reshuffle: Deck leer, Auslage voll (4 Karten) → Discard wird gemischt
    moves.takePearlCard({ G, ctx, events: {} }, -1);
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

  it('3.3 takePearlCard — letzte Deck-Karte gezogen, Auslage voll → proaktiver Reshuffle, Deck neu befüllt', () => {
    const G = makeGameState(2);
    // Deck has 1 card, display already full (4 slots), discard has cards
    G.pearlDeck = [makePearlCard('p_last')];
    G.pearlSlots = [makePearlCard('s1'), makePearlCard('s2'), makePearlCard('s3'), makePearlCard('s4')];
    G.pearlDiscardPile = [makePearlCard('d1'), makePearlCard('d2'), makePearlCard('d3')];
    G.players['0']!.hand = [];
    G.actionCount = 0;
    const ctx = { currentPlayer: '0', activePlayers: {} };
    moves.takePearlCard({ G, ctx, events: {} }, -1);
    // Deck should be refilled from discard pile
    expect(G.pearlDeck.length).toBeGreaterThan(0);
    expect(G.pearlDiscardPile.length).toBe(0);
    expect(G.isReshufflingPearlDeck).toBe(true);
  });

  it('3.4 takePearlCard — letzte Deck-Karte gezogen, Auslage nicht voll → kein proaktiver Reshuffle', () => {
    const G = makeGameState(2);
    // Deck hat 1 Karte, Auslage hat 1 leeren Slot (nicht voll), Discard hat Karten
    G.pearlDeck = [makePearlCard('p_last')];
    G.pearlSlots = [makePearlCard('s1'), makePearlCard('s2'), makePearlCard('s3'), null];
    G.pearlDiscardPile = [makePearlCard('d1'), makePearlCard('d2')];
    G.players['0']!.hand = [];
    G.actionCount = 0;
    const ctx = { currentPlayer: '0', activePlayers: {} };
    moves.takePearlCard({ G, ctx, events: {} }, -1);
    // filledSlots = 3 (< 4) → proaktiver Reshuffle wird NICHT ausgelöst
    expect(G.isReshufflingPearlDeck).toBe(false);
    // Discard bleibt unverändert (kein Reshuffle)
    expect(G.pearlDiscardPile.length).toBe(2);
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

  it('3.1 takeCharacterCard — leerem Deck, befülltem Ablagestapel → drawCard reshuffles, Karte gezogen', () => {
    const G = makeGameState(2);
    // Deck is empty, discard has 2 cards
    G.characterDeck = [];
    G.characterSlots = [];
    G.characterDiscardPile = [makeCharacterCard('d1'), makeCharacterCard('d2')];
    G.players['0']!.portal = [];
    G.actionCount = 0;
    const ctx = { currentPlayer: '0', activePlayers: {} };
    const result = moves.takeCharacterCard({ G, ctx, events: {} }, -1);
    expect(result).not.toBe('INVALID_MOVE');
    expect(G.players['0']!.portal.length).toBe(1);
    expect(G.isReshufflingCharacterDeck).toBe(true);
  });

  it('3.2 discardPickedCharacterCard — leerem Deck, befülltem Ablagestapel → drawCard reshuffles, Karte verworfen', () => {
    const G = makeGameState(2);
    G.characterDeck = [];
    G.characterSlots = [];
    G.characterDiscardPile = [makeCharacterCard('d1'), makeCharacterCard('d2')];
    G.players['0']!.portal = [];
    G.actionCount = 0;
    const ctx = { currentPlayer: '0', activePlayers: {} };
    const result = moves.discardPickedCharacterCard({ G, ctx, events: {} }, -1);
    expect(result).not.toBe('INVALID_MOVE');
    // drawCard reshuffled the discard before drawing
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
