/**
 * Match storage for the boardgame.io server.
 *
 * boardgame.io's FlatFile stores every match as a JSON file via node-persist.
 * node-persist reads *every* file in the directory to answer `keys()`, and by
 * default rejects the whole read as soon as one file is unparseable. Its
 * `fs.writeFile` is not atomic either, so a container that dies mid-write
 * leaves a truncated (usually 0-byte) file behind.
 *
 * Both together are fatal: a single broken file makes `GET /games/<name>`
 * answer 500 forever, which silently kills the open-games list, the NPC
 * BotRunner (it polls the same endpoint) and every waiting room. That is
 * exactly what happened in production on 2026-08-09.
 *
 * This store closes the loop from both ends:
 *   - writes are atomic (temp file + rename), so corruption cannot appear,
 *   - reads survive corruption anyway (forgiving parse + per-match try/catch),
 *   - broken leftovers are swept on startup so the server self-heals.
 */

import { FlatFile } from 'boardgame.io/server';
import * as fs from 'fs';
import * as path from 'path';
import { recordMatch } from './leaderboard';

const METADATA_SUFFIX = ':metadata';
const STALE_SWEEP_INTERVAL_MS = 6 * 60 * 60 * 1000;
/** How long listMatches' metadata stands in for a match deleted right after. */
const LISTED_GRACE_MS = 2000;

interface MatchStoreOptions {
  dir: string;
  /** Matches untouched for this many days are wiped on startup. 0 disables. */
  ttlDays?: number;
}

export class MatchStore extends FlatFile {
  private readonly dataDir: string;
  private readonly ttlDays: number;
  /** Metadata read by recent listMatches calls, see fetch(). */
  private readonly listed = new Map<string, any>();

  constructor({ dir, ttlDays = 0 }: MatchStoreOptions) {
    super({ dir });
    this.dataDir = dir;
    this.ttlDays = ttlDays;
  }

  async connect(): Promise<void> {
    const removed = sweepCorruptFiles(this.dataDir);
    if (removed.length > 0) {
      console.warn(
        `[MatchStore] Removed ${removed.length} corrupt storage file(s): ${removed.join(', ')}`,
      );
    }

    // `forgiveParseErrors` keeps a damaged file from rejecting a whole directory
    // read; `writeQueue: false` writes through instead of flushing up to a
    // second later, so a shutdown cannot drop an already-acknowledged move.
    await this.storage.init({
      dir: this.dataDir,
      logging: false,
      ttl: false,
      forgiveParseErrors: true,
      writeQueue: false,
    });

    makeWritesAtomic(this.storage);

    if (this.ttlDays > 0) {
      await this.wipeStaleMatches(this.ttlDays);
      // The server can stay up for weeks, so a startup-only sweep would let
      // dead matches pile up again. `unref` keeps it from holding the process.
      const timer = setInterval(() => {
        this.wipeStaleMatches(this.ttlDays).catch(err =>
          console.warn('[MatchStore] Stale-match sweep failed:', err),
        );
      }, STALE_SWEEP_INTERVAL_MS);
      timer.unref();
    }
  }

  /**
   * Like FlatFile.listMatches, but a match that cannot be read is skipped
   * instead of failing the entire request. Also skips reading match *state*,
   * which the original fetches and never uses — that is ~40 KB per match on
   * an endpoint the lobby polls every few seconds.
   */
  async listMatches(opts?: {
    gameName?: string;
    where?: { isGameover?: boolean; updatedBefore?: number; updatedAfter?: number };
  }): Promise<string[]> {
    const keys = await this.storage.keys();
    const matchIDs: string[] = [];

    for (const key of keys) {
      // A forgiven parse error yields a keyless entry — nothing to list.
      if (typeof key !== 'string' || !key.endsWith(METADATA_SUFFIX)) continue;
      const matchID = key.slice(0, key.length - METADATA_SUFFIX.length);

      if (!opts) {
        matchIDs.push(matchID);
        continue;
      }

      let metadata;
      try {
        ({ metadata } = await this.fetch(matchID, { metadata: true }));
      } catch (err) {
        console.warn(`[MatchStore] Skipping unreadable match ${matchID}:`, err);
        continue;
      }
      if (!metadata) continue;
      this.rememberListed(matchID, metadata);

      if (opts.gameName && opts.gameName !== metadata.gameName) continue;

      const where = opts.where;
      if (where) {
        if (
          typeof where.isGameover !== 'undefined' &&
          (typeof metadata.gameover !== 'undefined') !== where.isGameover
        ) continue;
        if (
          typeof where.updatedBefore !== 'undefined' &&
          metadata.updatedAt >= where.updatedBefore
        ) continue;
        if (
          typeof where.updatedAfter !== 'undefined' &&
          metadata.updatedAt <= where.updatedAfter
        ) continue;
      }

      matchIDs.push(matchID);
    }

    return matchIDs;
  }

