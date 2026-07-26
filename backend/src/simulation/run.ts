/**
 * CLI entry point for NPC tournament simulation.
 *
 * Usage:
 *   pnpm tsx src/simulation/run.ts [options]
 *
 * Options:
 *   --players  <n|n,m,...>    Player count(s), comma-separated (default: 2)
 *   --games    <n>            Games per matchup (default: 100)
 *   --seed     <string>       Master seed for reproducibility (default: random)
 *   --strategies <a,b,...>    Strategies to include (default: all 5)
 *   --output   <dir>          Output directory (default: ./simulation-results)
 *   --verbose                 Include full move log in JSON report
 *   --special-cards           Include special cards in games
 */

import * as fs from 'fs';
import * as path from 'path';
import type { NpcStrategy } from '@portale-von-molthar/shared';
import { runTournament } from './tournament';
import type { TournamentConfig } from './tournament';
import { generateJsonReport, generateHtmlReport } from './reporter';
import { LegacyDiamondBot } from '../bots/testBots/LegacyDiamondBot';

/**
 * `--legacy-diamond` control mode
 * -------------------------------
 * When set, the tournament substitutes the snapshot `LegacyDiamondBot`
 * (backend/src/bots/testBots/LegacyDiamondBot.ts, restored from commit
 * d87cce1) for the `greedy` strategy slot via the `botOverrides` mechanism
 * on TournamentConfig. This keeps the production factory clean (LegacyDiamondBot
 * is never imported into `bots/index.ts`) while allowing head-to-head
 * comparison of the current persona bots against the pre-personas baseline
 * in the head-to-head stats under the `greedy` label.
 *
 * See design.md D4 (`openspec/changes/npc-personas-verfeinern/design.md`).
 */

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

const ALL_STRATEGIES: NpcStrategy[] = ['random', 'greedy', 'diamond', 'efficient', 'aggressive'];

