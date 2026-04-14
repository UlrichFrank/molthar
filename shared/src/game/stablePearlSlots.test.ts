import { describe, it, expect } from 'vitest';
import { PortaleVonMolthar } from './index';
import type { GameState, PearlCard } from './types';

function makeGameState(numPlayers = 2): GameState {
  const playerIds = Array.from({ length: numPlayers }, (_, i) => String(i));
  return (PortaleVonMolthar as any).setup({ ctx: { playOrder: playerIds, numPlayers } });
}

function makePearlCard(id: string): PearlCard {
  return { id, value: 1, hasSwapSymbol: false, hasRefreshSymbol: false };
}

const moves = (PortaleVonMolthar as any).moves;

describe('stable-pearl-slots — positionsstabiles Auffüllen', () => {
  it('Slot 1 nehmen → Slot 1 erhält Nachziehkarte, Slots 0/2/3 unverändert', () => {
    const G = makeGameState(2);
    const p0 = makePearlCard('p0');
    const p1 = makePearlCard('p1');
    const p2 = makePearlCard('p2');
    const p3 = makePearlCard('p3');
    const newCard = makePearlCard('new');
    G.pearlSlots = [p0, p1, p2, p3];
    G.pearlDeck = [newCard];
    G.actionCount = 0;

    const ctx = { currentPlayer: '0', activePlayers: {} };
    moves.takePearlCard({ G, ctx, events: {} }, 1);

    // Slot 1 bekommt die neue Karte
    expect(G.pearlSlots[1]?.id).toBe('new');
    // Alle anderen Slots bleiben an ihrer Position
    expect(G.pearlSlots[0]?.id).toBe('p0');
    expect(G.pearlSlots[2]?.id).toBe('p2');
    expect(G.pearlSlots[3]?.id).toBe('p3');
    // Entnommene Karte landet in der Hand des Spielers
    expect(G.players['0']!.hand.map(c => c.id)).toContain('p1');
  });

  it('Slot 2 nehmen → Slot 2 erhält Nachziehkarte, andere Slots unverändert', () => {
    const G = makeGameState(2);
    G.pearlSlots = [makePearlCard('a'), makePearlCard('b'), makePearlCard('c'), makePearlCard('d')];
    G.pearlDeck = [makePearlCard('x')];
    G.actionCount = 0;

    const ctx = { currentPlayer: '0', activePlayers: {} };
    moves.takePearlCard({ G, ctx, events: {} }, 2);

    expect(G.pearlSlots[2]?.id).toBe('x');
    expect(G.pearlSlots[0]?.id).toBe('a');
    expect(G.pearlSlots[1]?.id).toBe('b');
    expect(G.pearlSlots[3]?.id).toBe('d');
  });

  it('Slot 0 nehmen, Deck leer → Slot 0 bleibt null, andere Slots unverändert', () => {
    const G = makeGameState(2);
    G.pearlSlots = [makePearlCard('p0'), makePearlCard('p1'), makePearlCard('p2'), makePearlCard('p3')];
    G.pearlDeck = []; // kein Nachziehen möglich
    G.pearlDiscardPile = []; // kein Reshuffle möglich
    G.actionCount = 0;

    const ctx = { currentPlayer: '0', activePlayers: {} };
    moves.takePearlCard({ G, ctx, events: {} }, 0);

    // Slot 0 bleibt leer (null)
    expect(G.pearlSlots[0]).toBeNull();
    // Andere Slots unverändert
    expect(G.pearlSlots[1]?.id).toBe('p1');
    expect(G.pearlSlots[2]?.id).toBe('p2');
    expect(G.pearlSlots[3]?.id).toBe('p3');
    // Array hat immer noch 4 Elemente
    expect(G.pearlSlots).toHaveLength(4);
  });

  it('Schnell zwei Karten nehmen → Positionen korrekt nach beiden Zügen', () => {
    const G = makeGameState(2);
    G.pearlSlots = [makePearlCard('a'), makePearlCard('b'), makePearlCard('c'), makePearlCard('d')];
    G.pearlDeck = [makePearlCard('x'), makePearlCard('y')];
    G.maxActions = 6; // genug Aktionen für beide Züge
    G.actionCount = 0;

    const ctx = { currentPlayer: '0', activePlayers: {} };

    // Erste Entnahme: Slot 3 (d) → wird durch y ersetzt (Pop vom Stack: y ist letztes)
    moves.takePearlCard({ G, ctx, events: {} }, 3);
    // Nach erstem Zug: Slot 3 hat y (letztes Element des Deck-Stacks)
    const slot3AfterFirst = G.pearlSlots[3]?.id;

    // Zweite Entnahme: Slot 0 (a) → wird durch nächste Karte ersetzt
    moves.takePearlCard({ G, ctx, events: {} }, 0);

    // Slot 0 bekommt die verbleibende Karte aus dem Deck
    const slot0AfterSecond = G.pearlSlots[0]?.id;

    // Slots 1 und 2 sind die ursprünglichen b und c
    expect(G.pearlSlots[1]?.id).toBe('b');
    expect(G.pearlSlots[2]?.id).toBe('c');
    // Slot 3 hat noch seinen Ersatz vom ersten Zug
    expect(G.pearlSlots[3]?.id).toBe(slot3AfterFirst);
    // Slot 0 hat seinen Ersatz vom zweiten Zug
    expect(G.pearlSlots[0]?.id).toBe(slot0AfterSecond);
    // Array immer noch 4 Elemente
    expect(G.pearlSlots).toHaveLength(4);
  });

  it('replacePearlSlots → alle 4 Slots werden an festen Positionen neu befüllt', () => {
    const G = makeGameState(2);
    G.pearlSlots = [makePearlCard('old0'), makePearlCard('old1'), makePearlCard('old2'), makePearlCard('old3')];
    G.pearlDeck = [makePearlCard('n0'), makePearlCard('n1'), makePearlCard('n2'), makePearlCard('n3')];
    G.pearlDiscardPile = [];
    // Benötigt 3 Perlen auf der Hand und genug Aktionen
    G.players['0']!.hand = [makePearlCard('h1'), makePearlCard('h2'), makePearlCard('h3')];
    G.actionCount = 0;

    const ctx = { currentPlayer: '0', activePlayers: {} };
    moves.replacePearlSlots({ G, ctx, events: {} });

    // Alle 4 Slots haben neue Karten
    expect(G.pearlSlots).toHaveLength(4);
    expect(G.pearlSlots.every(c => c !== null)).toBe(true);
    // Alte Karten sind im Discard
    const discardIds = G.pearlDiscardPile.map(c => c.id);
    expect(discardIds).toContain('old0');
    expect(discardIds).toContain('old1');
    expect(discardIds).toContain('old2');
    expect(discardIds).toContain('old3');
  });
});
