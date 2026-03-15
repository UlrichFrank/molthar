/**
 * Portale von Molthar - Backend Server
 *
 * Express server for room management and game coordination.
 * Note: Using REST API pattern instead of full boardgame.io server
 * for simplicity. The game logic runs client-side with local state.
 */
import 'dotenv/config';
declare const httpServer: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
export { httpServer };
//# sourceMappingURL=server.d.ts.map