function parseArgs(argv: string[]): {
  playerCounts: number[];
  gamesPerMatchup: number;
  seed: string | undefined;
  strategies: NpcStrategy[];
  outputDir: string;
  verbose: boolean;
  withSpecialCards: boolean;
  diagnoseDeadlock: boolean;
  legacyDiamond: boolean;
} {
  const args = argv.slice(2); // skip node + script

  let playerCounts = [2];
  let gamesPerMatchup = 100;
  let seed: string | undefined;
  let strategies: NpcStrategy[] = ALL_STRATEGIES;
  let outputDir = './simulation-results';
  let verbose = false;
  let withSpecialCards = false;
  let diagnoseDeadlock = false;
  let legacyDiamond = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    if (arg === '--players' && next) {
      playerCounts = next.split(',').map(n => {
        const v = parseInt(n.trim(), 10);
        if (isNaN(v) || v < 2 || v > 5) {
          console.error(`Invalid player count: ${n} (must be 2–5)`);
          process.exit(1);
        }
        return v;
      });
      i++;
    } else if (arg === '--games' && next) {
      gamesPerMatchup = parseInt(next, 10);
      if (isNaN(gamesPerMatchup) || gamesPerMatchup < 1) {
        console.error('Invalid --games value');
        process.exit(1);
      }
      i++;
    } else if (arg === '--seed' && next) {
      seed = next;
      i++;
    } else if (arg === '--strategies' && next) {
      strategies = next.split(',').map(s => s.trim()) as NpcStrategy[];
      const invalid = strategies.filter(s => !ALL_STRATEGIES.includes(s));
      if (invalid.length > 0) {
        console.error(`Unknown strategies: ${invalid.join(', ')}`);
        console.error(`Valid: ${ALL_STRATEGIES.join(', ')}`);
        process.exit(1);
      }
      i++;
    } else if (arg === '--output' && next) {
      outputDir = next;
      i++;
    } else if (arg === '--verbose') {
      verbose = true;
    } else if (arg === '--special-cards') {
      withSpecialCards = true;
    } else if (arg === '--diagnose-deadlock') {
      diagnoseDeadlock = true;
    } else if (arg === '--legacy-diamond') {
      legacyDiamond = true;
    }
  }

  return {
    playerCounts,
    gamesPerMatchup,
    seed,
    strategies,
    outputDir,
    verbose,
    withSpecialCards,
    diagnoseDeadlock,
    legacyDiamond,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs(process.argv);

  // Ensure output directory exists
  fs.mkdirSync(opts.outputDir, { recursive: true });
  const resolvedOutput = path.resolve(opts.outputDir);

  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log('  NPC-Turnier Simulation');
  console.log('═══════════════════════════════════════════════');
  console.log(`  Spieler:    ${opts.playerCounts.join(', ')}P`);
  console.log(`  Spiele:     ${opts.gamesPerMatchup} pro Matchup`);
  console.log(`  Strategien: ${opts.strategies.join(', ')}`);
  console.log(`  Sonderkart: ${opts.withSpecialCards ? 'Ja' : 'Nein'}`);
  console.log(`  Verbose:    ${opts.verbose ? 'Ja' : 'Nein'}`);
  if (opts.legacyDiamond) {
    console.log(`  Legacy:     ersetzt "greedy"-Slot durch LegacyDiamondBot`);
  }
  console.log(`  Output:     ${resolvedOutput}`);
  if (opts.seed) console.log(`  Seed:       ${opts.seed}`);
  console.log('═══════════════════════════════════════════════');
  console.log('');

  const totalStart = Date.now();
  const generatedFiles: string[] = [];

  for (const numPlayers of opts.playerCounts) {
    console.log(`\n▶ ${numPlayers}-Spieler-Turnier`);

    const tournamentConfig: TournamentConfig = {
      numPlayers,
      gamesPerMatchup: opts.gamesPerMatchup,
      seed: opts.seed,
      strategies: opts.strategies,
      verbose: opts.verbose,
      withSpecialCards: opts.withSpecialCards,
      diagnoseDeadlock: opts.diagnoseDeadlock,
    };
    if (opts.legacyDiamond) {
      // Ensure the `greedy` slot is actually part of the matchup grid.
      if (!tournamentConfig.strategies!.includes('greedy')) {
        tournamentConfig.strategies = [...tournamentConfig.strategies!, 'greedy'];
      }
      tournamentConfig.botOverrides = { greedy: LegacyDiamondBot };
    }
    const result = runTournament(tournamentConfig);

    // Print summary
    const { meta, stats } = result;
    console.log(`\n  Abgeschlossen in ${(meta.durationMs / 1000).toFixed(1)}s`);
    console.log(`  Seed: ${meta.seed}`);
    if (meta.abortedGames > 0) {
      console.log(`  ⚠ Abgebrochene Spiele: ${meta.abortedGames}`);
    }
    console.log('');
    console.log('  Gewinnrate:');

    const sorted = opts.strategies
      .filter(s => stats.perStrategy[s])
      .sort((a, b) => (stats.perStrategy[b]?.winRate ?? 0) - (stats.perStrategy[a]?.winRate ?? 0));

    for (const s of sorted) {
      const st = stats.perStrategy[s];
      if (!st) continue;
      const bar = '█'.repeat(Math.round(st.winRate * 20));
      const pct = (st.winRate * 100).toFixed(1).padStart(5);
      console.log(`    ${s.padEnd(12)} ${bar.padEnd(20)} ${pct}%  Ø${st.avgScore.toFixed(1)}pts`);
    }

    if (stats.headToHead) {
      console.log('\n  Head-to-Head (Zeile vs Spalte):');
      const header = '              ' + sorted.map(s => s.slice(0, 6).padStart(7)).join('');
      console.log(header);
      for (const a of sorted) {
        const row = sorted.map(b => {
          if (a === b) return '   —   ';
          const wr = stats.headToHead?.[a]?.[b]?.winRate ?? 0;
          return `  ${(wr * 100).toFixed(0).padStart(3)}%  `;
        }).join('');
        console.log(`    ${a.padEnd(12)}${row}`);
      }
    }

    // Write reports
    const jsonPath = generateJsonReport(result, resolvedOutput, opts.verbose);
    const htmlPath = generateHtmlReport(result, resolvedOutput);

    generatedFiles.push(jsonPath, htmlPath);
    console.log(`\n  📄 ${path.basename(jsonPath)}`);
    console.log(`  🌐 ${path.basename(htmlPath)}`);
  }

  const totalSec = ((Date.now() - totalStart) / 1000).toFixed(1);
  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`  Gesamt: ${totalSec}s`);
  console.log(`  Output: ${resolvedOutput}/`);
  console.log('');
  for (const f of generatedFiles) {
    console.log(`    ${f}`);
  }
  console.log('═══════════════════════════════════════════════\n');
}

main().catch(err => {
  console.error('Fehler:', err);
  process.exit(1);
});
