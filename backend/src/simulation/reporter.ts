/**
 * Reporter — generates JSON report and self-contained HTML dashboard.
 */

import * as fs from 'fs';
import * as path from 'path';
import type { TournamentResult, HeadToHeadEntry } from './tournament';
import type { NpcStrategy } from '@portale-von-molthar/shared';
import type { GameResult } from './engine';

// ---------------------------------------------------------------------------
// JSON Report
// ---------------------------------------------------------------------------

export function generateJsonReport(
  result: TournamentResult,
  outputDir: string,
  verbose: boolean,
): string {
  const filename = reportFilename(result, 'json');
  const outputPath = path.join(outputDir, filename);

  const output = {
    meta: result.meta,
    games: result.games.map(g => ({
      gameId: g.gameId,
      strategies: g.strategies,
      rounds: g.rounds,
      totalActions: g.totalActions,
      ranking: g.ranking,
      aborted: g.aborted,
      ...(verbose && g.log.length > 0 ? { log: g.log } : {}),
    })),
    stats: result.stats,
  };

  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
  return outputPath;
}

// ---------------------------------------------------------------------------
// HTML Report
// ---------------------------------------------------------------------------

export function generateHtmlReport(
  result: TournamentResult,
  outputDir: string,
): string {
  const filename = reportFilename(result, 'html');
  const outputPath = path.join(outputDir, filename);

  const html = buildHtml(result);
  fs.writeFileSync(outputPath, html, 'utf-8');
  return outputPath;
}

// ---------------------------------------------------------------------------
// HTML builder
// ---------------------------------------------------------------------------

const STRATEGY_LABELS: Record<NpcStrategy, string> = {
  random:     'IrrnisBot (random)',
  greedy:     'GierBot (greedy)',
  diamond:    'EdelsteinBot (diamond)',
  efficient:  'WendelinBot (efficient)',
  aggressive: 'RalfBot (aggressive)',
};

const STRATEGY_COLORS: Record<NpcStrategy, string> = {
  random:     '#94a3b8',
  greedy:     '#f59e0b',
  diamond:    '#3b82f6',
  efficient:  '#10b981',
  aggressive: '#ef4444',
};

