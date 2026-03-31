import { describe, it, expect } from 'vitest';
import { PortaleVonMolthar } from './index';
import type { GameState } from './types';

// Helper: make a minimal GameState for setup tests
function makeGameState(numPlayers = 2): GameState {
  const playerIds = Array.from({ length: numPlayers }, (_, i) => String(i));
  return (PortaleVonMolthar as any).setup({ ctx: { playOrder: playerIds, numPlayers } });
}

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
