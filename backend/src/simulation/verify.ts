/**
 * verify.ts — Automatischer Erfolgskriterien-Check für npc-personas-verfeinern.
 *
 * Läuft ein 300-Spiele-Turnier (Default) mit den drei Persona-Bots und prüft
 * die drei Akzeptanzkriterien:
 *   1. Abbruchrate < 5%
 *   2. Ø Rundenzahl (nur non-aborted) < 20
 *   3. Jede Persona gewinnt > 55% gegen den Legacy-Diamond-Bot (Kontroll-Turnier)
 *
 * Exit 0 bei allen bestanden, 1 sonst. Konsolen-Output listet Ist- vs. Soll-Wert
 * je Kriterium mit PASS/FAIL-Marker.
 *
 * Usage:
 *   pnpm tsx src/simulation/verify.ts [--games 300] [--seed X] [--skip-legacy]
 */

import type { NpcStrategy } from '@portale-von-molthar/shared';
import { runTournament } from './tournament';
import type { TournamentResult } from './tournament';

const PERSONAS: NpcStrategy[] = ['efficient', 'aggressive', 'diamond'];

const THRESHOLDS = {
  abortedRateMax: 0.05,       // < 5 %
  avgRoundsMax: 20,           // < 20 Runden
  legacyWinrateMin: 0.55,     // > 55 % pro Persona
};

interface Options {
  games: number;
  seed: string | undefined;
  skipLegacy: boolean;
}

function parseArgs(argv: string[]): Options {
  const args = argv.slice(2);
  let games = 300;
  let seed: string | undefined;
  let skipLegacy = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === '--games' && next) {
      games = parseInt(next, 10);
      if (isNaN(games) || games < 30) {
        console.error('verify: --games must be an integer ≥ 30');
        process.exit(2);
      }
      i++;
    } else if (arg === '--seed' && next) {
      seed = next;
      i++;
    } else if (arg === '--skip-legacy') {
      skipLegacy = true;
    } else if (arg === '--help' || arg === '-h') {
      console.log('Usage: verify.ts [--games N] [--seed X] [--skip-legacy]');
      process.exit(0);
    }
  }

  return { games, seed, skipLegacy };
}

interface CriterionResult {
  name: string;
  target: string;
  actual: string;
  passed: boolean;
}

function analyseTournament(result: TournamentResult): {
  abortedRate: number;
  avgRoundsCompleted: number;
} {
  const totalGames = result.games.length;
  const completed = result.games.filter(g => !g.aborted);
  const abortedRate = totalGames > 0 ? (totalGames - completed.length) / totalGames : 0;
  const avgRoundsCompleted =
    completed.length > 0
      ? completed.reduce((s, g) => s + g.rounds, 0) / completed.length
      : 0;
  return { abortedRate, avgRoundsCompleted };
}

