import { describe, it, expect } from 'vitest';
import { PortaleVonMolthar } from './index';
import type { GameState, PlayerState, CharacterCard, PearlCard, PaymentSelection } from './types';

function makePlayer(id: string): PlayerState {
  return {
    id,
    name: `Player ${id}`,
    hand: [],
    portal: [],
    activatedCharacters: [],
    powerPoints: 0,
    diamondCards: [],
    readyUp: false,
    isAI: false,
    handLimitModifier: 0,
    activeAbilities: [],
    colorIndex: 1,
  };
}

function makeMinimalGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    pearlDeck: [],
    characterDeck: [],
    pearlDiscardPile: [],
    characterDiscardPile: [],
    pearlSlots: [null, null, null, null],
    characterSlots: [],
    players: { '0': makePlayer('0'), '1': makePlayer('1') },
    playerOrder: ['0', '1'],
    actionCount: 0,
    maxActions: 3,
    finalRound: false,
    finalRoundStartingPlayer: null,
    requiresHandDiscard: false,
    excessCardCount: 0,
    currentHandLimit: 5,
    startingPlayer: '0',
    portalEntryCounter: 0,
    nextPlayerExtraAction: false,
    playedRealPearlIds: [],
    pendingTakeBackPlayedPearl: false,
    isReshufflingPearlDeck: false,
    isReshufflingCharacterDeck: false,
    isPearlRefreshTriggered: false,
    pendingStealOpponentHandCard: false,
    pendingDiscardOpponentCharacter: false,
    usedPaymentAbilityTypes: [],
    usedAbilitySourceCharacterIds: [],
    withSpecialCards: true,
    replacePearlSlotsAbilityUsed: false,
    finalRoundTriggerTurn: null,
    ...overrides,
  } as GameState;
}

function makeDiamondCard(): CharacterCard {
  return {
    id: 'diamond-card',
    name: 'Diamond',
    imageName: 'test.png',
    cost: [{ type: 'number', value: 1 }],
    powerPoints: 0,
    diamonds: 1,
    abilities: [],
  };
}

function makeCharacterCard(cost: CharacterCard['cost'] = [{ type: 'number', value: 5 }]): CharacterCard {
  return {
    id: 'char-test',
    name: 'Test',
    imageName: 'test.png',
    cost,
    powerPoints: 1,
    diamonds: 0,
    abilities: [],
  };
}

function makeJokerCard(id = 'pearl-joker-0'): PearlCard {
  return { id, value: 1, hasSwapSymbol: false, hasRefreshSymbol: false, isSpecial: true, isJoker: true };
}

const ctx = { currentPlayer: '0', activePlayers: {} };

describe('Joker-Perlenkarte – Backend-Validierung', () => {
  it('4.1 – Joker mit gültigem Wert und ausreichend Diamanten → Move gültig', () => {
    const G = makeMinimalGameState();
    const player = G.players['0']!;

    // Charakter ins Portal: kostet eine 5
    player.portal.push({
      id: 'entry-1',
      activated: false,
      card: makeCharacterCard([{ type: 'number', value: 5 }]),
    });

    // Joker in die Hand, 1 Diamant verfügbar
    player.hand.push(makeJokerCard());
    player.diamondCards.push(makeDiamondCard());

    // Joker als Wert 5 deklarieren
    const result = PortaleVonMolthar.moves!.activatePortalCard({ G, ctx }, 0, [
      { source: 'hand', handCardIndex: 0, value: 5, abilityType: 'joker' } as PaymentSelection,
    ]);

    expect(result).not.toBe('INVALID_MOVE');
    expect(player.portal).toHaveLength(0);
    expect(player.activatedCharacters).toHaveLength(1);
    expect(player.hand).toHaveLength(0);
    // Diamant wurde ausgegeben
    expect(player.diamondCards).toHaveLength(0);
  });

  it('4.2 – Joker-Karte ohne freien Diamanten → INVALID_MOVE', () => {
    const G = makeMinimalGameState();
    const player = G.players['0']!;

    player.portal.push({
      id: 'entry-1',
      activated: false,
      card: makeCharacterCard([{ type: 'number', value: 5 }]),
    });

    // Joker in die Hand, KEIN Diamant verfügbar
    player.hand.push(makeJokerCard());
    // diamondCards bleibt leer

    const result = PortaleVonMolthar.moves!.activatePortalCard({ G, ctx }, 0, [
      { source: 'hand', handCardIndex: 0, value: 5, abilityType: 'joker' } as PaymentSelection,
    ]);

    expect(result).toBe('INVALID_MOVE');
  });

  it('4.3 – Joker mit Wert 0 → INVALID_MOVE; Joker mit Wert 9 → INVALID_MOVE', () => {
    const G0 = makeMinimalGameState();
    const player0 = G0.players['0']!;
    player0.portal.push({ id: 'entry-1', activated: false, card: makeCharacterCard([{ type: 'number', value: 5 }]) });
    player0.hand.push(makeJokerCard());
    player0.diamondCards.push(makeDiamondCard());

    const r0 = PortaleVonMolthar.moves!.activatePortalCard({ G: G0, ctx }, 0, [
      { source: 'hand', handCardIndex: 0, value: 0, abilityType: 'joker' } as PaymentSelection,
    ]);
    expect(r0).toBe('INVALID_MOVE');

    const G9 = makeMinimalGameState();
    const player9 = G9.players['0']!;
    player9.portal.push({ id: 'entry-1', activated: false, card: makeCharacterCard([{ type: 'number', value: 5 }]) });
    player9.hand.push(makeJokerCard());
    player9.diamondCards.push(makeDiamondCard());

    const r9 = PortaleVonMolthar.moves!.activatePortalCard({ G: G9, ctx }, 0, [
      { source: 'hand', handCardIndex: 0, value: 9, abilityType: 'joker' } as PaymentSelection,
    ]);
    expect(r9).toBe('INVALID_MOVE');
  });

  it('4.4 – Joker + Kartenkostenelement diamond → korrekte Gesamtzahl Diamanten abgezogen', () => {
    const G = makeMinimalGameState();
    const player = G.players['0']!;

    // Charakter kostet: Wert 5 + 1 Diamant (diamond component)
    player.portal.push({
      id: 'entry-1',
      activated: false,
      card: makeCharacterCard([{ type: 'number', value: 5 }, { type: 'diamond' }]),
    });

    // Joker in die Hand + 2 Diamanten (1 für Joker, 1 für diamond-Komponente)
    player.hand.push(makeJokerCard());
    player.diamondCards.push(makeDiamondCard(), { ...makeDiamondCard(), id: 'diamond-card-2' });

    const result = PortaleVonMolthar.moves!.activatePortalCard({ G, ctx }, 0, [
      { source: 'hand', handCardIndex: 0, value: 5, abilityType: 'joker' } as PaymentSelection,
      { source: 'diamond', value: 0 } as PaymentSelection,
    ]);

    expect(result).not.toBe('INVALID_MOVE');
    // Beide Diamanten wurden ausgegeben
    expect(player.diamondCards).toHaveLength(0);
  });
});
