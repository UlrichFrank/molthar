// TypeScript types for boardgame.io integration
// Defines the game state, moves, and player information

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
 * Character Ability (Red or Blue)
 */
export interface CharacterAbility {
  id: string;
  type: 'red' | 'blue'; // red = instant once, blue = persistent multiple
  description: string;
}

/**
 * Activated Character (placed on portal)
 */
export interface ActivatedCharacter {
  id: string;
  card: CharacterCard;  // full card data needed for activation
  activated: boolean; // true = ability used (rotated 180°)
}

/**
 * Player State
 */
export interface PlayerState {
  id: string;
  name: string;
  hand: PearlCard[];
  portal: ActivatedCharacter[]; // max 2, cards not yet activated
  activatedCharacters: ActivatedCharacter[]; // cards that have been activated (removed from portal)
  powerPoints: number;
  diamonds: number;
  readyUp: boolean;
  isAI: boolean;
  aiDifficulty?: 1 | 2 | 3 | 4 | 5; // 1=easy, 5=genius
}

/**
 * Game State - Main game data structure
 */
export interface GameState {
  // Decks
  pearlDeck: PearlCard[];
  characterDeck: CharacterCard[];
  pearlDiscardPile: PearlCard[];
  characterDiscardPile: CharacterCard[];
  
  // Face-up cards
  pearlSlots: PearlCard[]; // 4 face-up pearl cards
  characterSlots: CharacterCard[]; // 2 face-up character cards
  
  // Players
  players: { [playerId: string]: PlayerState };
  playerOrder: string[]; // Order of players
  
  // Game state
  actionCount: number; // Current player's remaining actions (0-3+)
  maxActions: number; // Maximum actions available this turn (3 + bonuses)
  finalRound: boolean; // True if final round started
  finalRoundStartingPlayer: string | null; // Player who triggered final round
  
  // Metadata
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
  activePlayers: { [playerId: string]: string } | null;
  stage: string | null;
}

/**
 * Move arguments
 */
export interface TakePearlCardPayload {
  slotIndex: number; // 0-3 for face-up, -1 for deck
}

export interface ActivateCharacterPayload {
  characterSlotIndex: number; // 0-1 for face-up
  pearlCardIndices: number[]; // Indices from hand to use
}

export interface ReplaceCharacterPayload {
  pearlCardIndices: number[]; // Indices from hand to use
}

export interface ReadyUpPayload {
  ready: boolean;
}
