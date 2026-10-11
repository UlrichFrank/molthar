import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

// The credentials file path is fixed at import time
process.env.NPC_DATA_DIR = mkdtempSync(join(tmpdir(), 'molthar-npc-'));
const { BotRunner } = await import('../bot-runner');

/** A bot whose client is a stub: state from `state`, moves recorded. */
function fakeBot(state: { G: any; ctx: any; _stateID: number }) {
  return {
    playerID: '1',
    strategy: vi.fn(() => ({ move: 'takePearlCard', args: [0] })),
    client: {
      store: { getState: () => state },
      moves: { takePearlCard: vi.fn(), endTurn: vi.fn(), discardCardsForHandLimit: vi.fn() },
      events: { endTurn: vi.fn() },
      stop: vi.fn(),
    },
    unsubscribe: null,
    isThinking: false,
    reconnectTimer: null,
    lastDispatchStateID: null,
    rejectedMoves: 0,
    thinkingSince: null,
    stopped: false,
  };
}

function setup(state: { G: any; ctx: any; _stateID: number }) {
  const runner = new BotRunner('http://127.0.0.1:1') as any;
  const bot = fakeBot(state);
  runner.activeMatches.set('m1', { bots: [bot], npcSlots: [] });
  return { runner, bot };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('BotRunner', () => {
  it('a bot detached while pausing neither moves nor retries', async () => {
    const state = { G: { players: {}, actionCount: 1, maxActions: 3 }, ctx: { currentPlayer: '1' }, _stateID: 5 };
    const { runner, bot } = setup(state);
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    runner.onStateChange('m1', bot);
    runner.detachMatch('m1', { finished: false });
    await vi.advanceTimersByTimeAsync(10_000);

    expect(bot.strategy).not.toHaveBeenCalled();
    expect(bot.client.moves.takePearlCard).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('does not end the turn when a hand-limit discard arrived during the pause', async () => {
    const state = {
      G: { players: {}, actionCount: 3, maxActions: 3, requiresHandDiscard: false },
      ctx: { currentPlayer: '1' },
      _stateID: 7,
    };
    const { runner, bot } = setup(state);

    runner.onStateChange('m1', bot);
    // The server's answer to the last (random) draw: hand over the limit
    state.G = { ...state.G, requiresHandDiscard: true, excessCardCount: 1 };
    state._stateID = 8;
    await vi.advanceTimersByTimeAsync(3000);

    expect(bot.client.moves.endTurn).not.toHaveBeenCalled();
    runner.detachMatch('m1', { finished: false });
  });
});
