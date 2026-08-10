/**
 * BotRunner — manages bot clients for NPC players in active matches.
 *
 * Flow:
 * 1. Server calls BotRunner.scanAndAttach() on startup to reconnect bots for existing matches.
 * 2. Polling (every 5s) detects new matches with npcSlots in setupData.
 * 3. For each NPC slot: join the match slot, store credentials, start a bot Client.
 * 4. On each turn change: wait 1–2.5s, call the strategy, dispatch the move.
 * 5. On gameover: stop and clean up all bot clients for that match.
 */

import { Client } from 'boardgame.io/client';
import { SocketIO } from 'boardgame.io/multiplayer';
import { LobbyClient } from 'boardgame.io/client';
import { PortaleVonMolthar, canPayCard } from '@portale-von-molthar/shared';
import type { NpcSlotConfig } from '@portale-von-molthar/shared';
import { createBot } from './bots/index';
import type { BotStrategyFn } from './bots/index';
import * as fs from 'fs';
import * as path from 'path';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BotClient {
  playerID: string;
  strategy: BotStrategyFn;
  client: ReturnType<typeof Client>;
  unsubscribe: (() => void) | null;
  isThinking: boolean;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  /** `_stateID` the last dispatched move was based on — used to spot rejections. */
  lastDispatchStateID: number | null;
  /** Consecutive moves the server refused. Resets as soon as one lands. */
  rejectedMoves: number;
  /** When `isThinking` was set, so a stuck flag can be broken open. */
  thinkingSince: number | null;
}

/**
 * A bot that stays "thinking" this long is not thinking, it is wedged. Nothing
 * else can move while it holds the turn, so the flag gets cleared and the bot
 * is asked again. Comfortably above the longest real think delay (2.5s).
 */
const MAX_THINKING_MS = 15000;

interface MatchBots {
  bots: BotClient[];
  /** Slots this match needs filled — kept so a partial attach can be retried. */
  npcSlots: NpcSlotConfig[];
}

// ---------------------------------------------------------------------------
// Credentials persistence
// ---------------------------------------------------------------------------

/**
 * A bot can only move in a seat it already holds by presenting the credential
 * it got when joining — re-joining is impossible once the seat is taken. So
 * this file has to outlive the container, which means it must sit on a mounted
 * volume (see NPC_DATA_DIR in docker-compose). Lose it and every running match
 * with an NPC is stuck on that NPC's turn forever.
 */
const CREDS_FILE = path.join(
  process.env.NPC_DATA_DIR || path.join(__dirname, '..', 'data-npc'),
  'credentials.json',
);

function loadCredentials(): Record<string, string> {
  try {
    if (fs.existsSync(CREDS_FILE)) {
      return JSON.parse(fs.readFileSync(CREDS_FILE, 'utf-8')) as Record<string, string>;
    }
  } catch {
    // ignore — start fresh
  }
  return {};
}

function saveCredentials(creds: Record<string, string>): void {
  try {
    fs.mkdirSync(path.dirname(CREDS_FILE), { recursive: true });
    fs.writeFileSync(CREDS_FILE, JSON.stringify(creds, null, 2), 'utf-8');
  } catch {
    // non-fatal
  }
}

// ---------------------------------------------------------------------------
// BotRunner
// ---------------------------------------------------------------------------

