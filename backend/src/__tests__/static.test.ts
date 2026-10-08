import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, join } from 'path';
import { Server } from 'boardgame.io/server';
import { PortaleVonMolthar } from '@portale-von-molthar/shared';
import { serveStatic } from '../staticFiles';

// A real boardgame.io server with the static middleware in front of the
// lobby router, serving a small fake page build from a temp directory.
const PORT = 39000 + Math.floor(Math.random() * 900);
const base = `http://127.0.0.1:${PORT}`;
const GAME = PortaleVonMolthar.name;
let server: ReturnType<typeof Server>;
let running: Awaited<ReturnType<ReturnType<typeof Server>['run']>>;

beforeAll(async () => {
  const dir = mkdtempSync(join(tmpdir(), 'molthar-static-'));
  const files: Record<string, string> = {
    '/index.html': '<!doctype html><title>Molthar</title>',
    '/assets/index-AbC123xy.js': "console.log('game')",
    '/assets/Charakterkarte Hinten.png': 'PNG',
    '/assets/cards.json': '[]',
  };
  const assets: Record<string, string> = {};
  for (const [url, content] of Object.entries(files)) {
    const path = join(dir, url);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, content);
    assets[url] = path;
  }
  server = Server({ games: [PortaleVonMolthar], origins: [] });
  server.app.use(serveStatic(assets) as never);
  running = await server.run(PORT);
});

afterAll(() => {
  server.kill(running);
});

describe('serveStatic', () => {
  it('serves index.html at /', async () => {
    const res = await fetch(`${base}/`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(res.headers.get('cache-control')).toBe('no-cache');
    expect(await res.text()).toContain('<title>Molthar</title>');
  });

  it('serves hashed bundles as immutable', async () => {
    const res = await fetch(`${base}/assets/index-AbC123xy.js`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/javascript');
    expect(res.headers.get('cache-control')).toContain('immutable');
  });

  it('serves card images with spaces in their names', async () => {
    const res = await fetch(`${base}/assets/Charakterkarte%20Hinten.png`);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toBe('image/png');
    expect(res.headers.get('cache-control')).toBe('public, max-age=86400');
  });

  it('serves cards.json uncached', async () => {
    const res = await fetch(`${base}/assets/cards.json`);
    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toBe('no-cache');
    expect(await res.json()).toEqual([]);
  });

  it('falls back to the page for routes without extension', async () => {
    const res = await fetch(`${base}/lobby/abc`);
    expect(res.status).toBe(200);
    expect(await res.text()).toContain('<title>Molthar</title>');
  });

  it('answers HEAD', async () => {
    const res = await fetch(`${base}/`, { method: 'HEAD' });
    expect(res.status).toBe(200);
  });

  it('returns 404 for a missing file', async () => {
    const res = await fetch(`${base}/assets/gibtsnicht.png`);
    expect(res.status).toBe(404);
  });

  it('leaves the lobby API alone', async () => {
    const list = await fetch(`${base}/games`);
    expect(list.status).toBe(200);
    expect(await list.json()).toEqual([GAME]);

    const missing = await fetch(`${base}/games/${GAME}/gibtsnicht`);
    expect(missing.status).toBe(404);
    expect(await missing.text()).not.toContain('<title>');
  });
});
