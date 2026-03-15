/**
 * Portale von Molthar - Backend Server (boardgame.io)
 *
 * This server:
 * - Hosts the game engine and state management
 * - Manages multiplayer rooms and player connections
 * - Validates and processes game moves
 * - Broadcasts state updates to all connected clients
 */
import 'dotenv/config';
declare const httpServer: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
export { httpServer };
//# sourceMappingURL=server.d.ts.map