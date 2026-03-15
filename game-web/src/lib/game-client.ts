/**
 * Game Client Library
 *
 * Handles connection to the backend REST API and provides
 * utilities for managing game state on the frontend.
 */

import { Client } from 'boardgame.io/client';
import { PortaleVonMolthar } from '@portale-von-molthar/shared';
import type { GameState } from '@portale-von-molthar/shared';

interface GameClientConfig {
  serverURL?: string;
  debug?: boolean;
}

interface JoinGameOptions {
  roomID: string;
  playerID: string;
  credentials: string;
}

interface RoomInfo {
  roomID: string;
  status: 'waiting' | 'playing' | 'finished';
  players: Array<{ id: string; name: string }>;
  createdAt: string;
}

/**
 * Create and configure a game client
 */
export function createGameClient(config: GameClientConfig = {}) {
  const {
    serverURL = process.env.REACT_APP_SERVER_URL || 'http://localhost:3001',
    debug = false,
  } = config;

  const clientConfig = {
    game: PortaleVonMolthar,
    board: undefined, // Board is rendered in React
    debug,
    multiplayer: {
      server: serverURL,
    },
  };

  return Client(clientConfig as any);
}

/**
 * Connect to a specific game room
 */
export function joinGame(client: any, options: JoinGameOptions) {
  const { roomID, playerID, credentials } = options;

  try {
    client.start();
    
    logger('info', `Joining game: room=${roomID}, player=${playerID}`);
    
    return {
      roomID,
      playerID,
      credentials,
      status: 'connected',
    };
  } catch (err) {
    logger('error', `Failed to join game: ${err}`);
    throw err;
  }
}

/**
 * Simple logger utility
 */
function logger(level: 'info' | 'error' | 'warn', message: string) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  switch (level) {
    case 'error':
      console.error(prefix, message);
      break;
    case 'warn':
      console.warn(prefix, message);
      break;
    default:
      console.log(prefix, message);
  }
}

/**
 * Create room via REST API
 */
export async function createGameRoom(serverURL: string, options: {
  playerName: string;
  numPlayers: number;
  includeAI?: boolean;
  aiDifficulty?: number;
}) {
  const response = await fetch(`${serverURL}/api/rooms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    throw new Error(`Failed to create room: ${response.statusText}`);
  }

  const data = await response.json();
  logger('info', `Room created: ${data.roomID}`);
  
  return {
    roomID: data.roomID,
    playerID: data.playerID,
    credential: data.credential,
  };
}

/**
 * Join an existing room via REST API
 */
export async function joinGameRoom(serverURL: string, roomID: string, playerName: string) {
  const response = await fetch(`${serverURL}/api/rooms/${roomID}/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ playerName }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Failed to join room: ${response.statusText}`);
  }

  const data = await response.json();
  logger('info', `Joined room: ${roomID} as player ${data.playerID}`);
  
  return {
    roomID: data.roomID,
    playerID: data.playerID,
    credential: data.credential || data.roomID,
    room: data.room,
  };
}

/**
 * List available game rooms
 */
export async function listGameRooms(serverURL: string) {
  const response = await fetch(`${serverURL}/api/rooms`);

  if (!response.ok) {
    throw new Error(`Failed to fetch rooms: ${response.statusText}`);
  }

  const data = await response.json();
  return data.rooms || [];
}

/**
 * Get room details
 */
export async function getGameRoom(serverURL: string, roomID: string): Promise<RoomInfo> {
  const response = await fetch(`${serverURL}/api/rooms/${roomID}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch room: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Start polling for room updates
 * Calls callback whenever room state changes
 */
export function startRoomPolling(
  serverURL: string,
  roomID: string,
  interval: number = 1000,
  callback: (room: RoomInfo) => void
): () => void {
  let lastStatus: string | null = null;
  
  const pollInterval = setInterval(async () => {
    try {
      const room = await getGameRoom(serverURL, roomID);
      
      // Only call callback if status changed
      if (JSON.stringify(room) !== lastStatus) {
        lastStatus = JSON.stringify(room);
        callback(room);
      }
    } catch (err) {
      logger('warn', `Failed to poll room: ${err}`);
    }
  }, interval);

  // Return cleanup function
  return () => clearInterval(pollInterval);
}

export default createGameClient;
