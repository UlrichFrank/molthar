import { Server, Origins } from 'boardgame.io/server';
import { PortaleVonMolthar } from '@portale-von-molthar/shared';

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

const server = Server({
  games: [PortaleVonMolthar],
  
  origins: [
    // Allow frontend to connect
    'http://localhost:5173',
    // Allow localhost in development
    Origins.LOCALHOST_IN_DEVELOPMENT,
  ],
});

server.run(PORT, () => {
  console.log(`🚀 Portale von Molthar server running on port ${PORT}`);
  console.log(`📍 Socket.IO server: http://localhost:${PORT}`);
  console.log(`📋 Lobby API: http://localhost:${PORT}/games/${PortaleVonMolthar.name}`);
  console.log(`🔗 Frontend: http://localhost:5173`);
});
