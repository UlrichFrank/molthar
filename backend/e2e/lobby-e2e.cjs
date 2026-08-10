/**
 * End-to-end reliability loop for lobby → waiting room → running game.
 *
 * Drives the real HTTP lobby API and real boardgame.io socket clients, exactly
 * the way the browser does, so the things that broke in production are the
 * things under test:
 *
 *   A  handy-pc     Device A creates a match, device B must SEE and join it.
 *   B  npc          A match with NPC seats must fill itself and the NPC must play.
 *   C  mixed        Two humans + an NPC — nobody may take the NPC's seat.
 *   D  corruption   A truncated storage file must not take the lobby down.
 *
 * Usage (server must be running):
 *   node e2e/lobby-e2e.cjs                 # 3 rounds of every scenario
 *   RUNS=10 node e2e/lobby-e2e.cjs         # 10 rounds
 *   ONLY=npc node e2e/lobby-e2e.cjs        # one scenario
 *   SERVER=http://host:3001 node e2e/...   # against another server
 */

const fs = require('fs');
const path = require('path');
const { LobbyClient, Client } = require('boardgame.io/client');
const { SocketIO } = require('boardgame.io/multiplayer');
const { PortaleVonMolthar } = require('@portale-von-molthar/shared');
const { createBot } = require('../dist/bots/index');

const SERVER = process.env.SERVER || 'http://127.0.0.1:3001';
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const GAME = PortaleVonMolthar.name;

/** How long a match may sit in the waiting room before we call it hung. */
const JOIN_TIMEOUT_MS = 30000;
/** How long the whole board may go without any move before we call it stalled. */
const STALL_TIMEOUT_MS = 45000;
const GAME_TIMEOUT_MS = 300000;

const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

// ---------------------------------------------------------------------------
// Frontend replicas — must mirror game-web/src/lobby
// ---------------------------------------------------------------------------

/** useLobbyClient.freeHumanSlots */
function freeHumanSlots(match) {
  const npcIndices = new Set((match.setupData?.npcSlots ?? []).map(s => s.playerIndex));
  return match.players.filter(p => p.name === undefined && !npcIndices.has(p.id));
}

/** LobbyScreen.loadMatches */
async function listOpenMatches(lobby) {
  const { matches } = await lobby.listMatches(GAME);
  return matches.filter(m => freeHumanSlots(m).length > 0);
}

/** WaitingRoom polling */
async function waitForAllJoined(lobby, matchID, timeoutMs = JOIN_TIMEOUT_MS) {
  const t0 = Date.now();
  let seats = '?';
  while (Date.now() - t0 < timeoutMs) {
    const match = await lobby.getMatch(GAME, matchID);
    const joined = match.players.filter(p => p.name !== undefined).length;
    seats = match.players.map(p => p.name ?? '—').join(', ');
    if (joined >= match.players.length) return { ok: true, seats };
    await sleep(500);
  }
  return { ok: false, detail: `Warteraum hängt nach ${timeoutMs}ms bei [${seats}]` };
}

// ---------------------------------------------------------------------------
// A human seat, driven by bot logic so games actually reach gameover
// ---------------------------------------------------------------------------

function connectSeat(matchID, playerID, credentials) {
  const client = Client({
    game: PortaleVonMolthar,
    multiplayer: SocketIO({ server: SERVER }),
    matchID, playerID, credentials, debug: false,
  });
  client.start();
  return client;
}

/**
 * Play out a match. `seats` are the human-controlled clients; NPC seats are
 * driven by the server-side BotRunner and only observed here.
 */
