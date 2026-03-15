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
const app = express();
const httpServer = createServer(app);
const PORT = parseInt(process.env.PORT || '8000');
const isDev = process.env.NODE_ENV === 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
// In-memory room storage (TODO: migrate to database)
const rooms = new Map();
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
    }
    catch (err) {
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
        const room = {
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
    }
    catch (err) {
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
            players: room.players.map((p) => ({
                id: p.id,
                name: p.name,
                isAI: p.isAI,
            })),
            createdAt: room.createdAt,
        });
    }
    catch (err) {
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
                players: room.players.map((p) => ({
                    id: p.id,
                    name: p.name,
                })),
                status: room.status,
            },
        });
    }
    catch (err) {
        logger.error('Failed to join room:', err);
        res.status(500).json({ error: 'Failed to join room' });
    }
});
// Error handling
app.use((err, _req, res) => {
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
//# sourceMappingURL=server.js.map