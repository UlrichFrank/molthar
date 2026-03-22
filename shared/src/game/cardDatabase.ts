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

// Load cards from cards.json (single source of truth)
// Using Vite's import.meta.glob for proper module resolution
const modules = import.meta.glob<string>('../../resources/assets/cards.json', { query: '?raw', import: 'default' });
const cardsJson = Object.values(modules)[0] || '[]';

let RAW_CARDS: RawCardData[] = [];
try {
  RAW_CARDS = JSON.parse(cardsJson);
} catch (error) {
  console.warn('Failed to parse cards.json:', error);
  RAW_CARDS = [];
}

/**
 * Map raw card data from JSON to CharacterCard format
 * Handles field name transformations and ability parsing
 */
function mapRawCard(raw: RawCardData): CharacterCard {
  return {
    id: raw.id,
    name: raw.name,
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