async function playMatch(seats, matchID) {
  const strategy = createBot('efficient');
  const t0 = Date.now();
  let lastProgress = Date.now();
  let lastSignature = null;
  const movesBySeat = {};
  const npcMoves = {};
  // Moves are confirmed by the server, so a seat must wait for the state to
  // actually change before deciding again — otherwise it re-sends a move it
  // has already made and the server rejects the duplicate.
  let dispatchedAt = 0;
  let dispatchedSignature = null;

  const observer = seats[0].client;

  return await new Promise(resolve => {
    const finish = r => { clearInterval(iv); resolve(r); };

    const tick = async () => {
      const st = observer.getState();
      if (!st) return;
      const { G, ctx } = st;

      if (ctx.gameover) {
        return finish({ ok: true, matchID, movesBySeat, npcMoves, gameover: ctx.gameover });
      }

      // Any change in turn / action counters counts as forward progress.
      const signature = `${ctx.currentPlayer}|${ctx.turn}|${G.actionCount}|${G.roundNumber}`;
      if (signature !== lastSignature) {
        if (lastSignature !== null) {
          const prevPlayer = lastSignature.split('|')[0];
          if (!seats.some(s => s.playerID === prevPlayer)) {
            npcMoves[prevPlayer] = (npcMoves[prevPlayer] ?? 0) + 1;
          }
        }
        lastSignature = signature;
        lastProgress = Date.now();
      }

      if (Date.now() - lastProgress > STALL_TIMEOUT_MS) {
        const owner = seats.some(s => s.playerID === ctx.currentPlayer) ? 'Mensch' : 'NPC';
        return finish({
          ok: false, step: 'stall', matchID,
          detail: `${STALL_TIMEOUT_MS / 1000}s ohne Fortschritt — ${owner} ${ctx.currentPlayer} ist am Zug ` +
            `(Aktion ${G.actionCount}/${G.maxActions}, Runde ${G.roundNumber}, ` +
            `handDiscard=${!!G.requiresHandDiscard}, returnPearl=${!!G.pendingReturnPearl}); ` +
            `NPC-Züge bisher: ${JSON.stringify(npcMoves)}`,
        });
      }

      if (Date.now() - t0 > GAME_TIMEOUT_MS) {
        return finish({ ok: false, step: 'timeout', matchID,
          detail: `Partie nicht beendet in ${GAME_TIMEOUT_MS / 1000}s` });
      }

      const seat = seats.find(s => s.playerID === ctx.currentPlayer);
      if (!seat) return;

      // Wait for our previous move to land; retry only if it clearly did not.
      if (signature === dispatchedSignature && Date.now() - dispatchedAt < 2000) return;

      try {
        const cur = seat.client.getState();
        if (!cur || cur.ctx.currentPlayer !== seat.playerID || cur.ctx.gameover) return;
        dispatchedSignature = signature;
        dispatchedAt = Date.now();
        applySeatMove(seat, cur.G, cur.ctx, strategy);
        movesBySeat[seat.playerID] = (movesBySeat[seat.playerID] ?? 0) + 1;
      } catch (err) {
        return finish({ ok: false, step: 'move-error', matchID,
          detail: `Zug von Sitz ${seat.playerID} warf: ${err && err.message}` });
      }
    };

    const iv = setInterval(() => { tick().catch(() => {}); }, 150);
  });
}

/**
 * Mirrors BotRunner.onStateChange: the strategies assume they are only asked
 * for a move while actions remain and while no forced discard is pending.
 */
function applySeatMove(seat, G, ctx, strategy) {
  const { client, playerID } = seat;

  // Order matters and mirrors BotRunner: a forced discard blocks every other
  // move, including endTurn, so it has to be resolved before anything else.
  if (G.requiresHandDiscard) {
    const excess = G.excessCardCount ?? 0;
    const indices = G.players[playerID].hand
      .map((c, i) => ({ v: c.value, i }))
      .sort((a, b) => a.v - b.v)
      .slice(0, excess)
      .map(x => x.i);
    client.moves.discardCardsForHandLimit(indices);
    return;
  }

  if (G.actionCount >= G.maxActions) {
    client.moves.endTurn();
    return;
  }

  const decision = strategy(G, ctx, playerID);
  if ('event' in decision) client.events[decision.event]();
  else client.moves[decision.move](...decision.args);
}

