import { describe, it, expect } from 'vitest';
import { PortaleVonMolthar } from './index';
import type { GameState, PearlCard, CharacterCard } from './types';

function makeGameState(numPlayers = 2): GameState {
  const playerIds = Array.from({ length: numPlayers }, (_, i) => String(i));
  return (PortaleVonMolthar as any).setup({ ctx: { playOrder: playerIds, numPlayers } });
}

function makePearlCard(id: string, hasRefreshSymbol = false): PearlCard {
  return { id, value: 1, hasSwapSymbol: false, hasRefreshSymbol };
}

function makeCharacterCard(id: string): CharacterCard {
  return { id, name: id, imageName: '', cost: [], powerPoints: 1, diamonds: 0, abilities: [] };
}

const moves = (PortaleVonMolthar as any).moves;
const turn = (PortaleVonMolthar as any).turn;

describe('pearl-refresh-symbol — takePearlCard', () => {
  it('3.1 Refresh wird ausgelöst wenn Refresh-Karte in pearlSlots nachgefüllt wird', () => {
    const G = makeGameState(2);
    // Leere Slots und Deck so vorbereiten, dass genau eine Refresh-Karte nachgefüllt wird
    G.pearlSlots = [
      makePearlCard('p1'), makePearlCard('p2'), makePearlCard('p3'), makePearlCard('p4'),
    ]; // 4 feste Slots — Slot 0 wird entnommen und in-place durch refresh-1 ersetzt
    G.pearlDeck = [makePearlCard('refresh-1', true)]; // die nächste Karte hat das Symbol
    G.characterSlots = [makeCharacterCard('c1'), makeCharacterCard('c2')];
    G.characterDeck = [makeCharacterCard('c3'), makeCharacterCard('c4')];
    G.characterDiscardPile = [];
    G.actionCount = 0;

    const ctx = { currentPlayer: '0', activePlayers: {} };
    moves.takePearlCard({ G, ctx, events: {} }, 0); // nimmt p1, refresh-1 wird nachgefüllt

    expect(G.isPearlRefreshTriggered).toBe(true);
    expect(G.characterSlots).toHaveLength(2);
    expect(G.characterSlots.every(c => c.id === 'c3' || c.id === 'c4')).toBe(true);
    expect(G.characterDiscardPile.map(c => c.id)).toContain('c1');
    expect(G.characterDiscardPile.map(c => c.id)).toContain('c2');
  });

  it('3.2 Kein Refresh bei normaler Perlenkarte', () => {
    const G = makeGameState(2);
    G.pearlSlots = [
      makePearlCard('p1'), makePearlCard('p2'), makePearlCard('p3'), makePearlCard('p4'),
    ];
    G.pearlDeck = [makePearlCard('normal-1', false)];
    const charSlotsSnapshot = [makeCharacterCard('c1'), makeCharacterCard('c2')];
    G.characterSlots = [...charSlotsSnapshot];
    G.actionCount = 0;

    const ctx = { currentPlayer: '0', activePlayers: {} };
    moves.takePearlCard({ G, ctx, events: {} }, 0);

    expect(G.isPearlRefreshTriggered).toBe(false);
    expect(G.characterSlots.map(c => c.id)).toEqual(charSlotsSnapshot.map(c => c.id));
  });

  it('3.3 Charakterdeck leer beim Refresh → Discard wird als Deck verwendet', () => {
    const G = makeGameState(2);
    G.pearlSlots = [makePearlCard('p1'), makePearlCard('p2'), makePearlCard('p3'), makePearlCard('p4')];
    G.pearlDeck = [makePearlCard('refresh-1', true)];
    G.characterSlots = [makeCharacterCard('c1'), makeCharacterCard('c2')];
    G.characterDeck = []; // leer
    G.characterDiscardPile = [makeCharacterCard('c3'), makeCharacterCard('c4'), makeCharacterCard('c5')];
    G.actionCount = 0;

    const ctx = { currentPlayer: '0', activePlayers: {} };
    moves.takePearlCard({ G, ctx, events: {} }, 0);

    expect(G.isPearlRefreshTriggered).toBe(true);
    expect(G.characterSlots).toHaveLength(2);
    // isReshufflingCharacterDeck sollte gesetzt sein, weil Deck leer war
    expect(G.isReshufflingCharacterDeck).toBe(true);
  });
});

describe('pearl-refresh-symbol — replacePearlSlots', () => {
  it('3.4 Refresh wird ausgelöst via replacePearlSlots', () => {
    const G = makeGameState(2);
    G.pearlSlots = [makePearlCard('p1'), makePearlCard('p2'), makePearlCard('p3'), makePearlCard('p4')];
    // Alle alten Karten gehen auf Discard, frische Karten kommen aus Deck
    G.pearlDeck = [
      makePearlCard('n1'), makePearlCard('n2'), makePearlCard('n3'),
      makePearlCard('refresh-2', true), // wird als letztes gezogen (pop)
    ];
    G.characterSlots = [makeCharacterCard('c1'), makeCharacterCard('c2')];
    G.characterDeck = [makeCharacterCard('c3'), makeCharacterCard('c4')];
    G.actionCount = 0;

    const ctx = { currentPlayer: '0', activePlayers: {} };
    moves.replacePearlSlots({ G, ctx, events: {} });

    expect(G.isPearlRefreshTriggered).toBe(true);
    expect(G.characterSlots).toHaveLength(2);
    expect(G.characterDiscardPile.map(c => c.id)).toContain('c1');
  });
});

describe('pearl-refresh-symbol — turn lifecycle', () => {
  it('3.5 isPearlRefreshTriggered wird am Zugende zurückgesetzt', () => {
    const G = makeGameState(2);
    G.isPearlRefreshTriggered = true;
    const ctx = { currentPlayer: '0', activePlayers: {} };
    turn.onEnd({ G, ctx });
    expect(G.isPearlRefreshTriggered).toBe(false);
  });

  it('isPearlRefreshTriggered startet als false', () => {
    const G = makeGameState(2);
    expect(G.isPearlRefreshTriggered).toBe(false);
  });
});
