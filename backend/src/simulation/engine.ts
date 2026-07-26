/**
 * Simulation Engine — runs a single game in-process, no server, no delays.
 *
 * Uses boardgame.io's CreateGameReducer + InitializeGame directly.
 * Math.random is patched with seedrandom before each game for determinism.
 */

import seedrandom from 'seedrandom';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { CreateGameReducer, InitializeGame } = require('boardgame.io/internal') as {
  CreateGameReducer: (opts: { game: any }) => (state: any, action: any) => any;
  InitializeGame: (opts: { game: any; numPlayers: number; setupData?: any }) => any;
};

import { PortaleVonMolthar } from '@portale-von-molthar/shared';
import type { NpcStrategy } from '@portale-von-molthar/shared';
import { createBot } from '../bots/index';
import type { BotStrategyFn } from '../bots/index';
import { pickBlueAbilityAction } from '../bots/blueAbilities';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LogEntry {
  turn: number;
  round: number;
  playerID: string;
  strategy: NpcStrategy;
  move: string;
  args?: unknown[];
  snapshot: {
    hand: number[];
    powerPoints: number;
    diamonds: number;
  };
}

export interface RankingEntry {
  playerId: string;
  strategy: NpcStrategy;
  name: string;
  powerPoints: number;
  diamonds: number;
}

export interface GameResult {
  gameId: string;
  strategies: Record<string, NpcStrategy>;
  rounds: number;
  totalActions: number;
  ranking: RankingEntry[];
  aborted: boolean;
  log: LogEntry[];
}

export interface SimGameConfig {
  gameId: string;
  /** playerID → strategy, e.g. { "0": "greedy", "1": "diamond" } */
  strategies: Record<string, NpcStrategy>;
  seed: string;
  verbose?: boolean;
  withSpecialCards?: boolean;
  /**
   * When true, keep a rolling last-30 log entries and dump them to stdout as
   * `[DEADLOCK gameId=<id>] <json>` when the game aborts. Does not affect
   * the returned GameResult.log field (still empty unless verbose is set).
   */
  diagnoseDeadlock?: boolean;
  /**
   * Optional per-strategy bot overrides. When the map contains the strategy
   * assigned to a playerID, its bot function replaces the one from
   * `createBot()`. Used by control tournaments (e.g. --legacy-diamond) to
   * substitute a snapshot bot for a production strategy slot.
   */
  botOverrides?: Partial<Record<NpcStrategy, BotStrategyFn>>;
}

// ---------------------------------------------------------------------------
// boardgame.io action constructors (verified in turn-order-4ab12333.js)
// ---------------------------------------------------------------------------

function makeMoveAction(type: string, args: unknown[], playerID: string) {
  return { type: 'MAKE_MOVE', payload: { type, args, playerID } };
}

function gameEventAction(type: string, playerID: string) {
  return { type: 'GAME_EVENT', payload: { type, args: undefined, playerID } };
}

// ---------------------------------------------------------------------------
// Seeding
// ---------------------------------------------------------------------------

export function seedGame(seed: string): void {
  seedrandom(seed, { global: true });
}

// ---------------------------------------------------------------------------
// runGame
// ---------------------------------------------------------------------------

const MAX_ACTIONS = 10_000;
/** Abort if no player scores any points within this many rounds */
const MAX_ROUNDS_WITHOUT_PROGRESS = 60;

const reducer = CreateGameReducer({ game: PortaleVonMolthar });

