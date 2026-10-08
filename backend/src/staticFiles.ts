/**
 * Serves the game page (frontend build embedded into the single binary) from
 * the boardgame.io server, so page, lobby API and Socket.IO share one origin.
 *
 * Registered before the lobby router:
 * - GET/HEAD of an embedded file → the file
 * - any other GET/HEAD path without a file extension → index.html (the page
 *   handles its own routes); a missing path *with* extension stays a 404
 * - /games and /games/... → untouched, the lobby API answers as before
 * Socket.IO requests never reach Koa: engine.io handles /socket.io/ first.
 *
 * With an empty manifest (development, where Vite serves the page) the
 * middleware does nothing.
 */
import { promises as fs } from 'fs';
import { extname } from 'path';

/** Minimal Koa context — Koa itself is only a transitive dependency. */
export interface StaticContext {
  method: string;
  path: string;
  status: number;
  body: unknown;
  type: string;
  set(field: string, value: string): void;
}

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

/** Vite's hashed bundles (`/assets/index-AbC123xy.js`) never change under the same name. */
const IMMUTABLE = 'public, max-age=31536000, immutable';
/** Card images keep their names across releases but rarely change. */
const ONE_DAY = 'public, max-age=86400';
/** index.html and cards.json must be fresh after every deploy. */
const REVALIDATE = 'no-cache';

const HASHED_BUNDLE = /^\/assets\/[^/]+-[\w-]{8,}\.(js|css)$/;
const IMAGE = /\.(png|jpe?g|webp|svg|ico)$/i;

function isApiPath(path: string): boolean {
  return path === '/games' || path.startsWith('/games/');
}

function cacheControl(urlPath: string): string {
  if (HASHED_BUNDLE.test(urlPath)) return IMMUTABLE;
  if (IMAGE.test(urlPath)) return ONE_DAY;
  return REVALIDATE;
}

/** Card images have spaces in their names ("Charakterkarte Hinten.png"). */
function decodePath(path: string): string | null {
  try {
    return decodeURIComponent(path);
  } catch {
    return null;
  }
}

/**
 * @param assets   URL path → readable file path (see embedded/assets.ts)
 * @param readFile reads a file completely (injectable for tests)
 */
export function serveStatic(
  assets: Record<string, string>,
  readFile: (path: string) => Promise<Uint8Array> = path => fs.readFile(path),
) {
  const cache = new Map<string, Uint8Array>();
  const hasPage = '/index.html' in assets;

  const load = async (urlPath: string) => {
    let data = cache.get(urlPath);
    if (!data) {
      data = await readFile(assets[urlPath]);
      cache.set(urlPath, data);
    }
    return data;
  };

  return async (ctx: StaticContext, next: () => Promise<unknown>): Promise<unknown> => {
    if (!hasPage || (ctx.method !== 'GET' && ctx.method !== 'HEAD') || isApiPath(ctx.path)) {
      return next();
    }

    let urlPath = ctx.path === '/' ? '/index.html' : decodePath(ctx.path);
    if (urlPath === null) return next();
    if (!(urlPath in assets)) {
      // Unknown file → 404 from the router; unknown page route → the page
      if (extname(urlPath) !== '') return next();
      urlPath = '/index.html';
    }

    ctx.status = 200;
    ctx.type = CONTENT_TYPES[extname(urlPath).toLowerCase()] ?? 'application/octet-stream';
    ctx.set('Cache-Control', cacheControl(urlPath));
    ctx.body = Buffer.from(await load(urlPath));
    return undefined;
  };
}
