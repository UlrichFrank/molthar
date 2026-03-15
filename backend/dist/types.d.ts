/**
 * Shared types between backend and frontend
 */
export interface IGameState {
    id: string;
    players: IPlayer[];
    currentPlayer: number;
    gamePhase: 'setup' | 'playing' | 'finished';
    pearlDeck: IPearlCard[];
    discardPile: IPearlCard[];
    characterDeck: ICharacterCard[];
    createdAt: number;
    updatedAt: number;
}
export interface IPlayer {
    id: string;
    name: string;
    hand: IPearlCard[];
    powerPoints: number;
    activeCharacters: ICharacterCard[];
    actionCount: number;
    diamonds: number;
}
export interface IPearlCard {
    id: string;
    value: number;
    hasSwap: boolean;
}
export interface ICharacterCard {
    id: string;
    name: string;
    cost: number;
    powerPoints: number;
    diamonds: number;
    abilities: IAbility[];
}
export interface IAbility {
    id: string;
    type: 'red' | 'blue';
    description: string;
}
export type GameAction = {
    type: 'TakePearlCard';
    cardIndex: number;
} | {
    type: 'PlaceCharacter';
    cardIndex: number;
} | {
    type: 'ActivateCharacter';
    characterIndex: number;
    pearlCardIndices: number[];
} | {
    type: 'DiscardCards';
    indices: number[];
} | {
    type: 'EndTurn';
};
export type GameActionMessage = GameAction & {
    playerId: string;
    timestamp: number;
};
/**
 * Room and Player types
 */
export interface GameRoom {
    id: string;
    name: string;
    host: string;
    players: RoomPlayer[];
    gameState: IGameState | null;
    status: 'waiting' | 'playing' | 'finished';
    createdAt: number;
    maxPlayers: number;
    includeAI: boolean;
}
export interface RoomPlayer {
    id: string;
    name: string;
    socketId: string;
    isAI: boolean;
    isConnected: boolean;
    isReady: boolean;
}
/**
 * WebSocket Events
 */
export interface ServerToClientEvents {
    'room:created': (data: {
        roomId: string;
        room: GameRoom;
    }) => void;
    'room:player-joined': (data: {
        playerId: string;
        playerName: string;
        players: RoomPlayer[];
    }) => void;
    'room:player-left': (data: {
        playerId: string;
        players: RoomPlayer[];
    }) => void;
    'room:player-ready': (data: {
        playerId: string;
        isReady: boolean;
        players: RoomPlayer[];
    }) => void;
    'game:started': (data: {
        gameState: IGameState;
    }) => void;
    'game:state-update': (data: {
        gameState: IGameState;
    }) => void;
    'game:action-broadcast': (data: {
        action: GameActionMessage;
        gameState: IGameState;
    }) => void;
    'game:finished': (data: {
        winners: string[];
        stats: GameStats;
    }) => void;
    'error': (data: {
        message: string;
        code: string;
    }) => void;
    'connection': () => void;
}
export interface ClientToServerEvents {
    'room:create': (data: {
        playerName: string;
        maxPlayers: number;
        includeAI: boolean;
    }, cb: (response: {
        roomId: string;
        error?: string;
    }) => void) => void;
    'room:join': (data: {
        roomId: string;
        playerName: string;
    }, cb: (response: {
        playerId: string;
        room?: GameRoom;
        error?: string;
    }) => void) => void;
    'room:leave': (data: {
        roomId: string;
    }, cb: (response: {
        success: boolean;
        error?: string;
    }) => void) => void;
    'room:ready': (data: {
        roomId: string;
        isReady: boolean;
    }, cb: (response: {
        success: boolean;
        error?: string;
    }) => void) => void;
    'game:start': (data: {
        roomId: string;
    }, cb: (response: {
        success: boolean;
        error?: string;
    }) => void) => void;
    'game:action': (data: {
        roomId: string;
        action: GameAction;
    }, cb: (response: {
        success: boolean;
        gameState?: IGameState;
        error?: string;
    }) => void) => void;
}
export interface GameStats {
    duration: number;
    totalActions: number;
    playerStats: {
        playerId: string;
        playerName: string;
        finalPowerPoints: number;
        actionsPerformed: number;
    }[];
}
export interface AIStrategy {
    name: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert' | 'genius';
    aggressiveness: number;
    greediness: number;
    adaptability: number;
}
//# sourceMappingURL=types.d.ts.map