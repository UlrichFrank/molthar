import { describe, it, expect } from 'vitest';
import { PortaleVonMolthar } from './index';

function makeGameState(numPlayers = 2) {
  const playerIds = Array.from({ length: numPlayers }, (_, i) => String(i));
  return (PortaleVonMolthar as any).setup({ ctx: { playOrder: playerIds, numPlayers } });
}

const endIf = (PortaleVonMolthar as any).endIf as (args: { G: any; ctx: any }) => any;

function makeEndIfCtx(currentPlayer: string, turn: number, playerCount: number) {
  return { currentPlayer, turn, numPlayers: playerCount };
}

function setupFinalRound(G: any, startingPlayer: string) {
  G.finalRound = true;
  G.finalRoundStartingPlayer = startingPlayer;
}

describe('endIf — ranking with tiebreaker', () => {
  it('2.1 klarer Gewinner — ranking[0] hat die meisten Punkte', () => {
    const G = makeGameState(2);
    setupFinalRound(G, '0');
    G.players['0'].powerPoints = 15;
    G.players['1'].powerPoints = 10;
    G.players['0'].diamonds = 0;
    G.players['1'].diamonds = 0;

    // turn > numPlayers and currentPlayer === startingPlayer → game over
    const result = endIf({ G, ctx: makeEndIfCtx('0', 3, 2) });

    expect(result).toBeDefined();
    expect(result.ranking[0].playerId).toBe('0');
    expect(result.ranking[0].powerPoints).toBe(15);
    expect(result.ranking[1].playerId).toBe('1');
  });

  it('2.2 Tiebreaker — gleiche Punkte, mehr Diamanten gewinnt', () => {
    const G = makeGameState(2);
    setupFinalRound(G, '0');
    G.players['0'].powerPoints = 12;
    G.players['1'].powerPoints = 12;
    G.players['0'].diamonds = 1;
    G.players['1'].diamonds = 3;

    const result = endIf({ G, ctx: makeEndIfCtx('0', 3, 2) });

    expect(result).toBeDefined();
    expect(result.ranking[0].playerId).toBe('1');
    expect(result.ranking[0].diamonds).toBe(3);
    expect(result.ranking[1].playerId).toBe('0');
  });

  it('2.3 echtes Unentschieden — gleiche Punkte und Diamanten → beide im Ranking mit gleichen Werten', () => {
    const G = makeGameState(2);
    setupFinalRound(G, '0');
    G.players['0'].powerPoints = 12;
    G.players['1'].powerPoints = 12;
    G.players['0'].diamonds = 2;
    G.players['1'].diamonds = 2;

    const result = endIf({ G, ctx: makeEndIfCtx('0', 3, 2) });

    expect(result).toBeDefined();
    expect(result.ranking).toHaveLength(2);
    expect(result.ranking[0].powerPoints).toBe(result.ranking[1].powerPoints);
    expect(result.ranking[0].diamonds).toBe(result.ranking[1].diamonds);
  });

  it('2.4 Ranking enthält alle Spieler (4-Spieler-Spiel)', () => {
    const G = makeGameState(4);
    setupFinalRound(G, '0');
    G.players['0'].powerPoints = 14;
    G.players['1'].powerPoints = 10;
    G.players['2'].powerPoints = 12;
    G.players['3'].powerPoints = 8;

    const result = endIf({ G, ctx: makeEndIfCtx('0', 5, 4) });

    expect(result).toBeDefined();
    expect(result.ranking).toHaveLength(4);
    expect(result.ranking[0].playerId).toBe('0');
    expect(result.ranking[1].playerId).toBe('2');
    expect(result.ranking[2].playerId).toBe('1');
    expect(result.ranking[3].playerId).toBe('3');
  });

  it('endIf gibt undefined zurück wenn finalRound noch nicht aktiv', () => {
    const G = makeGameState(2);
    G.finalRound = false;

    const result = endIf({ G, ctx: makeEndIfCtx('0', 3, 2) });
    expect(result).toBeUndefined();
  });

  it('endIf gibt undefined zurück wenn noch nicht alle Spieler dran waren', () => {
    const G = makeGameState(2);
    setupFinalRound(G, '0');
    G.players['0'].powerPoints = 15;

    // turn <= numPlayers → noch nicht alle dran
    const result = endIf({ G, ctx: makeEndIfCtx('0', 2, 2) });
    expect(result).toBeUndefined();
  });
});