// ---------------------------------------------------------------------------
// Scenarios
// ---------------------------------------------------------------------------

async function scenarioHandyPc(run) {
  const phone = new LobbyClient({ server: SERVER });
  const pc = new LobbyClient({ server: SERVER });

  const { matchID } = await phone.createMatch(GAME, {
    numPlayers: 2, setupData: { withSpecialCards: false, npcSlots: [] },
  });
  const a = await phone.joinMatch(GAME, matchID, { playerID: '0', playerName: `Handy${run}` });

  let seen = false;
  for (let i = 0; i < 12 && !seen; i++) {
    seen = (await listOpenMatches(pc)).some(m => m.matchID === matchID);
    if (!seen) await sleep(500);
  }
  if (!seen) {
    return { ok: false, step: 'nicht-sichtbar',
      detail: `Partie ${matchID} taucht am zweiten Gerät nicht unter "Offene Spiele" auf` };
  }

  const b = await pc.joinMatch(GAME, matchID, { playerID: '1', playerName: `PC${run}` });
  const joined = await waitForAllJoined(pc, matchID);
  if (!joined.ok) return { ok: false, step: 'warteraum', detail: joined.detail };

  const seats = [
    { playerID: '0', client: connectSeat(matchID, '0', a.playerCredentials) },
    { playerID: '1', client: connectSeat(matchID, '1', b.playerCredentials) },
  ];
  const result = await playMatch(seats, matchID);
  seats.forEach(s => { try { s.client.stop(); } catch {} });
  return result;
}

async function scenarioNpc(run, { numPlayers = 2, humans = 1, strategies = ['efficient'] } = {}) {
  const lobby = new LobbyClient({ server: SERVER });
  const npcSlots = strategies.map((strategy, i) => ({
    playerIndex: humans + i, strategy, name: `NPC-${strategy}`,
  }));

  const { matchID } = await lobby.createMatch(GAME, {
    numPlayers, setupData: { withSpecialCards: false, npcSlots },
  });

  const seats = [];
  for (let i = 0; i < humans; i++) {
    const cred = await lobby.joinMatch(GAME, matchID, {
      playerID: String(i), playerName: `Mensch${run}-${i}`,
    });
    seats.push({ playerID: String(i), credentials: cred.playerCredentials });
  }

  // No human may be offered an NPC seat while the BotRunner is still joining.
  const listed = (await lobby.listMatches(GAME)).matches.find(m => m.matchID === matchID);
  const offered = listed ? freeHumanSlots(listed).map(p => p.id) : [];
  const npcIndices = npcSlots.map(s => s.playerIndex);
  const stolen = offered.filter(id => npcIndices.includes(id));
  if (stolen.length > 0) {
    return { ok: false, step: 'npc-sitz-angeboten',
      detail: `Sitz(e) ${stolen.join(',')} sind für NPCs reserviert, werden Menschen aber zum Beitritt angeboten` };
  }

  const joined = await waitForAllJoined(lobby, matchID);
  if (!joined.ok) return { ok: false, step: 'npc-warteraum', detail: joined.detail, matchID };

  const connected = seats.map(s => ({ playerID: s.playerID, client: connectSeat(matchID, s.playerID, s.credentials) }));
  const result = await playMatch(connected, matchID);
  connected.forEach(s => { try { s.client.stop(); } catch {} });

  if (result.ok) {
    const npcTurns = Object.values(result.npcMoves).reduce((a, b) => a + b, 0);
    if (npcTurns === 0) {
      return { ok: false, step: 'npc-untätig', matchID,
        detail: 'Partie beendet, aber der NPC hat keinen einzigen Zug gemacht' };
    }
    result.npcTurns = npcTurns;
  }
  return result;
}

