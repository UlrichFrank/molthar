/**
 * bench — measures NPC strength with common random numbers (fixed seeds).
 *
 * Two measurements per bot:
 *  - solo: the bot plays against a passive dummy (always ends its turn).
 *          Metric = rounds (= own turns) until the bot reaches 12 points.
 *  - duel: the bot plays against an opponent bot, seats swapped per seed.
 *          Metric = win rate (ties count ½) and rounds to 12.
 *
 * Usage:
 *   npx ts-node-transpile-only src/simulation/bench.ts solo wendelin [games] [seedPrefix]
 *   npx ts-node-transpile-only src/simulation/bench.ts duel wendelin baseline-wendelin [games] [seedPrefix]
 */

import { runGame } from './engine';
import type { BotStrategyFn } from '../bots/index';
import { createBot } from '../bots/index';
import { pickDiscardIndices } from '../bots/planner';
import { BaselineRalfBot } from '../bots/baseline/RalfBot';
import { BaselineWendelinBot } from '../bots/baseline/WendelinBot';
import { BaselineEdelsteinBot } from '../bots/baseline/EdelsteinBot';

const PASSIVE: BotStrategyFn = () => ({ event: 'endTurn' });

type BotEntry = { fn: BotStrategyFn; smartDiscard: boolean };

export const BOTS: Record<string, BotEntry> = {
  'baseline-ralf':      { fn: BaselineRalfBot, smartDiscard: false },
  'baseline-wendelin':  { fn: BaselineWendelinBot, smartDiscard: false },
  'baseline-edelstein': { fn: BaselineEdelsteinBot, smartDiscard: false },
  ralf:      { fn: createBot('aggressive'), smartDiscard: true },
  wendelin:  { fn: createBot('efficient'), smartDiscard: true },
  edelstein: { fn: createBot('diamond'), smartDiscard: true },
  irrnis:    { fn: createBot('random'), smartDiscard: false },
};

export interface SoloStats { games: number; meanRounds: number; reached: number; aborted: number }
export interface DuelStats { games: number; winRate: number; meanRoundsA: number; meanRoundsB: number; aborted: number }

/** Censored runs (never reached 12) count as this many rounds. */
const CENSOR_ROUNDS = 40;

export function solo(bot: BotEntry, games: number, seedPrefix = 'solo'): SoloStats {
  let sum = 0, reached = 0, aborted = 0;
  for (let i = 0; i < games; i++) {
    const r = runGame({
      gameId: `solo-${i}`,
      strategies: { '0': 'efficient', '1': 'random' },
      seed: `${seedPrefix}:${i}`,
      botsByPlayer: { '0': bot.fn, '1': PASSIVE },
      discardByPlayer: bot.smartDiscard ? { '0': pickDiscardIndices } : undefined,
    });
    const tr = r.thresholdRound['0'];
    if (r.aborted) aborted++;
    if (tr !== null && tr !== undefined) { reached++; sum += tr; } else sum += CENSOR_ROUNDS;
  }
  return { games, meanRounds: sum / games, reached, aborted };
}

export function duel(a: BotEntry, b: BotEntry, games: number, seedPrefix = 'duel'): DuelStats {
  let wins = 0, roundsA = 0, roundsB = 0, aborted = 0, n = 0;
  for (let i = 0; i < games; i++) {
    for (const seatA of ['0', '1']) {
      const seatB = seatA === '0' ? '1' : '0';
      const r = runGame({
        gameId: `duel-${i}-${seatA}`,
        strategies: { '0': 'efficient', '1': 'aggressive' },
        seed: `${seedPrefix}:${i}`,
        botsByPlayer: { [seatA]: a.fn, [seatB]: b.fn },
        discardByPlayer: {
          ...(a.smartDiscard ? { [seatA]: pickDiscardIndices } : {}),
          ...(b.smartDiscard ? { [seatB]: pickDiscardIndices } : {}),
        },
      });
      n++;
      if (r.aborted) { aborted++; wins += 0.5; continue; }
      const top = r.ranking[0];
      const second = r.ranking[1];
      if (top && second && top.powerPoints === second.powerPoints && top.diamonds === second.diamonds) wins += 0.5;
      else if (top?.playerId === seatA) wins += 1;
      roundsA += r.thresholdRound[seatA] ?? CENSOR_ROUNDS;
      roundsB += r.thresholdRound[seatB] ?? CENSOR_ROUNDS;
    }
  }
  const done = n - aborted || 1;
  return { games: n, winRate: wins / n, meanRoundsA: roundsA / done, meanRoundsB: roundsB / done, aborted };
}

if (require.main === module) {
  const [mode, aName, bOrGames, ...rest] = process.argv.slice(2);
  const silence = console.log;
  if (mode === 'solo') {
    const bot = BOTS[aName!];
    if (!bot) throw new Error(`unknown bot ${aName}`);
    const games = parseInt(bOrGames ?? '100', 10);
    const t = Date.now();
    const s = solo(bot, games, rest[0] ?? 'solo');
    silence(`solo ${aName}: meanRounds=${s.meanRounds.toFixed(2)} reached=${s.reached}/${s.games} aborted=${s.aborted} (${Date.now() - t}ms)`);
  } else if (mode === 'duel') {
    const a = BOTS[aName!], b = BOTS[bOrGames!];
    if (!a || !b) throw new Error('unknown bot');
    const games = parseInt(rest[0] ?? '100', 10);
    const t = Date.now();
    const d = duel(a, b, games, rest[1] ?? 'duel');
    silence(`duel ${aName} vs ${bOrGames}: winRate=${(d.winRate * 100).toFixed(1)}% roundsA=${d.meanRoundsA.toFixed(2)} roundsB=${d.meanRoundsB.toFixed(2)} games=${d.games} aborted=${d.aborted} (${Date.now() - t}ms)`);
  }
}
