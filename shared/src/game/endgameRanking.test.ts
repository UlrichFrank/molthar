import { describe, it, expect } from 'vitest';
import { PortaleVonMolthar, createCharacterDeck } from './index';
import type { GameState, PlayerState } from './types';

function makeGameState(numPlayers = 2) {
  const playerIds = Array.from({ length: numPlayers }, (_, i) => String(i));
  return (PortaleVonMolthar as any).setup({ ctx: { playOrder: playerIds, numPlayers } });
}

const endIf = (PortaleVonMolthar as any).endIf as (args: { G: any; ctx: any }) => any;

function setupFinalRound(G: any, finalRoundNumber: number, roundNumber: number = finalRoundNumber + 1) {
  G.finalRoundNumber = finalRoundNumber;
  G.roundNumber = roundNumber;
}

describe('endIf — timing', () => {
  it('gibt undefined zurück wenn finalRoundNumber null', () => {
    const G = makeGameState(2);
    expect(endIf({ G, ctx: {} })).toBeUndefined();
  });

  it('gibt undefined zurück wenn roundNumber <= finalRoundNumber', () => {
    const G = makeGameState(2);
    G.finalRoundNumber = 4;
    G.roundNumber = 4;
    expect(endIf({ G, ctx: {} })).toBeUndefined();
  });

  it('endet wenn roundNumber > finalRoundNumber', () => {
    const G = makeGameState(2);
    G.finalRoundNumber = 4;
    G.roundNumber = 5;
    G.players['0'].powerPoints = 12;
    expect(endIf({ G, ctx: {} })).toBeDefined();
  });

  it('endet nicht vorzeitig während der finalen Runde läuft', () => {
    const G = makeGameState(2);
    G.finalRoundNumber = 4;
    G.roundNumber = 4;
    G.players['0'].powerPoints = 12;
    expect(endIf({ G, ctx: {} })).toBeUndefined();
  });
});

describe('endIf — ranking mit Tiebreaker', () => {
  it('2.1 klarer Gewinner — ranking[0] hat die meisten Punkte', () => {
    const G = makeGameState(2);
    setupFinalRound(G, 4);
    G.players['0'].powerPoints = 15;
    G.players['1'].powerPoints = 10;
    G.players['0'].diamondCards = [];
    G.players['1'].diamondCards = [];

    const result = endIf({ G, ctx: {} });
    expect(result).toBeDefined();
    expect(result.ranking[0].playerId).toBe('0');
    expect(result.ranking[0].powerPoints).toBe(15);
    expect(result.ranking[1].playerId).toBe('1');
  });

  it('2.2 Tiebreaker — gleiche Punkte, mehr Diamanten gewinnt', () => {
    const G = makeGameState(2);
    setupFinalRound(G, 4);
    G.players['0'].powerPoints = 12;
    G.players['1'].powerPoints = 12;
    const stub = { id: 's', name: 'S', imageName: 's', cost: [], powerPoints: 0, diamonds: 0, abilities: [] };
    G.players['0'].diamondCards = [stub];
    G.players['1'].diamondCards = [stub, stub, stub];

    const result = endIf({ G, ctx: {} });
    expect(result).toBeDefined();
    expect(result.ranking[0].playerId).toBe('1');
    expect(result.ranking[0].diamonds).toBe(3);
  });

  it('2.3 echtes Unentschieden — gleiche Punkte und Diamanten', () => {
    const G = makeGameState(2);
    setupFinalRound(G, 4);
    G.players['0'].powerPoints = 12;
    G.players['1'].powerPoints = 12;
    const stub = { id: 's', name: 'S', imageName: 's', cost: [], powerPoints: 0, diamonds: 0, abilities: [] };
    G.players['0'].diamondCards = [stub, stub];
    G.players['1'].diamondCards = [stub, stub];

    const result = endIf({ G, ctx: {} });
    expect(result).toBeDefined();
    expect(result.ranking[0].powerPoints).toBe(result.ranking[1].powerPoints);
    expect(result.ranking[0].diamonds).toBe(result.ranking[1].diamonds);
  });

  it('2.4 Ranking enthält alle Spieler (4-Spieler-Spiel)', () => {
    const G = makeGameState(4);
    setupFinalRound(G, 4);
    G.players['0'].powerPoints = 14;
    G.players['1'].powerPoints = 10;
    G.players['2'].powerPoints = 12;
    G.players['3'].powerPoints = 8;

    const result = endIf({ G, ctx: {} });
    expect(result).toBeDefined();
    expect(result.ranking).toHaveLength(4);
    expect(result.ranking[0].playerId).toBe('0');
    expect(result.ranking[1].playerId).toBe('2');
  });
});