/**
 * Reproduces the production outage of 2026-08-09: a container killed mid-write
 * left a 0-byte file in the data dir, and every lobby request answered 500 from
 * then on — no open games, no NPC, every waiting room hung.
 */
async function scenarioCorruption() {
  if (!fs.existsSync(DATA_DIR)) {
    return { ok: false, step: 'setup', detail: `DATA_DIR ${DATA_DIR} existiert nicht` };
  }
  const lobby = new LobbyClient({ server: SERVER });
  const planted = [
    ['zero-byte', ''],
    ['not-json', 'garbage'],
    ['json-without-key', '{"value":1}'],
  ].map(([label, content], i) => {
    const file = path.join(DATA_DIR, `e2ecorrupt${i}${'0'.repeat(27)}`.slice(0, 32));
    fs.writeFileSync(file, content);
    return { label, file };
  });

  try {
    const { matchID } = await lobby.createMatch(GAME, {
      numPlayers: 2, setupData: { withSpecialCards: false, npcSlots: [] },
    });
    await lobby.joinMatch(GAME, matchID, { playerID: '0', playerName: 'Korrupt' });

    const open = await listOpenMatches(lobby);
    if (!open.some(m => m.matchID === matchID)) {
      return { ok: false, step: 'lobby-tot',
        detail: 'Beschädigte Datei im data-Verzeichnis blockiert die Spieleliste' };
    }
    return { ok: true, planted: planted.length };
  } catch (err) {
    return { ok: false, step: 'lobby-tot',
      detail: `Spieleliste wirft bei beschädigter Datei: ${err && err.message}` };
  } finally {
    for (const { file } of planted) { try { fs.unlinkSync(file); } catch {} }
  }
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

const SCENARIOS = {
  handy: { label: 'A Handy→PC  ', run: r => scenarioHandyPc(r) },
  npc: { label: 'B NPC 1v1   ', run: r => scenarioNpc(r) },
  mixed: { label: 'C 2M+1NPC   ', run: r => scenarioNpc(r, { numPlayers: 3, humans: 2, strategies: ['aggressive'] }) },
  corrupt: { label: 'D Korruption', run: () => scenarioCorruption() },
};

async function main() {
  const runs = parseInt(process.env.RUNS || '3', 10);
  const only = process.env.ONLY;
  const names = only ? only.split(',').map(s => s.trim()) : Object.keys(SCENARIOS);

  for (const n of names) {
    if (!SCENARIOS[n]) {
      console.error(`Unbekanntes Szenario "${n}". Verfügbar: ${Object.keys(SCENARIOS).join(', ')}`);
      process.exit(2);
    }
  }

  const failures = [];
  for (let run = 1; run <= runs; run++) {
    for (const name of names) {
      const { label, run: exec } = SCENARIOS[name];
      let r;
      try {
        r = await exec(run);
      } catch (err) {
        r = { ok: false, step: 'exception', detail: (err && err.stack) || String(err) };
      }
      log(`Lauf ${run}  ${label}  ${r.ok ? `OK${summarise(r)}` : `FEHLER [${r.step}] ${r.detail}`}`);
      if (!r.ok) failures.push({ run, name, ...r });
    }
  }

  const total = runs * names.length;
  log(`\n=== ${total - failures.length}/${total} bestanden ===`);
  for (const f of failures) log(`  ✗ Lauf ${f.run} ${f.name}: [${f.step}] ${f.detail}`);
  process.exit(failures.length ? 1 : 0);
}

function summarise(r) {
  if (r.gameover) {
    const winner = r.gameover.ranking?.[0];
    const npc = r.npcTurns != null ? `, NPC-Züge ${r.npcTurns}` : '';
    return ` — Sieger ${winner?.name} (${winner?.powerPoints} Punkte)${npc}`;
  }
  if (r.planted) return ` — ${r.planted} beschädigte Dateien überstanden`;
  return '';
}

main().catch(err => { console.error('HARNESS-FEHLER', err); process.exit(2); });
