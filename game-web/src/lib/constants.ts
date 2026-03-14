import type { CharacterCard, PearlCard } from './types';

// Game Rules
export const GAME_RULES = {
  PLAYERS_MIN: 2,
  PLAYERS_MAX: 4,
  HAND_LIMIT: 5,
  POWER_POINTS_TO_TRIGGER_FINAL_ROUND: 12,
  ACTIONS_PER_TURN: 3,
  FACE_UP_PEARLS: 4,
  FACE_UP_CHARACTERS: 2,
  PORTAL_CAPACITY: 2,
} as const;

// Create Pearl Deck (56 cards: 7 per value 1-8)
export function createPearlDeck(): PearlCard[] {
  const deck: PearlCard[] = [];
  for (let value = 1; value <= 8; value++) {
    for (let i = 0; i < 7; i++) {
      deck.push({
        value: value as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8,
        hasSwapSymbol: i === 0, // first card of each value has swap
      });
    }
  }
  // Shuffle
  return deck.sort(() => Math.random() - 0.5);
}

// Load character cards from JSON
export async function loadCharacterCards(): Promise<CharacterCard[]> {
  try {
    const response = await fetch('/cards.json');
    if (!response.ok) throw new Error('Failed to load cards');
    return response.json();
  } catch (error) {
    console.error('Error loading character cards:', error);
    return [];
  }
}