export class BotRunner {
  private activeMatches = new Map<string, MatchBots>();
  private lobbyClient: LobbyClient;
  private serverUrl: string;
  private credentials: Record<string, string>;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private watchdogTimer: ReturnType<typeof setInterval> | null = null;
  private scanFailing = false;
  /** Matches whose bots were torn down on gameover — never re-attach to those. */
  private finishedMatches = new Set<string>();

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
    this.lobbyClient = new LobbyClient({ server: serverUrl });
    this.credentials = loadCredentials();
  }

  /** Called once after server start. Reconnects bots for persisted matches and starts polling. */
  async start(): Promise<void> {
    await this.scanAndAttach();
    this.pollTimer = setInterval(() => {
      this.scanAndAttach().catch(err => console.error('[BotRunner] Scan failed:', err));
    }, 5000);
    this.watchdogTimer = setInterval(() => this.pokeStalledBots(), 3000);
  }

  /**
   * Bots normally act from the client subscription — but that only fires when
   * the state actually changes. A move the server refuses changes nothing, so
   * without this the bot would sit on its turn forever and the humans would
   * wait for a player that is never going to move again.
   */
  private pokeStalledBots(): void {
    for (const [matchID, { bots }] of [...this.activeMatches]) {
      for (const bot of bots) {
        const state = (bot.client as any).store?.getState();
        if (!state || state.ctx?.gameover) continue;
        if (state.ctx?.currentPlayer !== bot.playerID) continue;

        if (bot.isThinking) {
          const thinkingFor = Date.now() - (bot.thinkingSince ?? Date.now());
          if (thinkingFor < MAX_THINKING_MS) continue;
          console.warn(
            `[BotRunner] ${bot.playerID} stuck mid-move for ${Math.round(thinkingFor / 1000)}s — resetting.`,
          );
          bot.isThinking = false;
          bot.thinkingSince = null;
        }

        if (bot.lastDispatchStateID !== null && state._stateID === bot.lastDispatchStateID) {
          bot.rejectedMoves++;
        }
        this.onStateChange(matchID, bot);
      }
    }
  }

  stop(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
    if (this.watchdogTimer) clearInterval(this.watchdogTimer);
    for (const [matchID] of [...this.activeMatches]) {
      this.detachMatch(matchID, { finished: false });
    }
  }

  /** Scan all open matches and attach bots to any that have npcSlots. */
  async scanAndAttach(): Promise<void> {
    let matches;
    try {
      ({ matches } = await this.lobbyClient.listMatches(PortaleVonMolthar.name));
    } catch (err) {
      // A permanently failing lobby endpoint means no NPC ever joins and every
      // waiting room hangs — too important to swallow, too noisy to log on
      // every 5s poll, so it is logged on state change only.
      this.reportScanResult(err);
      return;
    }
    this.reportScanResult(null);

    for (const match of matches) {
      if ((match as any).gameover) continue;
      if (this.finishedMatches.has(match.matchID)) continue;

      const npcSlots = (match.setupData as any)?.npcSlots as NpcSlotConfig[] | undefined;
      if (!npcSlots?.length) continue;

      await this.attachMatch(match.matchID, npcSlots, match.players);
    }
  }

  /**
   * Join NPC slots and start bot clients for a match. Safe to call repeatedly:
   * slots whose join failed last time are retried on the next scan, so one
   * failed join cannot leave a match short a player forever.
   */
  async attachMatch(
    matchID: string,
    npcSlots: NpcSlotConfig[],
    seats?: { id: number; name?: string }[],
  ): Promise<void> {
    const entry = this.activeMatches.get(matchID) ?? { bots: [], npcSlots };
    const attached = new Set(entry.bots.map(b => b.playerID));

    for (const slot of npcSlots) {
      const playerID = String(slot.playerIndex);
      if (attached.has(playerID)) continue;

      const credKey = `${matchID}:${playerID}`;
      // A credential is only good for a seat we actually hold. If the seat is
      // still empty, a leftover credential is stale (e.g. carried over from a
      // container that never completed the join) and every move made with it
      // would be rejected — so drop it and join properly.
      const seatIsEmpty = seats?.find(p => p.id === slot.playerIndex)?.name === undefined;
      if (seatIsEmpty && this.credentials[credKey]) {
        delete this.credentials[credKey];
      }

      let credentials = this.credentials[credKey];

      if (!credentials) {
        try {
          const result = await this.lobbyClient.joinMatch(PortaleVonMolthar.name, matchID, {
            playerID,
            playerName: slot.name,
          });
          credentials = result.playerCredentials;
          this.credentials[credKey] = credentials;
          saveCredentials(this.credentials);
        } catch (err) {
          console.warn(`[BotRunner] Could not join slot ${playerID} of match ${matchID}, retrying:`, err);
          continue;
        }
      }

      entry.bots.push(this.startBotClient(matchID, playerID, credentials, slot));
    }

    if (entry.bots.length > 0) {
      this.activeMatches.set(matchID, entry);
    }
  }

  /** Log lobby-scan health, but only when it changes, to keep the log readable. */
  private reportScanResult(err: unknown): void {
    if (err && !this.scanFailing) {
      this.scanFailing = true;
      console.error('[BotRunner] Lobby scan failing — NPCs cannot join matches:', err);
    } else if (!err && this.scanFailing) {
      this.scanFailing = false;
      console.log('[BotRunner] Lobby scan recovered.');
    }
  }

  private startBotClient(
    matchID: string,
    playerID: string,
    credentials: string,
    slot: NpcSlotConfig,
  ): BotClient {
    const strategyFn = createBot(slot.strategy);

    const client = Client({
      game: PortaleVonMolthar,
      multiplayer: SocketIO({ server: this.serverUrl }),
      matchID,
      playerID,
      credentials,
      debug: false,
    });

    const botClient: BotClient = {
      playerID,
      strategy: strategyFn,
      client,
      unsubscribe: null,
      isThinking: false,
      reconnectTimer: null,
      lastDispatchStateID: null,
      rejectedMoves: 0,
      thinkingSince: null,
    };

    client.start();

    const unsubscribe = client.subscribe(() => {
      this.onStateChange(matchID, botClient);
    });

    botClient.unsubscribe = unsubscribe;
    return botClient;
  }

  private onStateChange(matchID: string, bot: BotClient): void {
    if (bot.isThinking) return;

    const state = (bot.client as any).store?.getState();
    if (!state) return;

    const { G, ctx } = state as { G: any; ctx: any };

    // Match ended — clean up
    if (ctx?.gameover) {
      this.detachMatch(matchID);
      return;
    }

    // Not our turn
    if (ctx?.currentPlayer !== bot.playerID) return;

    // The board moved on since our last dispatch, so that move was accepted.
    if (bot.lastDispatchStateID !== null && state._stateID !== bot.lastDispatchStateID) {
      bot.rejectedMoves = 0;
    }

    // A pending discard blocks every other move, endTurn included, so it has to
    // be resolved first. `excess` can only be 0 here if the flag is stale — then
    // discarding nothing clears it rather than leaving the turn wedged.
    if (G?.requiresHandDiscard) {
      const excess: number = G.excessCardCount ?? 0;
      const player = G.players?.[bot.playerID];
      if (!player) return;

      // Discard lowest-value cards
      const sortedIndices = [...player.hand]
        .map((c: any, i: number) => ({ value: c.value as number, i }))
        .sort((a: any, b: any) => a.value - b.value)
        .slice(0, excess)
        .map((x: any) => x.i as number);

      this.think(matchID, bot, randomDelay(800, 1500), currentState => {
        if (!currentState.G?.requiresHandDiscard) return;
        bot.lastDispatchStateID = currentState._stateID ?? null;
        (bot.client as any).moves?.discardCardsForHandLimit?.(sortedIndices);
      });
      return;
    }

    // Execute strategy
    const delayMs = G?.actionCount === 0 ? randomDelay(1000, 2500) : randomDelay(800, 1500);

    this.think(matchID, bot, delayMs, currentState => {
      const { G: currentG, ctx: currentCtx } = currentState as { G: any; ctx: any };
      if (currentCtx?.currentPlayer !== bot.playerID || currentCtx?.gameover) return;

      if (currentG?.actionCount >= currentG?.maxActions) {
        bot.lastDispatchStateID = currentState._stateID ?? null;
        (bot.client as any).moves?.endTurn?.();
        return;
      }

      // --- NPC DEBUG LOG ---
      const dbgPlayer = currentG?.players?.[bot.playerID];
      if (dbgPlayer) {
        const diamonds = (dbgPlayer.diamondCards as any[]).length;
        const hand = (dbgPlayer.hand as any[]).map((p: any) => String(p.value)).join('  ') || '–';
        const auslage = (currentG.pearlSlots as any[]).map((p: any) => p ? String(p.value) : '–').join('  ');
        const portalLines = (dbgPlayer.portal as any[]).map((entry: any) => {
          const payable = canPayCard(entry.card, dbgPlayer.hand, diamonds);
          const cost = formatCost(entry.card.cost);
          const pad = ' '.repeat(Math.max(0, 22 - entry.card.name.length));
          return `  ${entry.card.name}${pad}(${entry.card.powerPoints}pts)  [${cost}]  → ${payable ? 'JA' : 'NEIN'}`;
        });
        const sep = '─'.repeat(52);
        console.log(
          `${sep}\n` +
          `${dbgPlayer.name}  |  Aktion ${currentG.actionCount as number}/${currentG.maxActions as number}\n` +
          `  Hand: ${hand}    Auslage: ${auslage}   ◆${diamonds}\n` +
          (portalLines.length ? portalLines.join('\n') : '  Portal: (leer)'),
        );
      }
      // --- END DEBUG LOG ---

      // After three refused moves in a row the strategy is clearly stuck on this
      // position. Ending the turn is always legal and hands play back to the
      // humans — far better than sitting on the turn forever.
      const decision = bot.rejectedMoves >= 3
        ? { event: 'endTurn' as const }
        : bot.strategy(currentG, currentCtx, bot.playerID);

      if (bot.rejectedMoves >= 3) {
        console.warn(
          `[BotRunner] ${bot.playerID} had ${bot.rejectedMoves} moves refused in a row — ending turn.`,
        );
      }
      console.log(`  ➜ ${formatDecision(decision, currentG, bot.playerID)}`);

      bot.lastDispatchStateID = currentState._stateID ?? null;

      if ('event' in decision) {
        (bot.client as any).events?.[decision.event]?.();
      } else {
        (bot.client as any).moves?.[decision.move]?.(...(decision.args as unknown[]));
      }
    });
  }

  /**
   * Tear down the bot clients of a match.
   *
   * `finished` distinguishes "the game is over" from "the server is shutting
   * down". Only in the first case may the stored credentials go: they are what
   * lets a bot re-enter its already-taken seat after a restart, and joinMatch
   * would refuse to hand out new ones.
   */
  detachMatch(matchID: string, { finished = true }: { finished?: boolean } = {}): void {
    const matchBots = this.activeMatches.get(matchID);
    if (!matchBots) return;

    for (const bot of matchBots.bots) {
      bot.unsubscribe?.();
      if (bot.reconnectTimer) clearTimeout(bot.reconnectTimer);
      try { (bot.client as any).stop(); } catch { /* ignore */ }
      if (finished) delete this.credentials[`${matchID}:${bot.playerID}`];
    }

    this.activeMatches.delete(matchID);

    if (finished) {
      this.finishedMatches.add(matchID);
      saveCredentials(this.credentials);
    }
  }

  /**
   * Pause, then act on the freshest state.
   *
   * Two hazards this closes. A throw inside the callback used to leave
   * `isThinking` set forever, and both the subscription and the watchdog skip a
   * thinking bot — one bad move and the NPC never played again. And dispatching
   * a move re-enters `onStateChange` synchronously, where the still-set flag
   * makes it return; that notification is gone for good, so the follow-up
   * (usually ending the turn) needs to be re-triggered afterwards.
   */
  private think(
    matchID: string,
    bot: BotClient,
    delayMs: number,
    act: (state: any) => void,
  ): void {
    bot.isThinking = true;
    bot.thinkingSince = Date.now();

    this.delay(delayMs).then(() => {
      try {
        const state = (bot.client as any).store?.getState();
        if (state) act(state);
      } catch (err) {
        console.error(`[BotRunner] Move by ${bot.playerID} in match ${matchID} threw:`, err);
      } finally {
        bot.isThinking = false;
        bot.thinkingSince = null;
        setImmediate(() => this.onStateChange(matchID, bot));
      }
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Bots pause before moving so play feels human. `NPC_THINK_FACTOR` scales that
 * pause — the e2e suite sets it near zero to play whole games in seconds.
 */
const THINK_FACTOR = Math.max(0, parseFloat(process.env.NPC_THINK_FACTOR || '1'));

function randomDelay(min: number, max: number): number {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return Math.round(ms * THINK_FACTOR);
}

function formatCost(cost: any[]): string {
  if (!cost?.length) return '–';
  return cost.map((c: any) => {
    switch (c.type) {
      case 'number':      return String(c.value);
      // Without a value an nTuple means "n cards of the same, any value".
      case 'nTuple':      return c.value != null ? `${c.n}×${c.value}` : `${c.n}× gleiche`;
      case 'sumAnyTuple': return `∑${c.sum}`;
      case 'sumTuple':    return `∑${c.sum}(${c.n}×)`;
      case 'run':         return `Folge×${c.length}`;
      case 'evenTuple':   return `gerade×${c.n}`;
      case 'oddTuple':    return `ungerade×${c.n}`;
      case 'diamond':     return `◆${c.value ?? 1}`;
      case 'tripleChoice': return `${c.value1}|${c.value2}`;
      default:            return c.type;
    }
  }).join(' + ');
}

function formatDecision(decision: any, G: any, playerID: string): string {
  if ('event' in decision) return 'Zug beenden';
  const { move, args } = decision;
  switch (move) {
    case 'takePearlCard': {
      const slot = args?.[0] as number;
      if (slot === -1) {
        const next = (G?.pearlDeck as any[])?.at(-1);
        return next ? `Perle blind ziehen (nächste wäre: ${next.value as number})` : 'Perle blind ziehen';
      }
      const pearl = G?.pearlSlots?.[slot];
      return pearl ? `Perle ${pearl.value as number} nehmen (Slot ${slot})` : `Perle Slot ${slot}`;
    }
    case 'replacePearlSlots':
      return 'Alle Perlenslots ersetzen';
    case 'activatePortalCard': {
      const idx = args?.[0] as number;
      const player = (G?.players as any)?.[playerID];
      const entry = player?.portal?.[idx];
      const cardName = (entry?.card?.name as string) ?? `Portal-Slot ${idx}`;
      const payment = args?.[1] as any[];
      const pearls = payment?.map((s: any) => s.value).join(' + ') ?? '?';
      return `Aktiviere: ${cardName}  (zahle: ${pearls})`;
    }
    case 'takeCharacterCard': {
      const slotIdx = args?.[0] as number;
      const replaceIdx = args?.[1] as number | undefined;
      let cardName: string;
      if (slotIdx === -1) {
        const next = (G?.characterDeck as any[])?.at(-1);
        cardName = next ? `${next.name as string} (blind)` : '(blind)';
      } else {
        const card = (G?.characterSlots as any[])?.[slotIdx];
        cardName = card ? `${card.name as string} (${card.powerPoints as number}pts)` : `Slot ${slotIdx}`;
      }
      if (replaceIdx !== undefined) {
        const player = (G?.players as any)?.[playerID];
        const replaced = player?.portal?.[replaceIdx];
        const replacedName = (replaced?.card?.name as string) ?? `Portal-Slot ${replaceIdx}`;
        return `Charakterkarte nehmen: ${cardName}  → wirft ab: ${replacedName}`;
      }
      return `Charakterkarte nehmen: ${cardName}`;
    }
    case 'resolveStealOpponentHandCard': {
      const targetID = args?.[0] as string;
      const cardIdx = args?.[1] as number;
      const targetPlayer = (G?.players as any)?.[targetID];
      const stolenCard = targetPlayer?.hand?.[cardIdx];
      const stolen = stolenCard ? ` (Perle ${stolenCard.value as number})` : '';
      return `Stehle Karte von ${(targetPlayer?.name as string) ?? targetID}${stolen}`;
    }
    case 'resolveDiscardOpponentCharacter': {
      const targetID = args?.[0] as string;
      const targetPlayer = (G?.players as any)?.[targetID];
      return `Entfernt Portalzielkarte von ${(targetPlayer?.name as string) ?? targetID}`;
    }
    case 'resolveReturnPearl':
      return 'Perle zurückholen';
    case 'dismissReturnPearlDialog':
      return 'Perle zurückholen: keine verfügbar';
    default:
      return `${move}`;
  }
}
