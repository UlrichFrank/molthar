import { GameRoom } from '../types.js';
export declare class RoomManager {
    private rooms;
    createRoom(hostId: string, hostName: string, maxPlayers?: number, includeAI?: boolean): GameRoom;
    getRoom(roomId: string): GameRoom | undefined;
    getAllRooms(): GameRoom[];
    joinRoom(roomId: string, playerId: string, playerName: string, socketId: string): GameRoom | null;
    leaveRoom(roomId: string, playerId: string): void;
    playerReady(roomId: string, playerId: string, isReady: boolean): GameRoom | null;
    canStartGame(roomId: string): boolean;
    startGame(roomId: string): boolean;
    finishGame(roomId: string): boolean;
    deleteRoom(roomId: string): void;
    getRoomStats(): {
        totalRooms: number;
        waitingRooms: number;
        playingRooms: number;
        totalPlayers: number;
    };
}
export declare const roomManager: RoomManager;
//# sourceMappingURL=RoomManager.d.ts.map