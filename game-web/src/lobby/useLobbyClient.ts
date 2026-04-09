import type { ComponentType } from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { LobbyClient } from 'boardgame.io/client';
import { PortaleVonMolthar } from '@portale-von-molthar/shared';
import { CanvasGameBoard } from '../components/CanvasGameBoard';

// If VITE_SERVER_URL is set at build time, use it.
// Otherwise derive from the current hostname so the same image works on any host
// (dev: localhost:3001, Synology: 192.168.x.x:3001, etc.)
export const SERVER_URL = import.meta.env.VITE_SERVER_URL
  ?? `${window.location.protocol}//${window.location.hostname}:3001`;

export const lobbyClient = new LobbyClient({ server: SERVER_URL });

export const PortaleClient = Client({
  game: PortaleVonMolthar,
  board: CanvasGameBoard as unknown as ComponentType<any>,
  numPlayers: 2,
  multiplayer: SocketIO({ server: SERVER_URL }),
  debug: process.env.NODE_ENV === 'development',
});

export interface MatchPlayer {
  id: number;
  name?: string;
}

export interface Match {
  matchID: string;
  players: MatchPlayer[];
  setupData?: { numPlayers?: number };
}
