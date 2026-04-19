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
import { PortaleVonMolthar } from '@portale-von-molthar/shared';
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
}

interface MatchBots {
  bots: BotClient[];
}

// ---------------------------------------------------------------------------
// Credentials persistence
// ---------------------------------------------------------------------------

const CREDS_FILE = path.join(__dirname, '..', 'data', 'npc-credentials.json');

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

  constructor(serverUrl: string) {
    this.serverUrl = serverUrl;
    this.lobbyClient = new LobbyClient({ server: serverUrl });
    this.credentials = loadCredentials();
  }

  /** Called once after server start. Reconnects bots for persisted matches and starts polling. */
  async start(): Promise<void> {
    await this.scanAndAttach();
    this.pollTimer = setInterval(() => {
      this.scanAndAttach().catch(() => { /* non-fatal */ });
    }, 5000);
  }

  stop(): void {
    if (this.pollTimer) clearInterval(this.pollTimer);
    for (const [matchID] of this.activeMatches) {
      this.detachMatch(matchID);
    }
  }

  /** Scan all open matches and attach bots to any that have npcSlots. */
  async scanAndAttach(): Promise<void> {
    try {
      const { matches } = await this.lobbyClient.listMatches(PortaleVonMolthar.name);
      for (const match of matches) {
        if (this.activeMatches.has(match.matchID)) continue;
        if ((match as any).gameover) continue;

        const npcSlots = (match.setupData as any)?.npcSlots as NpcSlotConfig[] | undefined;
        if (!npcSlots?.length) continue;

        await this.attachMatch(match.matchID, npcSlots);
      }
    } catch {
      // Network errors during polling are non-fatal
    }
  }

  /** Join NPC slots (if not already joined) and start bot clients for a match. */
  async attachMatch(matchID: string, npcSlots: NpcSlotConfig[]): Promise<void> {
    if (this.activeMatches.has(matchID)) return;

    const bots: BotClient[] = [];

    for (const slot of npcSlots) {
      const playerID = String(slot.playerIndex);
      const credKey = `${matchID}:${playerID}`;

      let credentials = this.credentials[credKey];

      if (!credentials) {
        // Try to join the slot
        try {
          const result = await this.lobbyClient.joinMatch(PortaleVonMolthar.name, matchID, {
            playerID,
            playerName: slot.name,
          });
          credentials = result.playerCredentials;
          this.credentials[credKey] = credentials;
          saveCredentials(this.credentials);
        } catch {
          // Slot might already be taken — skip silently
          continue;
        }
      }

      const bot = this.startBotClient(matchID, playerID, credentials, slot);
      bots.push(bot);
    }

    if (bots.length > 0) {
      this.activeMatches.set(matchID, { bots });
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

    // Need to discard excess cards before normal actions
    if (G?.requiresHandDiscard) {
      const excess: number = G.excessCardCount ?? 0;
      if (excess > 0) {
        const player = G.players?.[bot.playerID];
        if (player) {
          // Discard lowest-value cards
          const sortedIndices = [...player.hand]
            .map((c: any, i: number) => ({ value: c.value as number, i }))
            .sort((a: any, b: any) => a.value - b.value)
            .slice(0, excess)
            .map((x: any) => x.i as number);

          bot.isThinking = true;
          this.delay(randomDelay(800, 1500)).then(() => {
            (bot.client as any).moves?.discardCardsForHandLimit?.(sortedIndices);
            bot.isThinking = false;
          });
        }
      }
      return;
    }

    // Execute strategy
    bot.isThinking = true;
    const delayMs = G?.actionCount === 0 ? randomDelay(1000, 2500) : randomDelay(800, 1500);

    this.delay(delayMs).then(() => {
      // Re-read state at dispatch time (could have changed during delay)
      const currentState = (bot.client as any).store?.getState();
      if (!currentState) { bot.isThinking = false; return; }

      const { G: currentG, ctx: currentCtx } = currentState as { G: any; ctx: any };
      if (currentCtx?.currentPlayer !== bot.playerID || currentCtx?.gameover) {
        bot.isThinking = false;
        return;
      }

      if (currentG?.actionCount >= currentG?.maxActions) {
        (bot.client as any).moves?.endTurn?.();
        bot.isThinking = false;
        return;
      }

      const decision = bot.strategy(currentG, currentCtx, bot.playerID);

      if ('event' in decision) {
        (bot.client as any).events?.[decision.event]?.();
      } else {
        (bot.client as any).moves?.[decision.move]?.(...(decision.args as unknown[]));
      }

      bot.isThinking = false;
    });
  }

  detachMatch(matchID: string): void {
    const matchBots = this.activeMatches.get(matchID);
    if (!matchBots) return;

    for (const bot of matchBots.bots) {
      bot.unsubscribe?.();
      if (bot.reconnectTimer) clearTimeout(bot.reconnectTimer);
      try { (bot.client as any).stop(); } catch { /* ignore */ }
    }

    this.activeMatches.delete(matchID);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

function randomDelay(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
