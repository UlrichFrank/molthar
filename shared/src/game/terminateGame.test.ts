import { describe, it, expect } from 'vitest';
import { INVALID_MOVE } from 'boardgame.io/core';
import { PortaleVonMolthar } from './index';

function makeGameState(numPlayers = 2) {
  const playerIds = Array.from({ length: numPlayers }, (_, i) => String(i));
  return (PortaleVonMolthar as any).setup({ ctx: { playOrder: playerIds, numPlayers } });
}

const moves = (PortaleVonMolthar as any).moves;

describe('terminateGame move', () => {
  it('creator (playerID "0") can terminate the game', () => {
    const G = makeGameState(2);
    const endGameCalls: any[] = [];
    const ctx = { currentPlayer: '0' };
    const events = { endGame: (args: any) => endGameCalls.push(args) };

    const result = moves.terminateGame({ G, ctx, events });

    expect(result).not.toBe(INVALID_MOVE);
    expect(endGameCalls).toHaveLength(1);
    expect(endGameCalls[0]).toEqual({ reason: 'terminated' });
  });

  it('non-creator (playerID "1") cannot terminate the game', () => {
    const G = makeGameState(2);
    const endGameCalls: any[] = [];
    const ctx = { currentPlayer: '1' };
    const events = { endGame: (args: any) => endGameCalls.push(args) };

    const result = moves.terminateGame({ G, ctx, events });

    expect(result).toBe(INVALID_MOVE);
    expect(endGameCalls).toHaveLength(0);
  });

  it('non-creator (playerID "2") cannot terminate the game', () => {
    const G = makeGameState(3);
    const endGameCalls: any[] = [];
    const ctx = { currentPlayer: '2' };
    const events = { endGame: (args: any) => endGameCalls.push(args) };

    const result = moves.terminateGame({ G, ctx, events });

    expect(result).toBe(INVALID_MOVE);
    expect(endGameCalls).toHaveLength(0);
  });
});
