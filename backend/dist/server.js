/**
 * Portale von Molthar - Backend Server (boardgame.io)
 *
 * This server:
 * - Hosts the game engine and state management
 * - Manages multiplayer rooms and player connections
 * - Validates and processes game moves
 * - Broadcasts state updates to all connected clients
 */
import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import 'dotenv/config';
import { logger } from './utils/logger.js';
const app = express();
const httpServer = createServer(app);
// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    methods: ['GET', 'POST'],
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
    });
});
// Placeholder API endpoints
app.get('/api/rooms', (_req, res) => {
    res.json({
        rooms: [],
        timestamp: new Date().toISOString(),
    });
});
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
        // TODO: Integrate with boardgame.io server
        res.json({
            roomID: `room-${Date.now()}`,
            credential: `cred-${Date.now()}`,
            message: 'Room created successfully (boardgame.io integration pending)',
        });
    }
    catch (err) {
        logger.error('Failed to create room:', err);
        res.status(500).json({ error: 'Failed to create room' });
    }
});
// Error handling
app.use((err, _req, res) => {
    logger.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});
/**
 * Start Server
 */
const PORT = parseInt(process.env.PORT || '8000');
httpServer.listen(PORT, () => {
    logger.info(`🚀 Portale von Molthar server running on port ${PORT}`);
    logger.info(`📍 HTTP server: http://localhost:${PORT}`);
    logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
    logger.info(`📋 Lobby API: http://localhost:${PORT}/api/rooms`);
    logger.info(`📝 Note: boardgame.io integration in progress`);
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