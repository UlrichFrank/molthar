import type { CharacterCard } from './types';

const STORAGE_KEY = 'moltharCards';

export class CardStore {
  private cards: CharacterCard[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.cards = JSON.parse(stored);
      }
    } catch (err) {
      console.error('Error loading cards from localStorage:', err);
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cards));
    } catch (err) {
      console.error('Error saving cards to localStorage:', err);
    }
  }

  getAll(): CharacterCard[] {
    return [...this.cards];
  }

  getById(id: string): CharacterCard | undefined {
    return this.cards.find(c => c.id === id);
  }

  create(name: string): CharacterCard {
    const card: CharacterCard = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      imageName: '',
      powerPoints: 0,
      diamondsReward: 0,
      cost: { type: 'identicalValues', count: 2 },
      ability: { type: 'none' }
    };
    this.cards.push(card);
    this.save();
    return card;
  }

  update(id: string, card: Partial<CharacterCard>): CharacterCard | undefined {
    const index = this.cards.findIndex(c => c.id === id);
    if (index === -1) return undefined;
    this.cards[index] = { ...this.cards[index], ...card };
    this.save();
    return this.cards[index];
  }

  delete(id: string): boolean {
    const index = this.cards.findIndex(c => c.id === id);
    if (index === -1) return false;
    this.cards.splice(index, 1);
    this.save();
    return true;
  }

  search(query: string): CharacterCard[] {
    const q = query.toLowerCase();
    return this.cards.filter(c => c.name.toLowerCase().includes(q));
  }

  exportJSON(): string {
    return JSON.stringify(this.cards, null, 2);
  }

  importJSON(json: string): boolean {
    try {
      const cards = JSON.parse(json);
      if (!Array.isArray(cards)) return false;
      // Basic validation
      if (!cards.every(c => c.id && c.name && c.cost && c.ability)) {
        return false;
      }
      this.cards = cards;
      this.save();
      return true;
    } catch (err) {
      console.error('Error importing cards:', err);
      return false;
    }
  }

  getStats() {
    return {
      total: this.cards.length,
      totalPowerPoints: this.cards.reduce((sum, c) => sum + c.powerPoints, 0),
      totalDiamonds: this.cards.reduce((sum, c) => sum + c.diamondsReward, 0),
      withAbilities: this.cards.filter(c => c.ability.type !== 'none').length,
    };
  }
}

// Singleton instance
let storeInstance: CardStore | null = null;

export function getCardStore(): CardStore {
  if (!storeInstance) {
    storeInstance = new CardStore();
  }
  return storeInstance;
}