  /**
   * The lobby list route fetches each listed match's metadata again and reads
   * `metadata.unlisted` unchecked. A match finished and deleted in between
   * (terminated matches are wiped at once) crashed it with a 500 — and with
   * it the open-games list and the BotRunner's scan. For a moment after a
   * listing, a vanished match reads as unlisted instead, so the route skips it.
   */
  async fetch(matchID: string, opts: any): Promise<any> {
    const result = await super.fetch(matchID, opts);
    if (opts?.metadata && !result.metadata && this.listed.has(matchID)) {
      result.metadata = { ...this.listed.get(matchID), unlisted: true };
    }
    return result;
  }

  private rememberListed(matchID: string, metadata: any): void {
    this.listed.set(matchID, metadata);
    setTimeout(() => {
      if (this.listed.get(matchID) === metadata) this.listed.delete(matchID);
    }, LISTED_GRACE_MS).unref();
  }

  /**
   * boardgame.io 0.50.2 has no onMatchEnd hook, so terminated matches are
   * detected on their metadata write and deleted right away.
   */
  async setMetadata(id: string, metadata: any): Promise<void> {
    await super.setMetadata(id, metadata);
    if (metadata?.gameover?.reason === 'terminated') {
      await this.wipe(id);
    } else if (metadata?.gameover?.ranking) {
      recordMatch(id, metadata.gameover.ranking);
    }
  }

  /** Drop matches nobody has touched in `ttlDays` days so the lobby stays clean. */
  private async wipeStaleMatches(ttlDays: number): Promise<void> {
    const cutoff = Date.now() - ttlDays * 24 * 60 * 60 * 1000;
    let wiped = 0;

    for (const matchID of await this.listMatches({ where: { updatedBefore: cutoff } })) {
      try {
        await this.wipe(matchID);
        wiped++;
      } catch (err) {
        console.warn(`[MatchStore] Could not wipe stale match ${matchID}:`, err);
      }
    }

    if (wiped > 0) {
      console.log(`[MatchStore] Wiped ${wiped} match(es) older than ${ttlDays} day(s)`);
    }
  }

  /** The node-persist instance FlatFile keeps in a private field. */
  private get storage(): any {
    return (this as any).games;
  }
}

const TMP_SUFFIX = '.tmp';

/** Temp files are dot-prefixed so node-persist's directory scan ignores them. */
function tempPathFor(file: string): string {
  return path.join(path.dirname(file), `.${path.basename(file)}.${process.pid}${TMP_SUFFIX}`);
}

/**
 * Delete files that node-persist would choke on: empty, unparseable, or
 * missing the `key` property it identifies entries by. Abandoned temp files
 * from a previous crash go too.
 */
function sweepCorruptFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];

  const removed: string[] = [];
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name);
    const isLeftoverTemp = name.startsWith('.') && name.endsWith(TMP_SUFFIX);

    if (name.startsWith('.') && !isLeftoverTemp) continue;

    if (!isLeftoverTemp) {
      try {
        if (!fs.statSync(file).isFile()) continue;
        const content = JSON.parse(fs.readFileSync(file, 'utf-8'));
        if (content && content.key) continue;
      } catch {
        // Unreadable or invalid JSON — falls through to removal.
      }
    }

    try {
      fs.unlinkSync(file);
      removed.push(name);
    } catch (err) {
      console.warn(`[MatchStore] Could not remove corrupt file ${name}:`, err);
    }
  }
  return removed;
}

/**
 * Replace node-persist's `fs.writeFile` with a write to a temp file followed by
 * a rename. rename(2) is atomic within a directory, so a reader (or a crash)
 * can only ever observe the old or the new file, never a half-written one.
 */
function makeWritesAtomic(storage: any): void {
  storage.writeFile = async function (file: string, content: unknown) {
    const tmp = tempPathFor(file);
    try {
      await fs.promises.writeFile(tmp, this.stringify(content), this.options.encoding);
      await fs.promises.rename(tmp, file);
    } catch (err) {
      await fs.promises.unlink(tmp).catch(() => { /* already gone */ });
      throw err;
    }
    return { file, content };
  };
}
