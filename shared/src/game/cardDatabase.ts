import type { CharacterCard } from './types';

// Raw card data structure from cards.json
interface RawCardData {
  id: string;
  name: string;
  imageName: string;
  powerPoints: number;
  diamondsReward: number;
  cost: Array<{
    type: string;
    [key: string]: any;
  }>;
  ability: {
    type: string;
    [key: string]: any;
  };
  cardCount: number;
}

// Placeholder - will be populated by tests
let RAW_CARDS: RawCardData[] = [];

// Export for test setup
export function __setRawCards(cards: RawCardData[]): void {
  RAW_CARDS = cards;
}

/**
 * Map raw card data from JSON to CharacterCard format
 * Handles field name transformations and ability parsing
 */
function mapRawCard(raw: RawCardData): CharacterCard {
  return {
    id: raw.id,
    name: raw.name,
    imageName: raw.imageName,
    cost: raw.cost as any,
    powerPoints: raw.powerPoints,
    diamonds: raw.diamondsReward,
    abilities: raw.ability.type === 'none' ? [] : [raw.ability as any],
  };
}

/**
 * Get a single card by ID from the card database
 */
export function getCardById(id: string): CharacterCard | undefined {
  const raw = RAW_CARDS.find(c => c.id === id);
  return raw ? mapRawCard(raw) : undefined;
}

/**
 * Get all cards from the database, with copies as specified
 * This expands cardCount > 1 into multiple copies of the same card
 */
export function getAllCards(): CharacterCard[] {
  const result: CharacterCard[] = [];
  for (const raw of RAW_CARDS) {
    const mapped = mapRawCard(raw);
    for (let i = 0; i < raw.cardCount; i++) {
      result.push({
        ...mapped,
        // Create unique IDs for copies (append copy number)
        id: raw.cardCount > 1 ? `${mapped.id}-copy${i}` : mapped.id,
      });
    }
  }
  return result;
}