export function runGame(config: SimGameConfig): GameResult {
  const {
    gameId,
    strategies,
    seed,
    verbose = false,
    withSpecialCards = false,
    diagnoseDeadlock = false,
    botOverrides,
  } = config;

  seedGame(seed);

  const numPlayers = Object.keys(strategies).length;
  const playerNames: Record<string, string> = {};
  for (const [id, strat] of Object.entries(strategies)) {
    playerNames[id] = strategyName(strat);
  }

  let state = InitializeGame({
    game: PortaleVonMolthar,
    numPlayers,
    setupData: {
      withSpecialCards,
      playerNames,
    },
  });

  const bots = Object.fromEntries(
    Object.entries(strategies).map(([id, strat]) => [
      id,
      botOverrides?.[strat] ?? createBot(strat),
    ]),
  );

  const log: LogEntry[] = [];
  /** Rolling last-N buffer used only when diagnoseDeadlock is enabled. */
  const deadlockBuffer: LogEntry[] = [];
  const DEADLOCK_BUFFER_SIZE = 30;
  let totalActions = 0;
  let aborted = false;

  let lastProgressRound = 0;
  let lastMaxPoints = 0;

  // Guard so a player only calls rehandCards once per turn (the move stays
  // valid as long as actionCount >= maxActions, so without this we'd loop).
  // Keyed by `${round}:${playerID}` — reset happens implicitly when the
  // currentPlayer / round rolls over.
  const rehandUsedThisTurn = new Set<string>();

  while (!state.ctx?.gameover) {
    if (totalActions >= MAX_ACTIONS) {
      aborted = true;
      break;
    }

    // No-progress detection: abort if no points scored for too many rounds
    const currentG = (state as any).G;
    const currentRound: number = currentG?.roundNumber ?? 0;
    const currentMaxPts: number = Math.max(
      0,
      ...Object.values(currentG?.players ?? {}).map((p: any) => p.powerPoints as number),
    );
    if (currentMaxPts > lastMaxPoints) {
      lastMaxPoints = currentMaxPts;
      lastProgressRound = currentRound;
    } else if (currentRound - lastProgressRound > MAX_ROUNDS_WITHOUT_PROGRESS) {
      aborted = true;
      break;
    }

    const { G, ctx } = state as { G: any; ctx: any };
    const playerID: string = ctx.currentPlayer;
    const strategy = strategies[playerID];
    if (!strategy) break;

    const bot = bots[playerID];
    if (!bot) break;

    let action: ReturnType<typeof makeMoveAction> | ReturnType<typeof gameEventAction>;
    let moveName: string;
    let moveArgs: unknown[] | undefined;

    // --- Pre-strategy checks (mirrors bot-runner.ts logic) ---

    // 1. Handle requiresHandDiscard: discard lowest-value excess cards
    if (G.requiresHandDiscard) {
      const excess: number = G.excessCardCount ?? 0;
      if (excess > 0) {
        const player = G.players?.[playerID];
        const sortedIndices: number[] = player
          ? ([...(player.hand as any[])]
              .map((c: any, i: number) => ({ value: c.value as number, i }))
              .sort((a: any, b: any) => a.value - b.value)
              .slice(0, excess)
              .map((x: any) => x.i as number))
          : [];
        moveName = 'discardCardsForHandLimit';
        moveArgs = [sortedIndices];
        action = makeMoveAction('discardCardsForHandLimit', [sortedIndices], playerID);
      } else {
        // No excess but flag set — just end turn
        moveName = 'endTurn (forced)';
        action = gameEventAction('endTurn', playerID);
      }
    }
    // 2. Actions exhausted: give bot a chance for end-of-turn abilities
    //    (currently: rehandCards), then end turn via GAME_EVENT.
    else if (G.actionCount >= G.maxActions) {
      const rehandKey = `${G.roundNumber ?? 0}:${playerID}`;
      let endOfTurnAction: ReturnType<typeof pickBlueAbilityAction> = null;
      if (!rehandUsedThisTurn.has(rehandKey)) {
        endOfTurnAction = pickBlueAbilityAction(G, playerID, strategy, {
          onlyEndOfTurn: true,
        });
      }
      if (endOfTurnAction) {
        rehandUsedThisTurn.add(rehandKey);
        moveName = endOfTurnAction.move;
        moveArgs = endOfTurnAction.args as unknown[];
        action = makeMoveAction(endOfTurnAction.move, moveArgs, playerID);
      } else {
        moveName = 'endTurn (maxActions)';
        action = gameEventAction('endTurn', playerID);
      }
    }
    // 3. Normal: ask the bot strategy
    else {
      // Snapshot before action (verbose only)
      if (verbose) {
        const player = G.players?.[playerID];
        log.push({
          turn: totalActions,
          round: G.roundNumber ?? 0,
          playerID,
          strategy,
          move: '(pending)',
          snapshot: {
            hand: (player?.hand ?? []).map((c: any) => c.value as number),
            powerPoints: player?.powerPoints ?? 0,
            diamonds: (player?.diamondCards ?? []).length,
          },
        });
      }

      const decision = bot(G, ctx, playerID);

      if ('event' in decision) {
        moveName = decision.event;
        action = gameEventAction(decision.event, playerID);
      } else {
        moveName = decision.move;
        moveArgs = decision.args as unknown[];
        action = makeMoveAction(decision.move, moveArgs, playerID);
      }

      if (verbose && log.length > 0) {
        const last = log[log.length - 1]!;
        last.move = moveName;
        if (moveArgs !== undefined) last.args = moveArgs;
      }
    }

    // Deadlock buffer: rolling last-N entries (independent of verbose flag).
    if (diagnoseDeadlock) {
      const player = (state as any).G?.players?.[playerID];
      deadlockBuffer.push({
        turn: totalActions,
        round: (state as any).G?.roundNumber ?? 0,
        playerID,
        strategy,
        move: moveName,
        args: moveArgs,
        snapshot: {
          hand: (player?.hand ?? []).map((c: any) => c.value as number),
          powerPoints: player?.powerPoints ?? 0,
          diamonds: (player?.diamondCards ?? []).length,
        },
      });
      if (deadlockBuffer.length > DEADLOCK_BUFFER_SIZE) {
        deadlockBuffer.shift();
      }
    }

    state = reducer(state, action);
    totalActions++;
  }

  if (diagnoseDeadlock && aborted && deadlockBuffer.length > 0) {
    for (const entry of deadlockBuffer) {
      process.stdout.write(`[DEADLOCK gameId=${gameId}] ${JSON.stringify(entry)}\n`);
    }
  }

  const { ctx } = state as { ctx: any };
  const gameover = ctx?.gameover as { ranking?: any[] } | undefined;

  // Build ranking — use gameover.ranking if available, else reconstruct
  let ranking: RankingEntry[] = [];
  if (gameover?.ranking) {
    ranking = (gameover.ranking as any[]).map((r: any) => ({
      playerId: r.playerId as string,
      strategy: strategies[r.playerId as string] ?? 'random',
      name: r.name as string,
      powerPoints: r.powerPoints as number,
      diamonds: r.diamonds as number,
    }));
  }

  // Determine actual number of rounds from last state
  const finalG = (state as any).G;
  const rounds: number = finalG?.roundNumber ?? 0;

  return {
    gameId,
    strategies,
    rounds,
    totalActions,
    ranking,
    aborted,
    log: verbose ? log : [],
  };
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function strategyName(strategy: NpcStrategy): string {
  const names: Record<NpcStrategy, string> = {
    random:     'Irrnis',
    greedy:     'Gier',
    diamond:    'Edelstein',
    efficient:  'Wendelin',
    aggressive: 'Ralf',
  };
  return names[strategy] ?? strategy;
}
