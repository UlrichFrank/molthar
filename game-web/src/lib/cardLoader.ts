import type { CharacterCard } from './types';

export interface CardsData {
  characters: CharacterCard[];
}

/**
 * Load character cards from cards.json
 * Falls back to empty array if loading fails
 */
export async function loadCharacterCards(): Promise<CharacterCard[]> {
  try {
    const response = await fetch('/cards.json');
    if (!response.ok) {
      console.error(`Failed to load cards.json: ${response.status}`);
      return [];
    }
    
    const data: CardsData = await response.json();
    
    // Validate card data
    if (!Array.isArray(data.characters)) {
      console.error('Invalid cards data format');
      return [];
    }
    
    // Validate each card has required fields
    const validCards = data.characters.filter((card) => {
      return (
        card.id &&
        card.name &&
        Array.isArray(card.cost) &&
        typeof card.powerPoints === 'number' &&
        typeof card.diamonds === 'number' &&
        card.ability
      );
    });
    
    if (validCards.length !== data.characters.length) {
      console.warn(
        `Loaded ${validCards.length} valid cards, ${
          data.characters.length - validCards.length
        } had invalid data`
      );
    }
    
    return validCards;
  } catch (error) {
    console.error('Error loading cards:', error);
    return [];
  }
}

/**
 * Validate a single character card
 */
export function validateCard(card: CharacterCard): boolean {
  if (!card.id || !card.name) return false;
  if (!Array.isArray(card.cost) || card.cost.length === 0) return false;
  if (typeof card.powerPoints !== 'number' || card.powerPoints < 0) return false;
  if (typeof card.diamonds !== 'number' || card.diamonds < 0) return false;
  return true;
}

/**
 * Get card by ID
 */
export function getCardById(cards: CharacterCard[], cardId: string): CharacterCard | undefined {
  return cards.find((c) => c.id === cardId);
}