// ---------------------------------------------------------------------------
// Helpers für Rundenzähler-Tests
// ---------------------------------------------------------------------------

const turnOnEnd = (PortaleVonMolthar as any).turn.onEnd as (args: { G: any; ctx: any }) => void;
const turnOnBegin = (PortaleVonMolthar as any).turn.onBegin as (args: { G: any; ctx: any }) => void;

function makePlayer(id: string): PlayerState {
  return {
    id,
    name: `Player ${id}`,
    hand: [],
    portal: [],
    activatedCharacters: [],
    powerPoints: 0,
    diamondCards: [],
    readyUp: false,
    isAI: false,
    handLimitModifier: 0,
    activeAbilities: [],
    colorIndex: 1,
  };
}

function makeG(overrides: Partial<GameState> = {}): GameState {
  const G: GameState = {
    pearlDeck: [],
    characterDeck: createCharacterDeck(),
    pearlDiscardPile: [],
    characterDiscardPile: [],
    pearlSlots: [null, null, null, null],
    characterSlots: [],
    players: { '0': makePlayer('0'), '1': makePlayer('1'), '2': makePlayer('2') },
    playerOrder: ['0', '1', '2'],
    actionCount: 0,
    maxActions: 3,
    finalRound: false,
    roundNumber: 1,
    finalRoundNumber: null,
    requiresHandDiscard: false,
    excessCardCount: 0,
    currentHandLimit: 5,
    startingPlayer: '0',
    portalEntryCounter: 0,
    nextPlayerExtraAction: false,
    playedRealPearlIds: [],
    pendingTakeBackPlayedPearl: false,
    isReshufflingPearlDeck: false,
    isReshufflingCharacterDeck: false,
    isPearlRefreshTriggered: false,
    pendingStealOpponentHandCard: false,
    pendingDiscardOpponentCharacter: false,
    usedPaymentAbilityTypes: [],
    usedAbilitySourceCharacterIds: [],
    withSpecialCards: false,
    replacePearlSlotsAbilityUsed: false,
    ...overrides,
  } as GameState;
  return G;
}

// ctx für einen Spieler an einer bestimmten Position in der playOrder
function makeCtxForPlayer(playerId: string, playOrder: string[]) {
  const playOrderPos = playOrder.indexOf(playerId);
  return { currentPlayer: playerId, playOrder, playOrderPos };
}

describe('7.2 — Trigger in Runde 3 → finalRoundNumber = 4, finalRound erst in Runde 4', () => {
  it('setzt finalRoundNumber auf roundNumber + 1 wenn Spieler ≥12 Punkte erreicht', () => {
    const G = makeG({ roundNumber: 3 });
    const move = (PortaleVonMolthar as any).moves.activatePortalCard as Function;

    // Spieler '0' hat eine Charakterkarte im Portal (kostenlos: leere cost[])
    const charCard = {
      id: 'test-char',
      name: 'Test',
      imageName: 'test.png',
      cost: [],
      powerPoints: 12,
      diamonds: 0,
      abilities: [],
    };
    G.players['0']!.portal = [{ id: 'entry-1', card: charCard, activated: false }];
    G.players['0']!.hand = [];

    const ctx = { currentPlayer: '0', turn: 10 };
    move({ G, ctx }, 0, []);

    expect(G.finalRoundNumber).toBe(4);
    expect(G.finalRound).toBe(false); // noch nicht gesetzt — erst in turn.onBegin der Runde 4
  });

  it('finalRound wird in turn.onBegin erst in Runde 4 gesetzt (wenn startingPlayer an der Reihe)', () => {
    const playOrder = ['0', '1', '2'];
    const G = makeG({ roundNumber: 3, finalRoundNumber: 4 });

    // Runde 3, Startspieler beginnt: finalRound sollte noch false bleiben
    turnOnBegin({ G, ctx: makeCtxForPlayer('0', playOrder) });
    expect(G.finalRound).toBe(false);

    // Runde 4, Startspieler beginnt: finalRound sollte jetzt true werden
    G.roundNumber = 4;
    turnOnBegin({ G, ctx: makeCtxForPlayer('0', playOrder) });
    expect(G.finalRound).toBe(true);
  });

  it('finalRound wird nicht gesetzt wenn ein nicht-Startspieler an der Reihe ist', () => {
    const playOrder = ['0', '1', '2'];
    const G = makeG({ roundNumber: 4, finalRoundNumber: 4 });

    // Runde 4, aber Spieler '1' (nicht Startspieler) ist dran
    turnOnBegin({ G, ctx: makeCtxForPlayer('1', playOrder) });
    expect(G.finalRound).toBe(false);
  });
});

