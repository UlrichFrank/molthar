import type { ComponentType } from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { LobbyClient } from 'boardgame.io/client';
import { PortaleVonMolthar } from '@portale-von-molthar/shared';
import type { NpcSlotConfig } from '@portale-von-molthar/shared';
import { GameBoardSwitch } from '../components/GameBoardSwitch';

// The single binary serves page, lobby API and Socket.IO from one origin.
// VITE_SERVER_URL overrides that for development, where Vite (5173) and the
// backend (3001) run separately — see game-web/.env.development.
export const SERVER_URL = import.meta.env.VITE_SERVER_URL || window.location.origin;

export const lobbyClient = new LobbyClient({ server: SERVER_URL });

export const PortaleClient = Client({
  game: PortaleVonMolthar,
  board: GameBoardSwitch as unknown as ComponentType<any>,
  numPlayers: 2,
  multiplayer: SocketIO({ server: SERVER_URL }),
  debug: process.env.NODE_ENV === 'development',
});

export interface MatchPlayer {
  id: number;
  name?: string;
  isConnected?: boolean;
}

export interface Match {
  matchID: string;
  players: MatchPlayer[];
  setupData?: { numPlayers?: number; withSpecialCards?: boolean; npcSlots?: NpcSlotConfig[] };
  createdAt?: number;
  updatedAt?: number;
}

/**
 * Seats a human may take: still empty and not reserved for an NPC. NPC seats
 * are empty until the server-side BotRunner fills them a few seconds later —
 * without this check a joining human takes the bot's seat, and the bot then has
 * nowhere to sit.
 */
export function freeHumanSlots(match: Match): MatchPlayer[] {
  const npcIndices = new Set((match.setupData?.npcSlots ?? []).map(s => s.playerIndex));
  return match.players.filter(p => p.name === undefined && !npcIndices.has(p.id));
}
