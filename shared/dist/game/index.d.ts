import type { GameState, PearlCard, CharacterCard } from './types';
import './cardDatabaseLoader.js';
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
        }, slotIndex: number): void;
        takeCharacterCard({ G, ctx }: {
            G: GameState;
            ctx: any;
        }, slotIndex: number, replacedSlotIndex?: number): void;
        activatePortalCard({ G, ctx }: {
            G: GameState;
            ctx: any;
        }, portalSlotIndex: number, selectedCardIndices: number[]): void;
        replacePearlSlots({ G, ctx }: {
            G: GameState;
            ctx: any;
        }): void;
        discardCards({ G, ctx }: {
            G: GameState;
            ctx: any;
        }, cardIndices?: number[]): void;
        discardCardsButton({ G, events }: {
            G: GameState;
            events: any;
        }): void;
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
                moves: {
                    discardCardsForHandLimit({ G, ctx, events }: {
                        G: GameState;
                        ctx: any;
                        events: any;
                    }, selectedCardIndices: number[]): void;
                };
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
/**
 * Helper Functions
 */
export declare function createPearlDeck(): PearlCard[];
export declare function createCharacterDeck(): CharacterCard[];
export declare function shuffleArray<T>(array: T[]): void;
export { validateCostPayment, findCostAssignment, consumeCosts } from './costCalculation';
export { getAllCards } from './cardDatabase';
//# sourceMappingURL=index.d.ts.map