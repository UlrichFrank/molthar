/**
 * Pearl Card - Value 1-8
 * Some cards have a swap symbol
 */
export interface PearlCard {
    id: string;
    value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    hasSwapSymbol: boolean;
}
/**
 * Cost Component - Flexible cost system
 */
export interface CostComponent {
    type: 'number' | 'nTuple' | 'sumAnyTuple' | 'sumTuple' | 'run' | 'evenTuple' | 'oddTuple' | 'diamond' | 'tripleChoice';
    value?: number;
    n?: number;
    sum?: number;
    length?: number;
    value1?: number;
    value2?: number;
}
/**
 * Character Card
 */
export interface CharacterCard {
    id: string;
    name: string;
    cost: CostComponent[];
    powerPoints: number;
    diamonds: number;
    abilities: CharacterAbility[];
}
/**
 * Character Ability (Red or Blue)
 */
export interface CharacterAbility {
    id: string;
    type: 'red' | 'blue';
    description: string;
}
/**
 * Activated Character (placed on portal)
 */
export interface ActivatedCharacter {
    id: string;
    characterId: string;
    activated: boolean;
}
/**
 * Player State
 */
export interface PlayerState {
    id: string;
    name: string;
    hand: PearlCard[];
    portal: ActivatedCharacter[];
    powerPoints: number;
    diamonds: number;
    readyUp: boolean;
    isAI: boolean;
    aiDifficulty?: 1 | 2 | 3 | 4 | 5;
}
/**
 * Game State - Main game data structure
 */
export interface GameState {
    pearlDeck: PearlCard[];
    characterDeck: CharacterCard[];
    pearlDiscardPile: PearlCard[];
    characterDiscardPile: CharacterCard[];
    pearlSlots: PearlCard[];
    characterSlots: CharacterCard[];
    players: {
        [playerId: string]: PlayerState;
    };
    playerOrder: string[];
    actionCount: number;
    maxActions: number;
    finalRound: boolean;
    finalRoundStartingPlayer: string | null;
    startingPlayer: string;
}
/**
 * boardgame.io Context (provided by framework)
 */
export interface GameContext {
    numPlayers: number;
    currentPlayer: string;
    playOrder: string[];
    playOrderPos: number;
    activePlayers: {
        [playerId: string]: string;
    } | null;
    stage: string | null;
}
/**
 * Move arguments
 */
export interface TakePearlCardPayload {
    slotIndex: number;
}
export interface ActivateCharacterPayload {
    characterSlotIndex: number;
    pearlCardIndices: number[];
}
export interface ReplaceCharacterPayload {
    pearlCardIndices: number[];
}
export interface ReadyUpPayload {
    ready: boolean;
}
//# sourceMappingURL=types.d.ts.map