/**
 * Portale von Molthar - Backend Server
 *
 * Express server for room management and game coordination.
 * Note: Using REST API pattern instead of full boardgame.io server
 * for simplicity. The game logic runs client-side with local state.
 */

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';

import { logger } from './utils/logger.js';
import type { GameState } from '@portale-von-molthar/shared';

interface Player {
  id: string;
  name: string;
  credential: string;
  isAI: boolean;
}

interface GameRoom {
  id: string;
  createdAt: string;
  maxPlayers: number;
  players: Player[];
  status: 'waiting' | 'playing' | 'finished';
  aiDifficulty: number | null;
  includeAI: boolean;
  gameState?: GameState; // Shared game state (synced from host)
  hostPlayerID?: string; // Player ID of the host (game authority)
}

const app = express();
const httpServer = createServer(app);
const PORT = parseInt(process.env.PORT || '8000');
const isDev = process.env.NODE_ENV === 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// In-memory room storage (TODO: migrate to database)
const rooms = new Map<string, GameRoom>();
// Track move history per room
const moveHistory = new Map<string, Array<{ playerID: string; move: string; payload: any }>>();

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}));
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    message: 'Portale von Molthar backend is running',
    activeRooms: rooms.size,
  });
});

// List all active rooms
app.get('/api/rooms', (_req, res) => {
  try {
    const roomList = Array.from(rooms.values()).map(room => ({
      roomID: room.id,
      players: room.players.length,
      maxPlayers: room.maxPlayers,
      status: room.status,
      createdAt: room.createdAt,
    }));
    
    res.json({
      rooms: roomList,
      count: roomList.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('Failed to fetch rooms:', err);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Create new room
app.post('/api/rooms', (req, res) => {
  try {
    const { playerName, numPlayers, includeAI, aiDifficulty } = req.body;

    // Validation
    if (!playerName || playerName.length > 20) {
      res.status(400).json({ error: 'Invalid player name' });
      return;
    }

    if (numPlayers < 2 || numPlayers > 5) {
      res.status(400).json({ error: 'Invalid number of players' });
      return;
    }

    if (includeAI && (!aiDifficulty || aiDifficulty < 1 || aiDifficulty > 5)) {
      res.status(400).json({ error: 'Invalid AI difficulty' });
      return;
    }

    // Generate room ID and credentials
    const roomID = `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const playerID = '0'; // First player is always ID 0
    const credential = uuidv4();

    // Create room
    const room: GameRoom = {
      id: roomID,
      createdAt: new Date().toISOString(),
      maxPlayers: numPlayers,
      players: [
        {
          id: playerID,
          name: playerName,
          credential,
          isAI: false,
        },
      ],
      status: 'waiting',
      aiDifficulty: includeAI ? aiDifficulty : null,
      includeAI,
    };

    rooms.set(roomID, room);
    logger.info(`🆕 Room created: ${roomID} (${playerName}, ${numPlayers} players, AI: ${includeAI})`);

    res.json({
      roomID,
      playerID,
      credential,
      message: 'Room created successfully',
    });
  } catch (err) {
    logger.error('Failed to create room:', err);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Get room details
app.get('/api/rooms/:roomID', (req, res) => {
  try {
    const { roomID } = req.params;
    const room = rooms.get(roomID);

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    res.json({
      roomID: room.id,
      status: room.status,
      maxPlayers: room.maxPlayers,
      players: room.players.map((p: Player) => ({
        id: p.id,
        name: p.name,
        isAI: p.isAI,
      })),
      createdAt: room.createdAt,
    });
  } catch (err) {
    logger.error('Failed to fetch room:', err);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

// Join room
app.post('/api/rooms/:roomID/join', (req, res) => {
  try {
    const { roomID } = req.params;
    const { playerName } = req.body;

    if (!playerName || playerName.length > 20) {
      res.status(400).json({ error: 'Invalid player name' });
      return;
    }

    const room = rooms.get(roomID);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      res.status(400).json({ error: 'Room is full' });
      return;
    }

    const playerID = String(room.players.length);
    const credential = uuidv4();

    room.players.push({
      id: playerID,
      name: playerName,
      credential,
      isAI: false,
    });

    logger.info(`👤 Player joined room ${roomID}: ${playerName} (ID: ${playerID})`);

    // If room is full, start the game
    if (room.players.length === room.maxPlayers) {
      room.status = 'playing';
      logger.info(`🎮 Game starting in room ${roomID}`);
    }

    res.json({
      roomID,
      playerID,
      credential,
      room: {
        players: room.players.map((p: Player) => ({
          id: p.id,
          name: p.name,
        })),
        status: room.status,
      },
    });
  } catch (err) {
    logger.error('Failed to join room:', err);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// Submit a move to a room
app.post('/api/rooms/:roomID/moves', (req, res) => {
  try {
    const { roomID } = req.params;
    const { playerID, moveName, payload, gameState } = req.body;

    const room = rooms.get(roomID);
    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    // Verify player is in room
    const player = room.players.find((p: Player) => p.id === playerID);
    if (!player) {
      res.status(403).json({ error: 'Player not in room' });
      return;
    }

    // Store move in history
    if (!moveHistory.has(roomID)) {
      moveHistory.set(roomID, []);
    }
    const moves = moveHistory.get(roomID)!;
    moves.push({ playerID, move: moveName, payload });

    // Update shared game state
    room.gameState = gameState;

    logger.info(`📝 Move in room ${roomID}: ${moveName} from player ${playerID}`);

    res.json({
      success: true,
      moveID: moves.length - 1,
      timestamp: new Date().toISOString(),
      message: `Move ${moveName} recorded`,
    });
  } catch (err) {
    logger.error('Failed to submit move:', err);
    res.status(500).json({ error: 'Failed to submit move' });
  }
});

// Get game state for a room
app.get('/api/rooms/:roomID/state', (req, res) => {
  try {
    const { roomID } = req.params;
    const room = rooms.get(roomID);

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    if (!room.gameState) {
      res.status(400).json({ error: 'Game not yet initialized' });
      return;
    }

    res.json({
      gameState: room.gameState,
      roomID,
      status: room.status,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('Failed to fetch game state:', err);
    res.status(500).json({ error: 'Failed to fetch game state' });
  }
});

// Get move history for a room
app.get('/api/rooms/:roomID/moves', (req, res) => {
  try {
    const { roomID } = req.params;
    const room = rooms.get(roomID);

    if (!room) {
      res.status(404).json({ error: 'Room not found' });
      return;
    }

    const moves = moveHistory.get(roomID) || [];

    res.json({
      roomID,
      moves,
      count: moves.length,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('Failed to fetch moves:', err);
    res.status(500).json({ error: 'Failed to fetch moves' });
  }
});

// Error handling
app.use((err: any, _req: express.Request, res: express.Response) => {
  logger.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: isDev ? err.message : undefined,
  });
});

// Start server
httpServer.listen(PORT, () => {
  logger.info(`🚀 Portale von Molthar server running on port ${PORT}`);
  logger.info(`📍 HTTP server: http://localhost:${PORT}`);
  logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
  logger.info(`📋 API endpoints:`);
  logger.info(`   GET  /api/rooms - List active rooms`);
  logger.info(`   POST /api/rooms - Create new room`);
  logger.info(`   GET  /api/rooms/:roomID - Get room details`);
  logger.info(`   POST /api/rooms/:roomID/join - Join existing room`);
  logger.info(`   POST /api/rooms/:roomID/moves - Submit game move`);
  logger.info(`   GET  /api/rooms/:roomID/state - Get game state`);
  logger.info(`   GET  /api/rooms/:roomID/moves - Get move history`);
  logger.info(`🔗 Frontend: ${FRONTEND_URL}`);
  logger.info(`🌐 CORS enabled for: ${FRONTEND_URL}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export { httpServer };
