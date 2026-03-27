import type { GameState, PearlCard, CharacterCard } from './types';
import './cardDatabaseLoader.js';
import './browserCardDatabaseLoader';
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
    setup: ({ ctx }: any) => GameState;
    /**
     * Moves: Player actions
     */
    moves: {
        takePearlCard({ G, ctx }: {
            G: GameState;
            ctx: any;
        }, slotIndex: number): "INVALID_MOVE" | undefined;
        takeCharacterCard({ G, ctx }: {
            G: GameState;
            ctx: any;
        }, slotIndex: number, replacedSlotIndex?: number): "INVALID_MOVE" | undefined;
        activatePortalCard({ G, ctx }: {
            G: GameState;
            ctx: any;
        }, portalSlotIndex: number, selectedCardIndices: number[]): "INVALID_MOVE" | undefined;
        replacePearlSlots({ G, ctx }: {
            G: GameState;
            ctx: any;
        }): "INVALID_MOVE" | undefined;
        discardCards({ G, ctx }: {
            G: GameState;
            ctx: any;
        }, cardIndices?: number[]): "INVALID_MOVE" | undefined;
        discardCardsButton({ G, events }: {
            G: GameState;
            events: any;
        }): void;
        discardCardsForHandLimit({ G, ctx, events }: {
            G: GameState;
            ctx: any;
            events: any;
        }, selectedCardIndices: number[]): "INVALID_MOVE" | undefined;
        endTurn({ G, events }: {
            G: GameState;
            events: any;
        }): void;
    };
    /**
     * Turn Configuration: Reset action count at start of each turn
     */
    turn: {
        onBegin: ({ G }: {
            G: GameState;
            ctx: any;
        }) => void;
        onMove: ({ G, ctx }: {
            G: GameState;
            ctx: any;
        }) => void;
        stages: {
            discard: {
                moves: {};
            };
        };
    };
    /**
     * End If Condition: Check for game end
     */
    endIf: ({ G, ctx }: {
        G: GameState;
        ctx: any;
    }) => {
        winner: {
            [playerID: string]: boolean;
        };
    } | undefined;
};
export declare function createPearlDeck(): PearlCard[];
export declare function createCharacterDeck(): CharacterCard[];
export declare function shuffleArray<T>(array: T[]): void;
export { validateCostPayment, findCostAssignment, consumeCosts } from './costCalculation';
export { getAllCards } from './cardDatabase';
export { waitForCardsLoaded } from './browserCardDatabaseLoader';
//# sourceMappingURL=index.d.ts.map