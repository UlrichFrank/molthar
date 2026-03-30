import { describe, it, expect } from 'vitest';
import { INVALID_MOVE } from 'boardgame.io/core';
import { PortaleVonMolthar } from './index';
import type { GameState } from './types';

// Helper: make a minimal GameState with 2 players for colorSelection tests
function makeGameState(numPlayers = 2): GameState {
  const playerIds = Array.from({ length: numPlayers }, (_, i) => String(i));
  return (PortaleVonMolthar as any).setup({ ctx: { playOrder: playerIds, numPlayers } });
}

function makeMoveCtx(currentPlayer: string) {
  return { currentPlayer, activePlayers: {} };
}

const colorMoves = (PortaleVonMolthar as any).phases?.colorSelection?.moves;

describe('colorSelection — setup', () => {
  it('3.1 default colorIndex: sequential assignment (player 0→1, 1→2, etc.)', () => {
    const G = makeGameState(3);
    expect(G.players['0']?.colorIndex).toBe(1);
    expect(G.players['1']?.colorIndex).toBe(2);
    expect(G.players['2']?.colorIndex).toBe(3);
  });

  it('3.1 5-player game: all players get unique colorIndex 1-5', () => {
    const G = makeGameState(5);
    const indices = Object.values(G.players).map(p => p.colorIndex);
    expect(indices).toEqual([1, 2, 3, 4, 5]);
  });

  it('3.4 startingPlayer is one of the playerIds', () => {
    const G = makeGameState(3);
    expect(['0', '1', '2']).toContain(G.startingPlayer);
  });
});

describe('colorSelection — selectColor move', () => {
  it('3.2 selectColor: free color → succeeds, updates colorIndex', () => {
    const G = makeGameState(2);
    const ctx = makeMoveCtx('0');
    // Player 0 picks color 3 (their default is 1, player 1 has 2)
    const result = colorMoves.selectColor({ G, ctx }, 3);
    expect(result).not.toBe(INVALID_MOVE);
    expect(G.players['0']?.colorIndex).toBe(3);
  });

  it('3.2 selectColor: color already taken by other player → INVALID_MOVE', () => {
    const G = makeGameState(2);
    // Player 0 has colorIndex 1, player 1 has colorIndex 2
    const ctx = makeMoveCtx('1');
    // Player 1 tries to take color 1 (already taken by player 0)
    const result = colorMoves.selectColor({ G, ctx }, 1);
    expect(result).toBe(INVALID_MOVE);
  });

  it('3.2 selectColor: colorIndex out of range → INVALID_MOVE', () => {
    const G = makeGameState(2);
    const ctx = makeMoveCtx('0');
    expect(colorMoves.selectColor({ G, ctx }, 0)).toBe(INVALID_MOVE);
    expect(colorMoves.selectColor({ G, ctx }, 6)).toBe(INVALID_MOVE);
  });

  it('3.2 selectColor: player can pick their own current color (no conflict)', () => {
    const G = makeGameState(2);
    const ctx = makeMoveCtx('0');
    // Player 0 already has colorIndex 1 — selecting 1 again is fine (not "taken by another")
    const result = colorMoves.selectColor({ G, ctx }, 1);
    expect(result).not.toBe(INVALID_MOVE);
    expect(G.players['0']?.colorIndex).toBe(1);
  });
});

describe('colorSelection — confirmColor move + phase endIf', () => {
  it('3.3 confirmColor sets colorConfirmed=true for current player', () => {
    const G = makeGameState(2);
    const ctx = makeMoveCtx('0');
    colorMoves.confirmColor({ G, ctx });
    expect(G.players['0']?.colorConfirmed).toBe(true);
    expect(G.players['1']?.colorConfirmed).toBe(false);
  });

  it('3.3 phase endIf: false while not all confirmed', () => {
    const G = makeGameState(2);
    const ctx0 = makeMoveCtx('0');
    colorMoves.confirmColor({ G, ctx: ctx0 });
    const endIf = (PortaleVonMolthar as any).phases?.colorSelection?.endIf;
    expect(endIf({ G })).toBeFalsy();
  });

  it('3.3 phase endIf: true when all players confirmed', () => {
    const G = makeGameState(2);
    colorMoves.confirmColor({ G, ctx: makeMoveCtx('0') });
    colorMoves.confirmColor({ G, ctx: makeMoveCtx('1') });
    const endIf = (PortaleVonMolthar as any).phases?.colorSelection?.endIf;
    expect(endIf({ G })).toBeTruthy();
  });

  it('3.3 onEnd resets colorConfirmed flags', () => {
    const G = makeGameState(2);
    colorMoves.confirmColor({ G, ctx: makeMoveCtx('0') });
    colorMoves.confirmColor({ G, ctx: makeMoveCtx('1') });
    const onEnd = (PortaleVonMolthar as any).phases?.colorSelection?.onEnd;
    onEnd({ G });
    expect(G.players['0']?.colorConfirmed).toBe(false);
    expect(G.players['1']?.colorConfirmed).toBe(false);
  });
});
