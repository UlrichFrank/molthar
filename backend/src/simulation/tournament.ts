/**
 * Tournament Runner — orchestrates N games over all strategy combinations.
 *
 * For 2 players:  all pairs (with repetition), including mirror matchups.
 * For P > 2:      all P-tuples (with repetition), round-robin across slots.
 */

import type { NpcStrategy } from '@portale-von-molthar/shared';
import { runGame } from './engine';
import type { GameResult, RankingEntry } from './engine';
import type { BotStrategyFn } from '../bots/index';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StrategyStats {
  wins: number;
  winRate: number;
  avgScore: number;
  avgRank: number;
  avgRounds: number;
  gamesPlayed: number;
}

export interface HeadToHeadEntry {
  wins: number;
  total: number;
  winRate: number;
}

export interface TournamentStats {
  perStrategy: Partial<Record<NpcStrategy, StrategyStats>>;
  headToHead?: Partial<Record<NpcStrategy, Partial<Record<NpcStrategy, HeadToHeadEntry>>>>;
  avgGameLength: number;
  scoreDistribution: Partial<Record<NpcStrategy, { min: number; max: number; avg: number; median: number }>>;
}

export interface TournamentMeta {
  date: string;
  numPlayers: number;
  numGames: number;
  gamesPerMatchup: number;
  strategies: NpcStrategy[];
  withSpecialCards: boolean;
  seed: string;
  durationMs: number;
  abortedGames: number;
}

export interface TournamentResult {
  meta: TournamentMeta;
  games: GameResult[];
  stats: TournamentStats;
}

export interface TournamentConfig {
  numPlayers: number;
  gamesPerMatchup: number;
  seed?: string;
  strategies?: NpcStrategy[];
  verbose?: boolean;
  withSpecialCards?: boolean;
  /** Dump last-30 log entries to stdout when a game aborts (see engine.ts). */
  diagnoseDeadlock?: boolean;
  /**
   * Optional per-strategy bot factory overrides. When present, the given
   * strategy slot is bound to the override function instead of the production
   * factory in `bots/index.ts`. Used by control tournaments (e.g. --legacy-diamond
   * pins the `greedy` slot to LegacyDiamondBot) without polluting the production
   * factory. See design D4.
   */
  botOverrides?: Partial<Record<NpcStrategy, BotStrategyFn>>;
}

// ---------------------------------------------------------------------------
// All strategies
// ---------------------------------------------------------------------------

const ALL_STRATEGIES: NpcStrategy[] = ['random', 'greedy', 'diamond', 'efficient', 'aggressive'];

// ---------------------------------------------------------------------------
// Combination generation
// ---------------------------------------------------------------------------

/**
 * Returns all P-tuples (with repetition) from the given strategy list.
 * Order matters for slot assignment but not for stats collection.
 */
function combinationsWithRepetition(strategies: NpcStrategy[], p: number): NpcStrategy[][] {
  if (p === 0) return [[]];
  const sub = combinationsWithRepetition(strategies, p - 1);
  const result: NpcStrategy[][] = [];
  for (const s of strategies) {
    for (const combo of sub) {
      result.push([s, ...combo]);
    }
  }
  return result;
}

/**
 * For 2P: all unordered pairs (with mirror matchups included as a single entry
 * for symmetric strategies, but both orders are represented).
 * Returns all ordered pairs so each strategy appears equally as player 0 and 1.
 *
 * Concretely: for strategies [A, B, C] we generate [A,A],[A,B],[A,C],[B,A],[B,B],[B,C],...
 * This is all P^2 combinations. For fairness, this ensures each strategy plays both slots.
 */
function generateMatchups(strategies: NpcStrategy[], numPlayers: number): NpcStrategy[][] {
  return combinationsWithRepetition(strategies, numPlayers);
}

// ---------------------------------------------------------------------------
// runTournament
// ---------------------------------------------------------------------------

export function runTournament(config: TournamentConfig): TournamentResult {
  const {
    numPlayers,
    gamesPerMatchup,
    strategies = ALL_STRATEGIES,
    verbose = false,
    withSpecialCards = false,
    diagnoseDeadlock = false,
    botOverrides,
  } = config;

  const masterSeed = config.seed ?? generateSeed();
  const startTime = Date.now();

  const matchups = generateMatchups(strategies, numPlayers);
  const totalGames = matchups.length * gamesPerMatchup;

  const allGames: GameResult[] = [];
  let gameIndex = 0;

  for (const matchup of matchups) {
    for (let g = 0; g < gamesPerMatchup; g++) {
      const seed = `${masterSeed}:${gameIndex}`;

      // Build strategies map: playerID → strategy
      const strategyMap: Record<string, NpcStrategy> = {};
      for (let p = 0; p < numPlayers; p++) {
        strategyMap[String(p)] = matchup[p]!;
      }

      const result = runGame({
        gameId: `g${gameIndex.toString().padStart(5, '0')}`,
        strategies: strategyMap,
        seed,
        verbose,
        withSpecialCards,
        diagnoseDeadlock,
        botOverrides,
      });

      allGames.push(result);
      gameIndex++;

      // Progress output every 10 games
      if (gameIndex % 10 === 0 || gameIndex === totalGames) {
        const pct = Math.round((gameIndex / totalGames) * 100);
        const matchupLabel = matchup.join(' vs ');
        process.stdout.write(`\r[${gameIndex}/${totalGames}] ${pct}% — ${matchupLabel}  `);
      }
    }
  }

  process.stdout.write('\n');

  const durationMs = Date.now() - startTime;
  const completedGames = allGames.filter(g => !g.aborted);
  const abortedGames = allGames.length - completedGames.length;

  const stats = computeStats(completedGames, numPlayers, strategies);

  return {
    meta: {
      date: new Date().toISOString(),
      numPlayers,
      numGames: allGames.length,
      gamesPerMatchup,
      strategies,
      withSpecialCards,
      seed: masterSeed,
      durationMs,
      abortedGames,
    },
    games: allGames,
    stats,
  };
}