async function main() {
  const opts = parseArgs(process.argv);

  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  NPC verify — Erfolgskriterien-Check');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Spiele pro Turnier: ${opts.games}`);
  if (opts.seed) console.log(`  Seed:               ${opts.seed}`);
  console.log(`  Legacy-Kontrolle:   ${opts.skipLegacy ? 'übersprungen' : 'aktiv'}`);
  console.log('');

  const criteria: CriterionResult[] = [];

  // ─── Turnier 1: drei Personas untereinander ───
  console.log('▶ Turnier 1/2: 3 Personas untereinander');
  const t1 = runTournament({
    numPlayers: 2,
    gamesPerMatchup: Math.max(1, Math.round(opts.games / (PERSONAS.length * PERSONAS.length))),
    seed: opts.seed,
    strategies: PERSONAS,
  });
  const { abortedRate, avgRoundsCompleted } = analyseTournament(t1);
  console.log(`  Spiele:  ${t1.games.length}`);
  console.log(`  Aborted: ${(abortedRate * 100).toFixed(1)}%`);
  console.log(`  ⌀ Runden (fertig): ${avgRoundsCompleted.toFixed(1)}`);

  criteria.push({
    name: 'Abbruchrate',
    target: `< ${(THRESHOLDS.abortedRateMax * 100).toFixed(1)}%`,
    actual: `${(abortedRate * 100).toFixed(1)}%`,
    passed: abortedRate < THRESHOLDS.abortedRateMax,
  });

  criteria.push({
    name: '⌀ Rundenzahl',
    target: `< ${THRESHOLDS.avgRoundsMax}`,
    actual: avgRoundsCompleted.toFixed(1),
    passed: avgRoundsCompleted < THRESHOLDS.avgRoundsMax,
  });

  // ─── Turnier 2 (optional): Kontrolle gegen Legacy-Diamond-Bot ───
  if (!opts.skipLegacy) {
    console.log('');
    console.log('▶ Turnier 2/2: Personas vs. Legacy-Diamond-Bot');
    let legacyReady = false;
    try {
      // Only import when needed — the file may not yet exist during early development.
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      require('../bots/testBots/LegacyDiamondBot');
      legacyReady = true;
    } catch (err) {
      console.log('  ⚠ LegacyDiamondBot fehlt — Kontroll-Turnier übersprungen.');
      console.log('    (Legen Sie backend/src/bots/testBots/LegacyDiamondBot.ts an, siehe tasks 6.1–6.3.)');
      criteria.push({
        name: 'Persona vs Legacy',
        target: `> ${(THRESHOLDS.legacyWinrateMin * 100).toFixed(0)}% je Persona`,
        actual: 'nicht ausgeführt',
        passed: false,
      });
    }

    if (legacyReady) {
      // Bind the `greedy` slot to LegacyDiamondBot via botOverrides so the
      // control tournament exercises the pre-personas snapshot bot rather
      // than the production `greedy` alias (which maps to WendelinBot).
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { LegacyDiamondBot } = require('../bots/testBots/LegacyDiamondBot');
      const strategiesWithLegacy: NpcStrategy[] = [...PERSONAS, 'greedy'];
      const t2 = runTournament({
        numPlayers: 2,
        gamesPerMatchup: Math.max(1, Math.round(opts.games / (strategiesWithLegacy.length * strategiesWithLegacy.length))),
        seed: opts.seed ? `${opts.seed}-legacy` : undefined,
        strategies: strategiesWithLegacy,
        botOverrides: { greedy: LegacyDiamondBot },
      });
      const h2h = t2.stats.headToHead;
      let legacyPass = true;
      for (const persona of PERSONAS) {
        const winrate = h2h?.[persona]?.['greedy']?.winRate ?? 0;
        const total = h2h?.[persona]?.['greedy']?.total ?? 0;
        const passed = winrate > THRESHOLDS.legacyWinrateMin;
        if (!passed) legacyPass = false;
        console.log(`  ${persona.padEnd(12)} vs Legacy: ${(winrate * 100).toFixed(1)}%  (n=${total})`);
      }
      criteria.push({
        name: 'Personas vs Legacy',
        target: `alle > ${(THRESHOLDS.legacyWinrateMin * 100).toFixed(0)}%`,
        actual: legacyPass ? 'alle bestanden' : 'mind. eine < Schwelle',
        passed: legacyPass,
      });
    }
  }

  // ─── Zusammenfassung ───
  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  Ergebnis');
  console.log('═══════════════════════════════════════════════');
  let allPassed = true;
  for (const c of criteria) {
    const marker = c.passed ? 'PASS' : 'FAIL';
    const line = `  [${marker}] ${c.name.padEnd(22)} Soll: ${c.target.padEnd(20)} Ist: ${c.actual}`;
    console.log(line);
    if (!c.passed) allPassed = false;
  }
  console.log('');
  process.exit(allPassed ? 0 : 1);
}

main().catch(err => {
  console.error('verify: fatal error', err);
  process.exit(2);
});
