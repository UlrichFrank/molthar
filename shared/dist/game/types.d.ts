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
    imageName: string;
    cost: CostComponent[];
    powerPoints: number;
    diamonds: number;
    abilities: CharacterAbility[];
}
/**
 * type
 * - 'handLimitPlusOne': grants +1 to player's hand limit (applied on activation)
 * persistent
 * - true (blue ability): effect is permanent once activated
 * - false (red ability): effect is temporary, only on activation turn
*/
export interface CharacterAbility {
    id: string;
    persistent: boolean;
    type: 'handLimitPlusOne';
    description: string;
}
/**
 * Activated Character (placed on portal)
 */
export interface ActivatedCharacter {
    id: string;
    card: CharacterCard;
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
    activatedCharacters: ActivatedCharacter[];
    powerPoints: number;
    diamonds: number;
    readyUp: boolean;
    isAI: boolean;
    aiDifficulty?: 1 | 2 | 3 | 4 | 5;
    /**
     * Hand limit modifier - cumulative increase from activated character abilities.
     * Each character with the `handLimitPlusOne` ability increments this by 1.
     * Used to calculate maximum hand size: 5 (base) + handLimitModifier.
     * Increases only when characters are activated, does not decrease on deactivation.
     */
    handLimitModifier: number;
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
    requiresHandDiscard: boolean;
    excessCardCount: number;
    currentHandLimit: number;
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