// ---------------------------------------------------------------------------
// Stats computation
// ---------------------------------------------------------------------------

function computeStats(
  games: GameResult[],
  numPlayers: number,
  strategies: NpcStrategy[],
): TournamentStats {
  // Per-strategy accumulators
  const acc: Partial<Record<NpcStrategy, {
    wins: number;
    totalScore: number;
    totalRank: number;
    totalRounds: number;
    gamesPlayed: number;
    scores: number[];
  }>> = {};

  for (const s of strategies) {
    acc[s] = { wins: 0, totalScore: 0, totalRank: 0, totalRounds: 0, gamesPlayed: 0, scores: [] };
  }

  // Head-to-head (2P only)
  const h2h: Partial<Record<NpcStrategy, Partial<Record<NpcStrategy, { wins: number; total: number }>>>> = {};
  if (numPlayers === 2) {
    for (const a of strategies) {
      h2h[a] = {};
      for (const b of strategies) {
        h2h[a]![b] = { wins: 0, total: 0 };
      }
    }
  }

  let totalRounds = 0;

  for (const game of games) {
    totalRounds += game.rounds;

    // Each player's strategy appears in the ranking
    game.ranking.forEach((entry: RankingEntry, rankIdx: number) => {
      const s = entry.strategy;
      const a = acc[s];
      if (!a) return;

      a.gamesPlayed++;
      a.totalScore += entry.powerPoints;
      a.totalRank += rankIdx + 1; // rank is 1-based
      a.totalRounds += game.rounds;
      a.scores.push(entry.powerPoints);

      if (rankIdx === 0) {
        a.wins++;
      }
    });

    // Head-to-head (2P)
    if (numPlayers === 2 && game.ranking.length >= 2) {
      const winner = game.ranking[0]!.strategy;
      const loser = game.ranking[1]!.strategy;

      h2h[winner]![loser]!.wins++;
      h2h[winner]![loser]!.total++;
      h2h[loser]![winner]!.total++;
    }
  }

  // Build perStrategy
  const perStrategy: Partial<Record<NpcStrategy, StrategyStats>> = {};
  for (const s of strategies) {
    const a = acc[s];
    if (!a || a.gamesPlayed === 0) continue;
    perStrategy[s] = {
      wins: a.wins,
      winRate: a.wins / a.gamesPlayed,
      avgScore: a.totalScore / a.gamesPlayed,
      avgRank: a.totalRank / a.gamesPlayed,
      avgRounds: a.totalRounds / a.gamesPlayed,
      gamesPlayed: a.gamesPlayed,
    };
  }

  // Build head-to-head with winRates
  let headToHead: TournamentStats['headToHead'] | undefined;
  if (numPlayers === 2) {
    headToHead = {};
    for (const a of strategies) {
      headToHead[a] = {};
      for (const b of strategies) {
        const entry = h2h[a]?.[b];
        if (!entry) continue;
        headToHead[a]![b] = {
          wins: entry.wins,
          total: entry.total,
          winRate: entry.total > 0 ? entry.wins / entry.total : 0,
        };
      }
    }
  }

  // Score distribution (min/max/avg/median)
  const scoreDistribution: TournamentStats['scoreDistribution'] = {};
  for (const s of strategies) {
    const scores = acc[s]?.scores ?? [];
    if (scores.length === 0) continue;
    const sorted = [...scores].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0
      ? (sorted[mid - 1]! + sorted[mid]!) / 2
      : sorted[mid]!;
    scoreDistribution[s] = {
      min: sorted[0]!,
      max: sorted[sorted.length - 1]!,
      avg: scores.reduce((s, v) => s + v, 0) / scores.length,
      median,
    };
  }

  return {
    perStrategy,
    headToHead,
    avgGameLength: games.length > 0 ? totalRounds / games.length : 0,
    scoreDistribution,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateSeed(): string {
  return Math.random().toString(36).slice(2, 10);
}
