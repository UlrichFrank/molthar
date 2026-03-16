"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("boardgame.io/server");
const shared_1 = require("@portale-von-molthar/shared");
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
const server = (0, server_1.Server)({
    games: [shared_1.PortaleVonMolthar],
    origins: [
        // Allow frontend to connect
        'http://localhost:5173',
        // Allow localhost in development
        server_1.Origins.LOCALHOST_IN_DEVELOPMENT,
    ],
});
server.run(PORT, () => {
    console.log(`🚀 Portale von Molthar server running on port ${PORT}`);
    console.log(`📍 Socket.IO server: http://localhost:${PORT}`);
    console.log(`📋 Lobby API: http://localhost:${PORT}/games/${shared_1.PortaleVonMolthar.name}`);
    console.log(`🔗 Frontend: http://localhost:5173`);
});
//# sourceMappingURL=server-bgio.js.map