function buildHtml(result: TournamentResult): string {
  const { meta, stats } = result;
  const strategies = meta.strategies;

  // Sort strategies by win rate descending
  const sortedStrategies = [...strategies].sort((a, b) => {
    const wa = stats.perStrategy[a]?.winRate ?? 0;
    const wb = stats.perStrategy[b]?.winRate ?? 0;
    return wb - wa;
  });

  const durationSec = (meta.durationMs / 1000).toFixed(1);

  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>NPC-Turnier Dashboard — ${meta.numPlayers}P · ${meta.numGames} Spiele</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"><\/script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: system-ui, sans-serif; background: #0f172a; color: #e2e8f0; padding: 24px; }
  h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 4px; }
  .meta { font-size: 0.85rem; color: #94a3b8; margin-bottom: 32px; }
  .meta span { margin-right: 16px; }
  .grid { display: grid; gap: 24px; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); }
  .card { background: #1e293b; border-radius: 12px; padding: 20px; }
  .card h2 { font-size: 1rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
  th { text-align: left; color: #64748b; font-weight: 500; padding: 6px 8px; border-bottom: 1px solid #334155; }
  td { padding: 8px; border-bottom: 1px solid #1e293b; }
  tr:last-child td { border-bottom: none; }
  .bar-bg { background: #334155; border-radius: 4px; height: 8px; width: 100%; margin-top: 4px; }
  .bar-fill { height: 8px; border-radius: 4px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
  .h2h-grid { display: grid; gap: 2px; font-size: 0.75rem; }
  .h2h-cell { padding: 6px; text-align: center; border-radius: 4px; font-weight: 600; }
  .h2h-label { padding: 6px; color: #64748b; font-size: 0.75rem; display: flex; align-items: center; }
  .h2h-self { background: #334155; color: #64748b; }
  canvas { max-height: 280px; }
</style>
</head>
<body>

<h1>NPC-Turnier Dashboard</h1>
<div class="meta">
  <span>📅 ${new Date(meta.date).toLocaleString('de-DE')}</span>
  <span>👥 ${meta.numPlayers} Spieler</span>
  <span>🎮 ${meta.numGames} Spiele</span>
  <span>⏱ ${durationSec}s</span>
  <span>🌱 Seed: <code>${meta.seed}</code></span>
  ${meta.abortedGames > 0 ? `<span>⚠️ ${meta.abortedGames} abgebrochen</span>` : ''}
</div>

<div class="grid">

  <!-- Win Rate Table -->
  <div class="card">
    <h2>Gewinnrate</h2>
    <table>
      <thead><tr><th>Strategie</th><th>Gewinnrate</th><th>Ø Punkte</th><th>Ø Rang</th><th>Spiele</th></tr></thead>
      <tbody>
        ${sortedStrategies.map(s => {
          const st = stats.perStrategy[s];
          if (!st) return '';
          const color = STRATEGY_COLORS[s];
          const pct = (st.winRate * 100).toFixed(1);
          return `<tr>
            <td><span class="badge" style="background:${color}22;color:${color}">${STRATEGY_LABELS[s]}</span></td>
            <td>
              <div>${pct}%</div>
              <div class="bar-bg"><div class="bar-fill" style="width:${pct}%;background:${color}"></div></div>
            </td>
            <td>${st.avgScore.toFixed(1)}</td>
            <td>${st.avgRank.toFixed(2)}</td>
            <td>${st.gamesPlayed}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </div>

  ${meta.numPlayers === 2 && stats.headToHead ? buildH2HSection(sortedStrategies, stats.headToHead) : ''}

  <!-- Score Distribution Chart -->
  <div class="card">
    <h2>Punkteverteilung</h2>
    <canvas id="scoreChart"></canvas>
  </div>

  <!-- Game Length Chart -->
  <div class="card">
    <h2>Spieldauer (Runden)</h2>
    <canvas id="lengthChart"></canvas>
  </div>

</div>

<script>
const TOURNAMENT_DATA = ${JSON.stringify({
    strategies: sortedStrategies,
    strategyLabels: Object.fromEntries(sortedStrategies.map(s => [s, STRATEGY_LABELS[s]])),
    strategyColors: Object.fromEntries(sortedStrategies.map(s => [s, STRATEGY_COLORS[s]])),
    scoreDistribution: stats.scoreDistribution,
    games: result.games.map((g: GameResult) => ({ rounds: g.rounds, aborted: g.aborted })),
    avgGameLength: stats.avgGameLength,
  }, null, 2)};

// Score Distribution (grouped bar: min/avg/max per strategy)
const scoreCtx = document.getElementById('scoreChart').getContext('2d');
new Chart(scoreCtx, {
  type: 'bar',
  data: {
    labels: TOURNAMENT_DATA.strategies.map(s => TOURNAMENT_DATA.strategyLabels[s]),
    datasets: [
      {
        label: 'Min',
        data: TOURNAMENT_DATA.strategies.map(s => TOURNAMENT_DATA.scoreDistribution[s]?.min ?? 0),
        backgroundColor: TOURNAMENT_DATA.strategies.map(s => TOURNAMENT_DATA.strategyColors[s] + '44'),
        borderColor: TOURNAMENT_DATA.strategies.map(s => TOURNAMENT_DATA.strategyColors[s]),
        borderWidth: 1,
      },
      {
        label: 'Ø',
        data: TOURNAMENT_DATA.strategies.map(s => TOURNAMENT_DATA.scoreDistribution[s]?.avg ?? 0),
        backgroundColor: TOURNAMENT_DATA.strategies.map(s => TOURNAMENT_DATA.strategyColors[s] + 'aa'),
        borderColor: TOURNAMENT_DATA.strategies.map(s => TOURNAMENT_DATA.strategyColors[s]),
        borderWidth: 1,
      },
      {
        label: 'Max',
        data: TOURNAMENT_DATA.strategies.map(s => TOURNAMENT_DATA.scoreDistribution[s]?.max ?? 0),
        backgroundColor: TOURNAMENT_DATA.strategies.map(s => TOURNAMENT_DATA.strategyColors[s]),
        borderColor: TOURNAMENT_DATA.strategies.map(s => TOURNAMENT_DATA.strategyColors[s]),
        borderWidth: 1,
      },
    ],
  },
  options: {
    responsive: true,
    plugins: { legend: { labels: { color: '#94a3b8' } } },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
      y: { ticks: { color: '#64748b' }, grid: { color: '#334155' }, title: { display: true, text: 'Punkte', color: '#64748b' } },
    },
  },
});

// Game Length Histogram
const completedGames = TOURNAMENT_DATA.games.filter(g => !g.aborted);
const roundCounts = completedGames.map(g => g.rounds);
const maxRound = Math.max(...roundCounts, 1);
const binSize = Math.max(1, Math.ceil(maxRound / 15));
const bins = {};
for (const r of roundCounts) {
  const bin = Math.floor(r / binSize) * binSize;
  bins[bin] = (bins[bin] || 0) + 1;
}
const binKeys = Object.keys(bins).map(Number).sort((a, b) => a - b);

const lengthCtx = document.getElementById('lengthChart').getContext('2d');
new Chart(lengthCtx, {
  type: 'bar',
  data: {
    labels: binKeys.map(k => \`\${k}–\${k + binSize - 1}\`),
    datasets: [{
      label: 'Anzahl Spiele',
      data: binKeys.map(k => bins[k]),
      backgroundColor: '#3b82f688',
      borderColor: '#3b82f6',
      borderWidth: 1,
    }],
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: \`Ø \${TOURNAMENT_DATA.avgGameLength.toFixed(1)} Runden\`, color: '#94a3b8' },
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
      y: { ticks: { color: '#64748b' }, grid: { color: '#334155' } },
    },
  },
});
<\/script>
</body>
</html>`;
}

function buildH2HSection(
  strategies: NpcStrategy[],
  headToHead: NonNullable<TournamentResult['stats']['headToHead']>,
): string {
  const n = strategies.length;
  const cells: string[] = [];

  // Header row
  cells.push('<div class="h2h-label" style="font-weight:600;color:#e2e8f0">↓ vs →</div>');
  for (const b of strategies) {
    const color = STRATEGY_COLORS[b];
    cells.push(`<div class="h2h-cell" style="background:${color}22;color:${color};font-size:0.65rem">${b}</div>`);
  }

  // Data rows
  for (const a of strategies) {
    const color = STRATEGY_COLORS[a];
    cells.push(`<div class="h2h-label"><span style="color:${color}">${b2label(a)}</span></div>`);
    for (const b of strategies) {
      if (a === b) {
        cells.push('<div class="h2h-cell h2h-self">—</div>');
        continue;
      }
      const entry = headToHead[a]?.[b] as HeadToHeadEntry | undefined;
      const wr = entry ? entry.winRate : 0;
      const pct = (wr * 100).toFixed(0);
      const bg = wr >= 0.6 ? '#16a34a' : wr >= 0.5 ? '#15803d' : wr >= 0.4 ? '#b45309' : '#dc2626';
      const textColor = '#fff';
      cells.push(`<div class="h2h-cell" style="background:${bg};color:${textColor}">${pct}%</div>`);
    }
  }

  return `
  <div class="card" style="grid-column: 1 / -1">
    <h2>Head-to-Head Win-Rate (Zeile gewinnt gegen Spalte)</h2>
    <div class="h2h-grid" style="grid-template-columns: 160px repeat(${n}, 1fr);">
      ${cells.join('\n      ')}
    </div>
  </div>`;
}

function b2label(s: NpcStrategy): string {
  const short: Record<NpcStrategy, string> = {
    random: 'random', greedy: 'greedy', diamond: 'diamond', efficient: 'efficient', aggressive: 'aggressive',
  };
  return short[s];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function reportFilename(result: TournamentResult, ext: 'json' | 'html'): string {
  const date = new Date(result.meta.date).toISOString().slice(0, 10);
  return `report_${result.meta.numPlayers}p_${result.meta.numGames}g_${date}.${ext}`;
}
