import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';
export class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(hostId, hostName, maxPlayers = 2, includeAI = false) {
        const roomId = uuidv4().substring(0, 8).toUpperCase();
        const room = {
            id: roomId,
            name: `${hostName}'s Game`,
            host: hostId,
            players: [
                {
                    id: hostId,
                    name: hostName,
                    socketId: '',
                    isAI: false,
                    isConnected: true,
                    isReady: false,
                },
            ],
            gameState: null,
            status: 'waiting',
            createdAt: Date.now(),
            maxPlayers,
            includeAI,
        };
        this.rooms.set(roomId, room);
        logger.info(`Room created: ${roomId}`, { hostId, maxPlayers });
        return room;
    }
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    getAllRooms() {
        return Array.from(this.rooms.values()).filter(room => room.status === 'waiting');
    }
    joinRoom(roomId, playerId, playerName, socketId) {
        const room = this.rooms.get(roomId);
        if (!room) {
            logger.warn(`Room not found: ${roomId}`);
            return null;
        }
        if (room.status !== 'waiting') {
            logger.warn(`Cannot join room in ${room.status} status: ${roomId}`);
            return null;
        }
        if (room.players.length >= room.maxPlayers) {
            logger.warn(`Room is full: ${roomId}`);
            return null;
        }
        // Check if player is already in room
        const existingPlayer = room.players.find(p => p.id === playerId);
        if (existingPlayer) {
            existingPlayer.socketId = socketId;
            existingPlayer.isConnected = true;
            logger.info(`Player reconnected: ${playerId} in room ${roomId}`);
            return room;
        }
        // Add new player
        const newPlayer = {
            id: playerId,
            name: playerName,
            socketId,
            isAI: false,
            isConnected: true,
            isReady: false,
        };
        room.players.push(newPlayer);
        logger.info(`Player joined room: ${roomId}`, { playerId, playerName, totalPlayers: room.players.length });
        return room;
    }
    leaveRoom(roomId, playerId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return;
        // Mark player as disconnected (don't remove immediately)
        const player = room.players.find(p => p.id === playerId);
        if (player) {
            player.isConnected = false;
            logger.info(`Player disconnected: ${playerId} from room ${roomId}`);
        }
        // If all players disconnected, delete room after grace period
        if (room.players.every(p => !p.isConnected)) {
            const gracePeriod = parseInt(process.env.RECONNECT_GRACE_PERIOD || '15000');
            setTimeout(() => {
                if (room.players.every(p => !p.isConnected)) {
                    this.rooms.delete(roomId);
                    logger.info(`Room deleted due to inactivity: ${roomId}`);
                }
            }, gracePeriod);
        }
    }
    playerReady(roomId, playerId, isReady) {
        const room = this.rooms.get(roomId);
        if (!room)
            return null;
        const player = room.players.find(p => p.id === playerId);
        if (player) {
            player.isReady = isReady;
            logger.debug(`Player ready status: ${playerId} = ${isReady}`);
        }
        return room;
    }
    canStartGame(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return false;
        const humanPlayers = room.players.filter(p => !p.isAI && p.isConnected);
        const requiredHumans = room.players.length === 2 ? 2 : 2; // Min 2 human players
        return humanPlayers.length >= requiredHumans && humanPlayers.every(p => p.isReady);
    }
    startGame(roomId) {
        const room = this.rooms.get(roomId);
        if (!room || !this.canStartGame(roomId)) {
            logger.warn(`Cannot start game: ${roomId}`);
            return false;
        }
        room.status = 'playing';
        room.players.forEach(p => p.isReady = false);
        logger.info(`Game started: ${roomId}`, { players: room.players.length });
        return true;
    }
    finishGame(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return false;
        room.status = 'finished';
        logger.info(`Game finished: ${roomId}`);
        return true;
    }
    deleteRoom(roomId) {
        this.rooms.delete(roomId);
        logger.info(`Room deleted: ${roomId}`);
    }
    getRoomStats() {
        const allRooms = Array.from(this.rooms.values());
        return {
            totalRooms: allRooms.length,
            waitingRooms: allRooms.filter(r => r.status === 'waiting').length,
            playingRooms: allRooms.filter(r => r.status === 'playing').length,
            totalPlayers: allRooms.reduce((sum, r) => sum + r.players.filter(p => p.isConnected).length, 0),
        };
    }
}
export const roomManager = new RoomManager();
//# sourceMappingURL=RoomManager.js.map