describe('7.3 — Spiel endet nach vollständiger finaler Runde', () => {
  it('roundNumber wird in turn.onEnd erhöht wenn nächster Spieler der Startspieler ist', () => {
    // 3 Spieler, Startspieler = '0', Reihenfolge ['0','1','2']
    // Nach Zug von '2' (playOrderPos=2), nächster = pos 0 = '0' = startingPlayer → increment
    const playOrder = ['0', '1', '2'];
    const G = makeG({ roundNumber: 4, finalRoundNumber: 4 });

    turnOnEnd({ G, ctx: makeCtxForPlayer('2', playOrder) });
    expect(G.roundNumber).toBe(5);
  });

  it('roundNumber wird NICHT erhöht nach Zug eines anderen Spielers', () => {
    const playOrder = ['0', '1', '2'];
    const G = makeG({ roundNumber: 4, finalRoundNumber: 4 });

    turnOnEnd({ G, ctx: makeCtxForPlayer('0', playOrder) });
    expect(G.roundNumber).toBe(4); // nächster ist '1', nicht startingPlayer

    turnOnEnd({ G, ctx: makeCtxForPlayer('1', playOrder) });
    expect(G.roundNumber).toBe(4); // nächster ist '2', nicht startingPlayer
  });

  it('endIf feuert nach dem letzten Zug der finalen Runde', () => {
    const playOrder = ['0', '1', '2'];
    const G = makeG({ roundNumber: 4, finalRoundNumber: 4 });
    G.players['0']!.powerPoints = 14;

    // Letzter Zug der finalen Runde: Spieler '2' beendet, roundNumber → 5
    turnOnEnd({ G, ctx: makeCtxForPlayer('2', playOrder) });
    expect(G.roundNumber).toBe(5);

    // endIf sollte jetzt feuern
    const result = endIf({ G, ctx: {} });
    expect(result).toBeDefined();
    expect(result.ranking).toBeDefined();
  });
});

describe('7.4 — Zweiter Spieler mit ≥12 Punkten überschreibt finalRoundNumber nicht', () => {
  it('finalRoundNumber bleibt unverändert wenn bereits gesetzt', () => {
    const G = makeG({ roundNumber: 3, finalRoundNumber: 4 });
    const move = (PortaleVonMolthar as any).moves.activatePortalCard as Function;

    const charCard = {
      id: 'test-char-2',
      name: 'Test2',
      imageName: 'test2.png',
      cost: [],
      powerPoints: 13,
      diamonds: 0,
      abilities: [],
    };
    G.players['1']!.portal = [{ id: 'entry-2', card: charCard, activated: false }];
    G.players['1']!.hand = [];

    const ctx = { currentPlayer: '1', turn: 15 };
    move({ G, ctx }, 0, []);

    // Spieler '1' hat jetzt ≥12 Punkte, aber finalRoundNumber war schon 4
    expect(G.players['1']!.powerPoints).toBe(13);
    expect(G.finalRoundNumber).toBe(4); // bleibt unverändert
  });
});
