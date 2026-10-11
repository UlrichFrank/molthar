/**
 * Eternal leaderboard: every finished (non-terminated) match is folded into a
 * small JSON file that outlives the match files (which are wiped after a TTL).
 * Players are identified by display name. `counted` remembers match IDs so the
 * repeated metadata writes of one finished match are only counted once.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface LeaderboardEntry {
  name: string;
  games: number;
  wins: number;
  points: number;
  diamonds: number;
  best: number;
}

interface LeaderboardFile {
  players: Record<string, LeaderboardEntry>;
  counted: string[];
}

interface RankingRow {
  name: string;
  powerPoints: number;
  diamonds: number;
}

const MAX_COUNTED = 5000;
const MAX_PLAYERS = 100;
const MAX_NAME = 20;

const DATA_FILE = path.join(
  process.env.LEADERBOARD_DIR || process.env.NPC_DATA_DIR || path.join(process.cwd(), 'data-npc'),
  'leaderboard.json',
);

function load(): LeaderboardFile {
  try {
    const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8')) as LeaderboardFile;
    // Names are player-chosen, so keep them off Object.prototype ("__proto__" etc.)
    const players: Record<string, LeaderboardEntry> = Object.create(null);
    for (const [name, entry] of Object.entries(raw.players ?? {})) {
      if (name !== '__proto__') players[name] = entry;
    }
    return { players, counted: raw.counted ?? [] };
  } catch (err) {
    // An unreadable file must not be overwritten by the next record: set it aside
    if (fs.existsSync(DATA_FILE)) {
      try {
        const aside = `${DATA_FILE}.corrupt-${Date.now()}`;
        fs.renameSync(DATA_FILE, aside);
        console.warn(`[Leaderboard] ${DATA_FILE} unreadable (${err}); moved to ${aside}`);
      } catch {
        // nothing to set aside
      }
    }
    return { players: Object.create(null), counted: [] };
  }
}

function save(data: LeaderboardFile): void {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const tmp = `${DATA_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data));
  fs.renameSync(tmp, DATA_FILE);
}

const byRank = (a: LeaderboardEntry, b: LeaderboardEntry) =>
  b.wins - a.wins || b.points / b.games - a.points / a.games || b.games - a.games;

export function recordMatch(matchID: string, ranking: RankingRow[]): void {
  if (!Array.isArray(ranking) || ranking.length < 2) return;
  try {
    const data = load();
    if (data.counted.includes(matchID)) return;
    const top = ranking[0]!;
    const touched = new Set<string>();
    ranking.forEach((row, i) => {
      if (typeof row.name !== 'string') return;
      const name = row.name.trim().slice(0, MAX_NAME);
      if (name === '' || name === '__proto__') return;
      touched.add(name);
      const e = data.players[name] ??= {
        name, games: 0, wins: 0, points: 0, diamonds: 0, best: 0,
      };
      const isWinner = i === 0
        || (row.powerPoints === top.powerPoints && row.diamonds === top.diamonds);
      e.games += 1;
      if (isWinner) e.wins += 1;
      e.points += row.powerPoints;
      e.diamonds += row.diamonds;
      e.best = Math.max(e.best, row.powerPoints);
    });
    // Bounded table: the worst-ranked players not in this match make room
    const names = Object.keys(data.players);
    if (names.length > MAX_PLAYERS) {
      const evictable = names.map(n => data.players[n]!).filter(e => !touched.has(e.name)).sort(byRank).reverse();
      for (const e of evictable.slice(0, names.length - MAX_PLAYERS)) delete data.players[e.name];
    }
    data.counted.push(matchID);
    if (data.counted.length > MAX_COUNTED) data.counted.splice(0, data.counted.length - MAX_COUNTED);
    save(data);
  } catch (err) {
    console.warn('[Leaderboard] Could not record match:', err);
  }
}

export function getLeaderboard(): LeaderboardEntry[] {
  return Object.values(load().players).sort(byRank);
}
