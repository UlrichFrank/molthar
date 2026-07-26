#!/usr/bin/env node
/**
 * analyze-deadlocks.mjs — analyze deadlock log produced by
 * `run.ts --diagnose-deadlock`. Reads JSONL from stdin or first arg.
 *
 * Reports:
 *   - Move frequency in the last-30-window per aborted game
 *   - Most-repeating move sequences (motifs of length 3–5)
 *   - Point / diamond / hand stagnation
 */

import * as fs from 'node:fs';

const inputPath = process.argv[2];
if (!inputPath) {
  console.error('Usage: node analyze-deadlocks.mjs <path-to-jsonl>');
  process.exit(1);
}

const lines = fs.readFileSync(inputPath, 'utf8').split('\n').filter(Boolean);

// Parse: "[DEADLOCK gameId=<id>] {json}"
const games = new Map();
for (const line of lines) {
  const match = line.match(/^\[DEADLOCK gameId=(\S+)\] (.*)$/);
  if (!match) continue;
  const [, gameId, jsonPart] = match;
  const entry = JSON.parse(jsonPart);
  if (!games.has(gameId)) games.set(gameId, []);
  games.get(gameId).push(entry);
}

console.log(`\nParsed ${games.size} aborted games (${lines.length} log entries)\n`);

// ─── Move frequency across all deadlock windows ───
const moveCount = new Map();
for (const entries of games.values()) {
  for (const e of entries) {
    moveCount.set(e.move, (moveCount.get(e.move) ?? 0) + 1);
  }
}
console.log('▶ Move frequency in deadlock windows:');
const sortedMoves = [...moveCount.entries()].sort((a, b) => b[1] - a[1]);
for (const [move, count] of sortedMoves) {
  console.log(`   ${move.padEnd(25)} ${count}`);
}

// ─── Common trailing-3 motifs ───
const motifCount = new Map();
for (const entries of games.values()) {
  const moves = entries.map(e => e.move);
  for (let i = 0; i <= moves.length - 3; i++) {
    const key = moves.slice(i, i + 3).join(' → ');
    motifCount.set(key, (motifCount.get(key) ?? 0) + 1);
  }
}
console.log('\n▶ Top 10 recurring 3-move motifs:');
const sortedMotifs = [...motifCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
for (const [motif, count] of sortedMotifs) {
  console.log(`   ${count.toString().padStart(4)}  ${motif}`);
}

// ─── Points stagnation per game ───
console.log('\n▶ Point progression in last-30 window:');
let stagnantCount = 0;
for (const [gameId, entries] of games) {
  const uniquePts = new Set(entries.map(e => e.snapshot.powerPoints));
  if (uniquePts.size === 1) stagnantCount++;
}
console.log(`   ${stagnantCount}/${games.size} games had zero point change in last 30 turns`);

// ─── Hand size stagnation ───
let handAtLimit = 0;
for (const entries of games.values()) {
  const avgHand = entries.reduce((s, e) => s + e.snapshot.hand.length, 0) / entries.length;
  if (avgHand >= 4.8) handAtLimit++;
}
console.log(`   ${handAtLimit}/${games.size} games had avg hand size ≥ 4.8 in last 30 turns`);

// ─── Player breakdown ───
console.log('\n▶ Which strategies dominate the last-30 window (by move count):');
const strategyMoves = new Map();
for (const entries of games.values()) {
  for (const e of entries) {
    const key = `${e.strategy}:${e.move}`;
    strategyMoves.set(key, (strategyMoves.get(key) ?? 0) + 1);
  }
}
const sortedStrat = [...strategyMoves.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
for (const [key, count] of sortedStrat) {
  console.log(`   ${count.toString().padStart(4)}  ${key}`);
}
