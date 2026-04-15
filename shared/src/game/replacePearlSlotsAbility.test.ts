import { describe, it, expect, beforeEach } from 'vitest';
import { PortaleVonMolthar } from './index';
import { __setRawCards } from './cardDatabase';
import type { GameState, PearlCard, CharacterCard, CharacterAbility } from './types';

// Minimal card setup: one regular card so deck isn't empty
const mockCards = [
  {
    id: 'char-regular',
    name: 'Regular',
    imageName: 'reg.png',
    powerPoints: 1,
    diamondsReward: 0,
    cost: [{ type: 'number', value: 3 }],
    ability: { type: 'none' },
    cardCount: 2,
  },
];

function makeGameState(): GameState {
  __setRawCards(mockCards as any);
  return (PortaleVonMolthar as any).setup({ ctx: { playOrder: ['0', '1'], numPlayers: 2 } });
}

function makePearlCard(id: string, value = 1): PearlCard {
  return { id, value: value as any, hasSwapSymbol: false, hasRefreshSymbol: false };
}

function makeAbilityCard(): CharacterCard {
  const ability: CharacterAbility = {
    id: 'test-replace-ability',
    type: 'replacePearlSlotsBeforeFirstAction',
    persistent: true,
    description: '',
  };
  return {
    id: 'tischlein-test',
    name: 'Tischlein deck dich',
    imageName: 'Charakterkarte41.png',
    cost: [{ type: 'number', value: 4 }],
    powerPoints: 0,
    diamonds: 0,
    abilities: [ability],
  };
}

function grantAbility(G: GameState, playerId = '0') {
  const player = G.players[playerId]!;
  const card = makeAbilityCard();
  player.activatedCharacters.push({
    id: `portal-entry-test`,
    activated: false,
    card,
  });
  player.activeAbilities = [card.abilities[0]!];
}

const moves = (PortaleVonMolthar as any).moves;

describe('replacePearlSlotsAbility — Gratis-Perltausch vor erster Aktion', () => {
  let G: GameState;

  beforeEach(() => {
    G = makeGameState();
    G.pearlSlots = [
      makePearlCard('s0'),
      makePearlCard('s1'),
      makePearlCard('s2'),
      makePearlCard('s3'),
    ];
    G.pearlDeck = [
      makePearlCard('n0'),
      makePearlCard('n1'),
      makePearlCard('n2'),
      makePearlCard('n3'),
      makePearlCard('n4'),
    ];
    G.actionCount = 0;
    G.replacePearlSlotsAbilityUsed = false;
    grantAbility(G, '0');
  });

  const ctx = { currentPlayer: '0', activePlayers: {} };

  it('5.1 – actionCount === 0 → Erfolg; Slots ersetzt; replacePearlSlotsAbilityUsed = true; actionCount unverändert', () => {
    const oldSlotIds = G.pearlSlots.map(s => s?.id);
    const result = moves.replacePearlSlotsAbility({ G, ctx });
    expect(result).not.toBe('INVALID_MOVE');
    expect(G.replacePearlSlotsAbilityUsed).toBe(true);
    expect(G.actionCount).toBe(0); // keine Aktion verbraucht
    const newIds = G.pearlSlots.map(s => s?.id);
    expect(newIds).not.toEqual(oldSlotIds); // Slots wurden ersetzt
  });

  it('5.2 – actionCount > 0 → INVALID_MOVE', () => {
    G.actionCount = 1;
    const result = moves.replacePearlSlotsAbility({ G, ctx });
    expect(result).toBe('INVALID_MOVE');
  });

  it('5.3 – replacePearlSlotsAbilityUsed === true → INVALID_MOVE', () => {
    G.replacePearlSlotsAbilityUsed = true;
    const result = moves.replacePearlSlotsAbility({ G, ctx });
    expect(result).toBe('INVALID_MOVE');
  });

  it('5.4 – Fähigkeit nicht aktiv → INVALID_MOVE', () => {
    G.players['0']!.activeAbilities = [];
    G.players['0']!.activatedCharacters = [];
    const result = moves.replacePearlSlotsAbility({ G, ctx });
    expect(result).toBe('INVALID_MOVE');
  });

  it('5.5 – nach Gratis-Nutzung ist replacePearlSlots weiterhin als Aktion verfügbar', () => {
    moves.replacePearlSlotsAbility({ G, ctx });
    expect(G.replacePearlSlotsAbilityUsed).toBe(true);
    expect(G.actionCount).toBe(0);

    // Normaler Tausch ist noch möglich
    G.pearlDeck = [
      makePearlCard('m0'),
      makePearlCard('m1'),
      makePearlCard('m2'),
      makePearlCard('m3'),
      makePearlCard('m4'),
    ];
    const result = moves.replacePearlSlots({ G, ctx });
    expect(result).not.toBe('INVALID_MOVE');
    expect(G.actionCount).toBe(1);
  });
});
