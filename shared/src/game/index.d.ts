import type { GameState, PearlCard, CharacterCard } from './types';
/**
 * Helper function for invalid moves
 */
/**
 * PortaleVonMolthar - Complete boardgame.io implementation
 * Turn-based card game with 2-5 players
 */
export declare const PortaleVonMolthar: {
    name: string;
    minPlayers: number;
    maxPlayers: number;
    /**
     * Setup: Initialize game state
     */
    setup: (ctx: any) => GameState;
    /**
     * Moves: Player actions
     */
    moves: {
        takePearlCard(G: GameState, ctx: any, slotIndex: number): void;
        activateCharacter(G: GameState, ctx: any, slotIndex: number, usedCards?: number[]): void;
        replacePearlSlots(G: GameState, ctx: any): void;
        discardCards(G: GameState, ctx: any, cardIndices?: number[]): void;
        endTurn(G: GameState, ctx: any): void;
    };
    /**
     * End If Condition: Check for game end
     */
    endIf: (G: GameState, ctx: any) => {
        winner: {
            [playerID: string]: boolean;
        };
    } | undefined;
};
/**
 * Helper Functions
 */
export declare function createPearlDeck(): PearlCard[];
export declare function createCharacterDeck(): CharacterCard[];
export declare function shuffleArray<T>(array: T[]): void;
//# sourceMappingURL=index.d.ts.map