import { Server, Origins } from 'boardgame.io/server';
import { PortaleVonMolthar } from '@portale-von-molthar/shared';
import { BotRunner } from './bot-runner';
import { MatchStore } from './matchStore';
import { patchWsTextFrames } from './wsTextFrames';
import { serveStatic } from './staticFiles';
import { assets } from './embedded/assets';

/**
 * boardgame.io Server for Portale von Molthar
 *
 * This replaces the custom REST API server with a proper boardgame.io server
 * that handles:
 * - State management across clients
 * - Move validation and execution
 * - Multiplayer synchronization via Socket.IO
 * - Lobby API for creating/joining games
 */

const PORT = parseInt(process.env.PORT || '3001', 10);
// Bind address; unset = all interfaces (development). In production the
// service listens on 127.0.0.1 only, where Traefik reaches it.
const HOST = process.env.HOST || undefined;
const MATCH_TTL_DAYS = parseInt(process.env.MATCH_TTL_DAYS || '1', 10);
const MATCHES_DIR = process.env.MATCHES_DIR || './data';

// The in-process NPC clients connect to the address the server listens on;
// a wildcard bind is reachable via loopback.
const isWildcard = !HOST || HOST === '0.0.0.0' || HOST === '::';
const SELF_URL = `http://${isWildcard ? '127.0.0.1' : HOST.includes(':') ? `[${HOST}]` : HOST}:${PORT}`;

// Under Bun (single binary) WebSockets only work with this patch; it must be
// applied before the server creates its socket.io instance.
if (typeof (globalThis as { Bun?: unknown }).Bun !== 'undefined') {
  patchWsTextFrames();
}

const server = Server({
  games: [PortaleVonMolthar],
  db: new MatchStore({ dir: MATCHES_DIR, ttlDays: MATCH_TTL_DAYS }),

  origins: [
    // Allow frontend to connect (dev server)
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://[::1]:5173',
    // Allow frontend served via Docker/nginx on port 80
    'http://localhost',
    'http://localhost:80',
    'http://127.0.0.1',
    'http://127.0.0.1:80',
    // Allow localhost in development
    Origins.LOCALHOST_IN_DEVELOPMENT,
    // Additional origins from environment variable (comma-separated)
    // e.g. EXTRA_ORIGINS=http://192.168.1.100,http://mein-nas.local
    ...( process.env.EXTRA_ORIGINS
      ? process.env.EXTRA_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
      : []
    ),
  ],
});

// Game page embedded into the single binary (empty in development — Vite
// serves it). Registered before run() adds the lobby router, so it goes first.
server.app.use(serveStatic(assets) as never);

// server.run() only passes the port to listen(); add the bind address
if (HOST) {
  const listen = server.app.listen.bind(server.app) as (...args: unknown[]) => unknown;
  (server.app as unknown as { listen: (...args: unknown[]) => unknown }).listen =
    (port: unknown, ...rest: unknown[]) => listen(port, HOST, ...rest);
}

server.run(PORT, () => {
  console.log(`🚀 Portale von Molthar server running on ${HOST ?? '*'}:${PORT}`);
  console.log(`📋 Lobby API: ${SELF_URL}/games/${PortaleVonMolthar.name}`);
  console.log(`💾 Matches: ${MATCHES_DIR}`);
  if (Object.keys(assets).length > 0) {
    console.log(`🖼️  Game page: ${Object.keys(assets).length} embedded files`);
  } else {
    console.log(`🔗 Frontend: http://127.0.0.1:5173`);
  }

  // Start NPC bot runner after a short delay to let the server fully initialise
  const botRunner = new BotRunner(SELF_URL);
  setTimeout(() => {
    botRunner.start().catch((err: unknown) => {
      console.error('[BotRunner] Failed to start:', err);
    });
    console.log(`🤖 BotRunner started`);
  }, 2000);
});
