/**
 * tune — parallel evaluation + hill-climbing over planner parameters.
 *
 *   npx ts-node-transpile-only src/simulation/tune.ts eval '{"mode":"solo","strategy":"efficient","params":{}}' 120
 *   npx ts-node-transpile-only src/simulation/tune.ts climb efficient 120 [patience=20]
 *
 * Common random numbers: every candidate is evaluated on the same seeds, so
 * differences are paired. The climb stops after `patience` consecutive
 * candidates without improvement.
 */

import { execFile } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { WorkerConfig } from './evalWorker';
import { PERSONA_PARAMS } from '../bots/personas';
import { DEFAULT_PARAMS } from '../bots/planner';
import type { PlannerParams } from '../bots/planner';

const CENSOR = 40;
const WORKERS = Math.max(1, os.cpus().length);

function runWorker(cfg: WorkerConfig): Promise<any[]> {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      ['-r', 'ts-node/register/transpile-only', path.join(__dirname, 'evalWorker.ts'), JSON.stringify(cfg)],
      { cwd: path.join(__dirname, '../..'), maxBuffer: 64 * 1024 * 1024 },
      (err, stdout) => {
        if (err) return reject(err);
        const line = stdout.split('\n').find(l => l.startsWith('RESULT '));
        if (!line) return reject(new Error('no result: ' + stdout.slice(-500)));
        resolve(JSON.parse(line.slice(7)));
      },
    );
  });
}

export interface EvalResult { meanRounds: number; winRate: number | null; aborted: number; n: number; perGame: number[] }

export async function evaluate(base: Omit<WorkerConfig, 'from' | 'to'>, games: number): Promise<EvalResult> {
  const chunk = Math.ceil(games / WORKERS);
  const jobs: Promise<any[]>[] = [];
  for (let from = 0; from < games; from += chunk) {
    jobs.push(runWorker({ ...base, from, to: Math.min(games, from + chunk) }));
  }
  const all = (await Promise.all(jobs)).flat();
  const perGame = all.map(r => r.rounds ?? CENSOR);
  const wins = all.filter(r => r.win !== undefined).map(r => r.win as number);
  return {
    meanRounds: perGame.reduce((a, b) => a + b, 0) / perGame.length,
    winRate: wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : null,
    aborted: all.filter(r => r.aborted).length,
    n: all.length,
    perGame,
  };
}

// Tunable core parameters with step sizes and bounds.
const SPACE: Partial<Record<keyof PlannerParams, { step: number; min: number; max: number }>> = {
  rate: { step: 0.5, min: 1, max: 8 },
  overflowCost: { step: 0.5, min: 0, max: 4 },
  refreshBias: { step: 0.25, min: -0.5, max: 3 },
  swapMargin: { step: 0.25, min: 0, max: 3 },
  secondCardWeight: { step: 0.1, min: 0.3, max: 1.5 },
  abilityWeight: { step: 0.25, min: 0, max: 3 },
  diamondValue: { step: 0.2, min: 0, max: 2 },
};

function mutate(p: PlannerParams, keys: (keyof PlannerParams)[]): PlannerParams {
  const next = { ...p };
  const n = Math.random() < 0.6 ? 1 : 2;
  for (let i = 0; i < n; i++) {
    const k = keys[Math.floor(Math.random() * keys.length)]!;
    const sp = SPACE[k]!;
    const dir = Math.random() < 0.5 ? -1 : 1;
    const mult = Math.random() < 0.7 ? 1 : 2;
    const v = (next[k] as number) + dir * mult * sp.step;
    (next as any)[k] = Math.round(Math.min(sp.max, Math.max(sp.min, v)) * 100) / 100;
  }
  return next;
}

async function climb(strategy: keyof typeof PERSONA_PARAMS, games: number, patience: number, keys: (keyof PlannerParams)[], logFile: string) {
  let best: PlannerParams = { ...PERSONA_PARAMS[strategy] };
  const base = { mode: 'solo' as const, strategy, prefix: 'tune' };
  let bestRes = await evaluate({ ...base, params: best }, games);
  const log = (s: string) => { console.log(s); fs.appendFileSync(logFile, s + '\n'); };
  log(`start ${strategy} mean=${bestRes.meanRounds.toFixed(3)} aborted=${bestRes.aborted} params=${JSON.stringify(best)}`);
  let stale = 0;
  let trial = 0;
  const tried = new Set<string>([JSON.stringify(best)]);
  while (stale < patience) {
    let cand = mutate(best, keys);
    for (let k = 0; k < 20 && tried.has(JSON.stringify(cand)); k++) cand = mutate(best, keys);
    tried.add(JSON.stringify(cand));
    trial++;
    const res = await evaluate({ ...base, params: cand }, games);
    const diff = Object.keys(cand).filter(k => (cand as any)[k] !== (best as any)[k]).map(k => `${k}=${(cand as any)[k]}`).join(' ');
    if (res.meanRounds < bestRes.meanRounds - 1e-9) {
      best = cand; bestRes = res; stale = 0;
      log(`#${trial} IMPROVED mean=${res.meanRounds.toFixed(3)} (${diff})`);
    } else {
      stale++;
      log(`#${trial} no  mean=${res.meanRounds.toFixed(3)} best=${bestRes.meanRounds.toFixed(3)} stale=${stale} (${diff})`);
    }
  }
  log(`final ${strategy} mean=${bestRes.meanRounds.toFixed(3)} params=${JSON.stringify(best)}`);
}

if (require.main === module) {
  const [cmd, a, b, c, d] = process.argv.slice(2);
  (async () => {
    if (cmd === 'eval') {
      const t = Date.now();
      const cfg = JSON.parse(a!);
      const r = await evaluate({ prefix: 'tune', ...cfg, params: { ...DEFAULT_PARAMS, ...(cfg.persona ? PERSONA_PARAMS[cfg.persona as keyof typeof PERSONA_PARAMS] : {}), ...cfg.params } }, parseInt(b ?? '120', 10));
      console.log(`mean=${r.meanRounds.toFixed(3)} win=${r.winRate === null ? '-' : (r.winRate * 100).toFixed(1) + '%'} aborted=${r.aborted} n=${r.n} (${((Date.now() - t) / 1000).toFixed(0)}s)`);
    } else if (cmd === 'climb') {
      const keys = (d ? d.split(',') : Object.keys(SPACE)) as (keyof PlannerParams)[];
      await climb(a as any, parseInt(b ?? '120', 10), parseInt(c ?? '20', 10), keys, path.join(__dirname, `../../simulation-results/climb-${a}.log`));
    }
  })().catch(e => { console.error(e); process.exit(1); });
}
