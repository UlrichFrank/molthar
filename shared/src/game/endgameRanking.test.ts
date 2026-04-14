import { describe, it, expect } from 'vitest';
import { PortaleVonMolthar } from './index';

function makeGameState(numPlayers = 2) {
  const playerIds = Array.from({ length: numPlayers }, (_, i) => String(i));
  return (PortaleVonMolthar as any).setup({ ctx: { playOrder: playerIds, numPlayers } });
}

const endIf = (PortaleVonMolthar as any).endIf as (args: { G: any; ctx: any }) => any;

function makeCtx(currentPlayer: string, turn: number) {
  return { currentPlayer, turn };
}

function setupFinalRound(G: any, startingPlayer: string, triggerTurn: number) {
  G.finalRound = true;
  G.finalRoundStartingPlayer = startingPlayer;
  G.finalRoundTriggerTurn = triggerTurn;
}

describe('endIf — timing', () => {
  it('gibt undefined zurück wenn finalRound nicht aktiv', () => {
    const G = makeGameState(2);
    expect(endIf({ G, ctx: makeCtx('0', 99) })).toBeUndefined();
  });

  it('gibt undefined zurück wenn finalRoundTriggerTurn null', () => {
    const G = makeGameState(2);
    G.finalRound = true;
    G.finalRoundStartingPlayer = '0';
    G.finalRoundTriggerTurn = null;
    expect(endIf({ G, ctx: makeCtx('0', 99) })).toBeUndefined();
  });

  it('N=2, Spieler 0 triggert bei Runde T — endet nach T+2 Runden', () => {
    // [0,1], idx=0 → turnsNeeded = N = 2 → end when turn > T+2
    //   verbleibend: (2-1-0)=1, finale Runde bis inkl. idx=0: (0+1)=1 → 1+1=2
    const G = makeGameState(2);
    const T = 5;
    setupFinalRound(G, '0', T);
    G.players['0'].powerPoints = 12;

    // Noch nicht fertig: Turn T+2 exakt (= triggerTurn + turnsNeeded)
    expect(endIf({ G, ctx: makeCtx('0', T + 2) })).toBeUndefined();
    // Fertig: Turn T+3 (erste Runde nach finaler Runde)
    expect(endIf({ G, ctx: makeCtx('0', T + 3) })).toBeDefined();
  });

  it('N=2, Spieler 1 triggert bei Runde T — endet nach T+2 Runden', () => {
    // [0,1], idx=1 → turnsNeeded = (2-1-1)+2 = 2 → end when turn > T+2
    const G = makeGameState(2);
    const T = 8;
    setupFinalRound(G, '1', T);
    G.players['1'].powerPoints = 14;

    expect(endIf({ G, ctx: makeCtx('0', T + 2) })).toBeUndefined();
    expect(endIf({ G, ctx: makeCtx('0', T + 3) })).toBeDefined();
  });

  it('N=4, Spieler 2 triggert bei Runde T — endet nach T+4 Runden', () => {
    // [0,1,2,3], idx=2 → turnsNeeded = N = 4 → end when turn > T+4
    //   verbleibend: (4-1-2)=1, finale Runde bis inkl. idx=2: (2+1)=3 → 1+3=4
    const G = makeGameState(4);
    const T = 10;
    setupFinalRound(G, '2', T);
    G.players['2'].powerPoints = 13;

    expect(endIf({ G, ctx: makeCtx('0', T + 4) })).toBeUndefined();
    expect(endIf({ G, ctx: makeCtx('0', T + 5) })).toBeDefined();
  });

  it('endet nicht vorzeitig während des Trigger-Zuges selbst', () => {
    // Wichtig: kein sofortiges Spielende wenn 12 Punkte erreicht werden
    const G = makeGameState(2);
    const T = 3;
    setupFinalRound(G, '0', T);
    G.players['0'].powerPoints = 12;

    // Direkt im Trigger-Zug: turn = T, currentPlayer = '0'
    expect(endIf({ G, ctx: makeCtx('0', T) })).toBeUndefined();
  });
});

describe('endIf — ranking mit Tiebreaker', () => {
  it('2.1 klarer Gewinner — ranking[0] hat die meisten Punkte', () => {
    const G = makeGameState(2);
    setupFinalRound(G, '0', 1);
    G.players['0'].powerPoints = 15;
    G.players['1'].powerPoints = 10;
    G.players['0'].diamondCards = [];
    G.players['1'].diamondCards = [];

    const result = endIf({ G, ctx: makeCtx('0', 5) });
    expect(result).toBeDefined();
    expect(result.ranking[0].playerId).toBe('0');
    expect(result.ranking[0].powerPoints).toBe(15);
    expect(result.ranking[1].playerId).toBe('1');
  });

  it('2.2 Tiebreaker — gleiche Punkte, mehr Diamanten gewinnt', () => {
    const G = makeGameState(2);
    setupFinalRound(G, '0', 1);
    G.players['0'].powerPoints = 12;
    G.players['1'].powerPoints = 12;
    const stub = { id: 's', name: 'S', imageName: 's', cost: [], powerPoints: 0, diamonds: 0, abilities: [] };
    G.players['0'].diamondCards = [stub];
    G.players['1'].diamondCards = [stub, stub, stub];

    const result = endIf({ G, ctx: makeCtx('0', 5) });
    expect(result).toBeDefined();
    expect(result.ranking[0].playerId).toBe('1');
    expect(result.ranking[0].diamonds).toBe(3);
  });

  it('2.3 echtes Unentschieden — gleiche Punkte und Diamanten', () => {
    const G = makeGameState(2);
    setupFinalRound(G, '0', 1);
    G.players['0'].powerPoints = 12;
    G.players['1'].powerPoints = 12;
    const stub = { id: 's', name: 'S', imageName: 's', cost: [], powerPoints: 0, diamonds: 0, abilities: [] };
    G.players['0'].diamondCards = [stub, stub];
    G.players['1'].diamondCards = [stub, stub];

    const result = endIf({ G, ctx: makeCtx('0', 5) });
    expect(result).toBeDefined();
    expect(result.ranking[0].powerPoints).toBe(result.ranking[1].powerPoints);
    expect(result.ranking[0].diamonds).toBe(result.ranking[1].diamonds);
  });

  it('2.4 Ranking enthält alle Spieler (4-Spieler-Spiel)', () => {
    const G = makeGameState(4);
    setupFinalRound(G, '0', 1);
    G.players['0'].powerPoints = 14;
    G.players['1'].powerPoints = 10;
    G.players['2'].powerPoints = 12;
    G.players['3'].powerPoints = 8;

    // N=4, idx=0 → turnsNeeded=N=4 → end when turn > 1+4=5; turn=9 qualifies
    const result = endIf({ G, ctx: makeCtx('0', 9) });
    expect(result).toBeDefined();
    expect(result.ranking).toHaveLength(4);
    expect(result.ranking[0].playerId).toBe('0');
    expect(result.ranking[1].playerId).toBe('2');
  });
});
