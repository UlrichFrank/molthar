import { describe, it, expect, beforeEach } from 'vitest';
import { PortaleVonMolthar } from './index';
import { __setRawCards } from './cardDatabase';

// Mock card data: some normal, some special
const mockCards = [
  {
    id: 'char-normal-1',
    name: 'Normal Card 1',
    imageName: 'normal1.png',
    powerPoints: 2,
    diamondsReward: 0,
    cost: [{ type: 'number', value: 3 }],
    ability: { type: 'none' },
    cardCount: 1,
  },
  {
    id: 'char-normal-2',
    name: 'Normal Card 2',
    imageName: 'normal2.png',
    powerPoints: 3,
    diamondsReward: 1,
    cost: [{ type: 'number', value: 5 }],
    ability: { type: 'none' },
    cardCount: 1,
  },
  {
    id: 'char-special-1',
    name: 'Special Card 1',
    imageName: 'special1.png',
    powerPoints: 4,
    diamondsReward: 1,
    cost: [{ type: 'number', value: 6 }],
    ability: { type: 'none' },
    cardCount: 1,
    isSpecial: true,
  },
];

function makeSetup(playerIds = ['0', '1'], setupData?: { withSpecialCards?: boolean }) {
  return (PortaleVonMolthar as any).setup(
    { ctx: { playOrder: playerIds, numPlayers: playerIds.length } },
    setupData,
  );
}

describe('setup() – Sonderkarten-Filterung', () => {
  beforeEach(() => {
    __setRawCards(mockCards as any);
  });

  it('4.1 – ohne setupData → keine Sonderkarten im Charakterdeck', () => {
    const G = makeSetup();
    const allCharCards = [
      ...G.characterDeck,
      ...G.characterSlots,
    ];
    expect(allCharCards.every((c: any) => !c.isSpecial)).toBe(true);
    expect(G.withSpecialCards).toBe(false);
  });

  it('4.2 – mit withSpecialCards: true → Sonderkarten im Deck enthalten', () => {
    const G = makeSetup(['0', '1'], { withSpecialCards: true });
    const allCharCards = [
      ...G.characterDeck,
      ...G.characterSlots,
    ];
    expect(allCharCards.some((c: any) => c.isSpecial === true)).toBe(true);
    expect(G.withSpecialCards).toBe(true);
  });

  it('4.3 – mit withSpecialCards: false → keine Sonderkarten im Deck', () => {
    const G = makeSetup(['0', '1'], { withSpecialCards: false });
    const allCharCards = [
      ...G.characterDeck,
      ...G.characterSlots,
    ];
    expect(allCharCards.every((c: any) => !c.isSpecial)).toBe(true);
    expect(G.withSpecialCards).toBe(false);
  });
});
