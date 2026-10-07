/**
 * evalWorker — evaluates one bot configuration on a seed range (child process of tune.ts).
 * Input: JSON in argv[2]. Output: one JSON line with per-game metrics.
 */

import type { NpcStrategy } from '@portale-von-molthar/shared';
import { runGame } from './engine';
import type { BotStrategyFn } from '../bots/index';
import { makePlannerBot } from '../bots/personas';
import { DEFAULT_PARAMS, pickDiscardIndices } from '../bots/planner';
import type { PlannerParams } from '../bots/planner';
import { BOTS } from './bench';

export interface WorkerConfig {
  mode: 'solo' | 'duel';
  strategy: NpcStrategy;
  params: Partial<PlannerParams>;
  opponent?: string; // BOTS key for duel
  from: number;
  to: number;
  prefix: string;
}

const cfg = JSON.parse(process.argv[2]!) as WorkerConfig;
const params: PlannerParams = { ...DEFAULT_PARAMS, ...cfg.params };
const bot = makePlannerBot(cfg.strategy, params);
const discard = (G: any, pid: string, excess: number) => pickDiscardIndices(G, pid, excess, params);
const PASSIVE: BotStrategyFn = () => ({ event: 'endTurn' });

const out: { rounds: number | null; win?: number; oppRounds?: number | null; aborted: boolean }[] = [];
for (let i = cfg.from; i < cfg.to; i++) {
  if (cfg.mode === 'solo') {
    const r = runGame({
      gameId: `s${i}`, strategies: { '0': cfg.strategy, '1': 'random' }, seed: `${cfg.prefix}:${i}`,
      botsByPlayer: { '0': bot, '1': PASSIVE }, discardByPlayer: { '0': discard },
    });
    out.push({ rounds: r.thresholdRound['0'] ?? null, aborted: r.aborted });
  } else {
    const opp = BOTS[cfg.opponent!]!;
    for (const seatA of ['0', '1']) {
      const seatB = seatA === '0' ? '1' : '0';
      const r = runGame({
        gameId: `d${i}${seatA}`, strategies: { [seatA]: cfg.strategy, [seatB]: 'efficient' } as Record<string, NpcStrategy>,
        seed: `${cfg.prefix}:${i}`,
        botsByPlayer: { [seatA]: bot, [seatB]: opp.fn },
        discardByPlayer: { [seatA]: discard, ...(opp.smartDiscard ? { [seatB]: pickDiscardIndices } : {}) },
      });
      const [top, second] = r.ranking;
      let win = 0.5;
      if (!r.aborted && top && second) {
        if (top.powerPoints === second.powerPoints && top.diamonds === second.diamonds) win = 0.5;
        else win = top.playerId === seatA ? 1 : 0;
      }
      out.push({ rounds: r.thresholdRound[seatA] ?? null, oppRounds: r.thresholdRound[seatB] ?? null, win, aborted: r.aborted });
    }
  }
}
process.stdout.write('RESULT ' + JSON.stringify(out) + '\n');
