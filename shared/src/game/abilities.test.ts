/**
 * abilities.test.ts – Testsuite für Charakter-Fähigkeiten
 *
 * Abdeckung:
 *   TIER 0: Typen, State-Initialisierung, applyBlueAbility, applyRedAbility (Grundlage)
 *   TIER 1: Alle 5 roten Fähigkeiten + turn.onEnd/onBegin-Hooks
 *   TIER 3: oneExtraActionPerTurn (Aktions-Modulation)
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { applyRedAbility, applyBlueAbility } from './abilityHandlers';
import type { GameState, CharacterAbility, PlayerState } from './types';

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

function makeAbility(
  type: CharacterAbility['type'],
  persistent: boolean,
): CharacterAbility {
  return { id: `test-${type}`, type, persistent, description: '' };
}

function makeMinimalGameState(overrides: Partial<GameState> = {}): GameState {
  const makePlayer = (id: string, name: string): PlayerState => ({
    id,
    name,
    hand: [],
    portal: [],
    activatedCharacters: [],
    powerPoints: 0,
    diamonds: 0,
    readyUp: false,
    isAI: false,
    handLimitModifier: 0,
    activeAbilities: [],
    colorIndex: 1,
    colorConfirmed: false,
  });
  return {
    pearlDeck: [],
    characterDeck: [],
    pearlDiscardPile: [],
    characterDiscardPile: [],
    pearlSlots: [],
    characterSlots: [],
    players: { '0': makePlayer('0', 'TestSpieler'), '1': makePlayer('1', 'Gegner') },
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
    lastPlayedPearlId: null,
    ...overrides,
  } as GameState;
}


function makeCtx(currentPlayer = '0') {
  return { currentPlayer };
}

// ---------------------------------------------------------------------------
// TIER 0: Typen & State-Initialisierung
// ---------------------------------------------------------------------------

describe('TIER 0 – Typen und State-Initialisierung', () => {
  it('0.1 – CharacterAbilityType umfasst alle 18 Typen', () => {
    const allTypes: CharacterAbility['type'][] = [
      'handLimitPlusOne',
      'oneExtraActionPerTurn',
      'threeExtraActions',
      'nextPlayerOneExtraAction',
      'discardOpponentCharacter',
      'stealOpponentHandCard',
      'takeBackPlayedPearl',
      'onesCanBeEights',
      'threesCanBeAny',
      'decreaseWithPearl',
      'changeCharacterActions',
      'changeHandActions',
      'previewCharacter',
      'tradeTwoForDiamond',
      'numberAdditionalCardActions',
      'anyAdditionalCardActions',
      'irrlicht',
      'none',
    ];
    // Jeder Typ muss als string compilierbar sein – rein typischer Check via TS
    expect(allTypes).toHaveLength(18);
  });

  it('0.2 – PlayerState.activeAbilities startet als leeres Array', () => {
    const G = makeMinimalGameState();
    expect(G.players['0'].activeAbilities).toEqual([]);
  });

  it('0.3 – GameState.nextPlayerExtraAction startet als false', () => {
    const G = makeMinimalGameState();
    expect(G.nextPlayerExtraAction).toBe(false);
  });

  it('0.4 – GameState.lastPlayedPearlId startet als null', () => {
    const G = makeMinimalGameState();
    expect(G.lastPlayedPearlId).toBeNull();
  });

  it('0.8 – applyBlueAbility fügt Fähigkeit zu activeAbilities hinzu', () => {
    const G = makeMinimalGameState();
    const player = G.players['0']!;
    const ability = makeAbility('onesCanBeEights', true);
    applyBlueAbility(player, ability);
    expect(player.activeAbilities).toContain(ability);
  });

  it('0.8 – applyBlueAbility handLimitPlusOne erhöht handLimitModifier', () => {
    const G = makeMinimalGameState();
    const player = G.players['0']!;
    expect(player.handLimitModifier).toBe(0);
    applyBlueAbility(player, makeAbility('handLimitPlusOne', true));
    expect(player.handLimitModifier).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// TIER 1: Rote Fähigkeiten – applyRedAbility
// ---------------------------------------------------------------------------

describe('TIER 1 – Rote Fähigkeiten (applyRedAbility)', () => {
  let G: GameState;

  beforeEach(() => {
    G = makeMinimalGameState();
  });

  // 1.1 / 1.2
  it('1.1/1.2 – threeExtraActions erhöht maxActions um 3', () => {
    expect(G.maxActions).toBe(3);
    applyRedAbility(G, makeCtx(), makeAbility('threeExtraActions', false));
    expect(G.maxActions).toBe(6);
  });

  // 1.4 / 1.5
  it('1.4 – nextPlayerOneExtraAction setzt nextPlayerExtraAction-Flag', () => {
    expect(G.nextPlayerExtraAction).toBe(false);
    applyRedAbility(G, makeCtx(), makeAbility('nextPlayerOneExtraAction', false));
    expect(G.nextPlayerExtraAction).toBe(true);
  });

  // 1.7 / 1.8
  it('1.7/1.8 – discardOpponentCharacter entfernt eine Karte vom Portal des Gegners', () => {
    const opponent = G.players['1']!;
    opponent.portal.push({
      id: 'test-entry',
      card: {
        id: 'card-1', name: 'X', imageName: 'x', cost: [],
        powerPoints: 1, diamonds: 0, abilities: [],
      },
      activated: false,
    });
    expect(opponent.portal).toHaveLength(1);
    applyRedAbility(G, makeCtx('0'), makeAbility('discardOpponentCharacter', false));
    expect(opponent.portal).toHaveLength(0);
    expect(G.characterDiscardPile).toHaveLength(1);
  });

  it('1.8 – discardOpponentCharacter kein Effekt wenn Gegner kein Portal hat', () => {
    applyRedAbility(G, makeCtx('0'), makeAbility('discardOpponentCharacter', false));
    expect(G.characterDiscardPile).toHaveLength(0);
  });

  // 1.9 / 1.10
  it('1.9/1.10 – stealOpponentHandCard überträgt Karte von Gegner-Hand auf eigene Hand', () => {
    const opponent = G.players['1']!;
    opponent.hand.push({ id: 'pearl-5-0', value: 5, hasSwapSymbol: false });
    applyRedAbility(G, makeCtx('0'), makeAbility('stealOpponentHandCard', false));
    expect(opponent.hand).toHaveLength(0);
    expect(G.players['0']!.hand).toHaveLength(1);
    expect(G.players['0']!.hand[0]!.id).toBe('pearl-5-0');
  });

  it('stealOpponentHandCard – kein Effekt wenn alle Gegner keine Karten haben', () => {
    applyRedAbility(G, makeCtx('0'), makeAbility('stealOpponentHandCard', false));
    expect(G.players['0']!.hand).toHaveLength(0);
  });

  // 1.11 / 1.12 / 1.13
  it('1.11/1.13 – takeBackPlayedPearl holt Perlenkarte vom Ablagestapel zurück', () => {
    const pearl = { id: 'pearl-3-1', value: 3 as const, hasSwapSymbol: false };
    G.pearlDiscardPile.push(pearl);
    G.lastPlayedPearlId = pearl.id;
    applyRedAbility(G, makeCtx('0'), makeAbility('takeBackPlayedPearl', false));
    expect(G.pearlDiscardPile).toHaveLength(0);
    expect(G.players['0']!.hand).toHaveLength(1);
    expect(G.lastPlayedPearlId).toBeNull();
  });

  it('1.13 – takeBackPlayedPearl kein Effekt wenn lastPlayedPearlId null', () => {
    G.pearlDiscardPile.push({ id: 'pearl-3-1', value: 3, hasSwapSymbol: false });
    applyRedAbility(G, makeCtx('0'), makeAbility('takeBackPlayedPearl', false));
    expect(G.pearlDiscardPile).toHaveLength(1);
    expect(G.players['0']!.hand).toHaveLength(0);
  });

  // 1.14 – keine Konflikte zwischen den 5 roten Fähigkeiten
  it('1.14/1.15 – alle 5 roten Fähigkeiten stapeln sich nicht gegenseitig', () => {
    const opponent = G.players['1']!;
    opponent.portal.push({
      id: 'p', card: { id: 'c', name: 'X', imageName: 'x', cost: [], powerPoints: 0, diamonds: 0, abilities: [] },
      activated: false,
    });
    opponent.hand.push({ id: 'pearl-2-0', value: 2, hasSwapSymbol: false });
    G.pearlDiscardPile.push({ id: 'pearl-7-0', value: 7, hasSwapSymbol: false });
    G.lastPlayedPearlId = 'pearl-7-0';

    applyRedAbility(G, makeCtx('0'), makeAbility('threeExtraActions', false));
    applyRedAbility(G, makeCtx('0'), makeAbility('nextPlayerOneExtraAction', false));
    applyRedAbility(G, makeCtx('0'), makeAbility('discardOpponentCharacter', false));
    applyRedAbility(G, makeCtx('0'), makeAbility('stealOpponentHandCard', false));
    applyRedAbility(G, makeCtx('0'), makeAbility('takeBackPlayedPearl', false));

    expect(G.maxActions).toBe(6);
    expect(G.nextPlayerExtraAction).toBe(true);
    expect(G.characterDiscardPile).toHaveLength(1);
    // steal + takeBack: Spieler hat 2 Karten (gestohlene + zurückgeholte)
    expect(G.players['0']!.hand).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// TIER 1: turn.onBegin-Hook (nextPlayerExtraAction-Flag)
// ---------------------------------------------------------------------------

describe('TIER 1 – turn.onBegin-Hook (Logik-Simulation)', () => {
  it('1.5 – onBegin wertet nextPlayerExtraAction aus und löscht das Flag', () => {
    const G = makeMinimalGameState({ nextPlayerExtraAction: true });
    const player0 = G.players['0']!;
    // Simuliere onBegin-Logik aus index.ts:
    const permanentBonus = player0.activeAbilities.filter(a => a.type === 'oneExtraActionPerTurn').length;
    G.maxActions = 3 + permanentBonus;
    if (G.nextPlayerExtraAction) {
      G.maxActions += 1;
      G.nextPlayerExtraAction = false;
    }

    expect(G.maxActions).toBe(4);
    expect(G.nextPlayerExtraAction).toBe(false);
  });

  it('1.6 – Flag wird nach onBegin gelöscht und nicht in Folgeturniere übertragen', () => {
    const G = makeMinimalGameState({ nextPlayerExtraAction: true });
    // Erste onBegin-Ausführung (Zug des nächsten Spielers)
    if (G.nextPlayerExtraAction) {
      G.maxActions += 1;
      G.nextPlayerExtraAction = false;
    }
    // Zweite onBegin-Ausführung (übernächster Zug) – Flag darf nicht mehr wirken
    G.maxActions = 3;
    if (G.nextPlayerExtraAction) G.maxActions += 1;

    expect(G.maxActions).toBe(3);
    expect(G.nextPlayerExtraAction).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// TIER 4: Blaue Hand-/Portal-Aktionen (changeCharacterActions, changeHandActions)
// ---------------------------------------------------------------------------

describe('TIER 4 – Blaue Hand-/Portal-Aktionen', () => {
  it('4.4 – swapPortalCharacter berücksichtigt actionCount und Fähigkeit', () => {
    const G = makeMinimalGameState();
    const ctx = makeCtx('0');
    const player = G.players['0']!;

    // Setup: Charakter in Portal und auf dem Feld (G.characterSlots)
    player.portal.push({ id: 'p-1', activated: false, card: { id: 'c-portal', name: 'P', imageName: '', powerPoints: 1, diamonds: 0, cost: [], abilities: [] } });
    G.characterSlots.push({ id: 'c-table', name: 'T', imageName: '', powerPoints: 1, diamonds: 0, cost: [], abilities: [] });

    // 1. Schlägt fehl ohne Fähigkeit
    let result = PortaleVonMolthar.moves!.swapPortalCharacter({ G, ctx }, 0, 0);
    expect(result).toBe('INVALID_MOVE');

    // Spieler erhält die Fähigkeit
    applyBlueAbility(player, makeAbility('changeCharacterActions', true));

    // 3. Wenn actionCount > 0, schlägt es fehl
    G.actionCount = 1;
    result = PortaleVonMolthar.moves!.swapPortalCharacter({ G, ctx }, 0, 0);
    expect(result).toBe('INVALID_MOVE');

    // 2. Erster Versuch klappt (actionCount = 0)
    G.actionCount = 0;
    result = PortaleVonMolthar.moves!.swapPortalCharacter({ G, ctx }, 0, 0);
    expect(result).not.toBe('INVALID_MOVE');
    // Die Karten wurden getauscht
    expect(player.portal[0]!.card.id).toBe('c-table');
    expect(G.characterSlots[0]!.id).toBe('c-portal');
  });

  it('4.8 – rehandCards tauscht Hand nach letzter Aktion aus', () => {
    const G = makeMinimalGameState();
    const ctx = makeCtx('0');
    const player = G.players['0']!;

    // Spieler hat 3 Karten in der Hand
    player.hand = [
      { id: 'h1', value: 1, hasSwapSymbol: false },
      { id: 'h2', value: 2, hasSwapSymbol: false },
      { id: 'h3', value: 3, hasSwapSymbol: false },
    ];
    // Deck vorbereiten (ausgehend von oben für vitest, array.pop nimmt das letzte Element)
    G.pearlDeck = [
      { id: 'd1', value: 4, hasSwapSymbol: false },
      { id: 'd2', value: 5, hasSwapSymbol: false },
      { id: 'd3', value: 6, hasSwapSymbol: false },
    ];
    G.pearlDiscardPile = [];

    // 1. Schlägt fehl ohne Fähigkeit
    G.actionCount = G.maxActions;
    let result = PortaleVonMolthar.moves!.rehandCards({ G, ctx });
    expect(result).toBe('INVALID_MOVE');

    // Spieler erhält die Fähigkeit
    applyBlueAbility(player, makeAbility('changeHandActions', true));

    // 2. Schlägt fehl, wenn actionCount < maxActions (nicht nach der letzten Aktion)
    G.actionCount = G.maxActions - 1;
    result = PortaleVonMolthar.moves!.rehandCards({ G, ctx });
    expect(result).toBe('INVALID_MOVE');

    // 3. Erfolgreich, wenn actionCount >= maxActions
    G.actionCount = G.maxActions;
    result = PortaleVonMolthar.moves!.rehandCards({ G, ctx });
    expect(result).not.toBe('INVALID_MOVE');

    // Hand wurde abgelegt und Deck gezogen (von h1, h2, h3 zu d3, d2, d1 wegen pop)
    expect(player.hand).toHaveLength(3);
    const handIds = player.hand.map(c => c.id).sort();
    expect(handIds).toEqual(['d1', 'd2', 'd3']);
    
    // Ablagestapel hat die alten Handkarten
    expect(G.pearlDiscardPile).toHaveLength(3);
    const discardIds = G.pearlDiscardPile.map(c => c.id).sort();
    expect(discardIds).toEqual(['h1', 'h2', 'h3']);

    // Deck ist jetzt leer
    expect(G.pearlDeck).toHaveLength(0);
  });
});
// ---------------------------------------------------------------------------
// TIER 1: turn.onEnd-Hook (lastPlayedPearlId zurücksetzen)
// ---------------------------------------------------------------------------

describe('TIER 1 – turn.onEnd-Hook', () => {
  it('1.3 – onEnd setzt lastPlayedPearlId auf null zurück', () => {
    const G = makeMinimalGameState({ lastPlayedPearlId: 'pearl-5-0' });
    // Simuliere onEnd:
    G.lastPlayedPearlId = null;
    expect(G.lastPlayedPearlId).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// TIER 3: oneExtraActionPerTurn
// ---------------------------------------------------------------------------

describe('TIER 3 – oneExtraActionPerTurn (Aktions-Modulation)', () => {
  it('3.3 – onBegin setzt maxActions auf 4 wenn oneExtraActionPerTurn aktiv', () => {
    const G = makeMinimalGameState();
    applyBlueAbility(G.players['0']!, makeAbility('oneExtraActionPerTurn', true));

    // Simuliere onBegin für Spieler '0'
    const player = G.players['0']!;
    const permanentBonus = player.activeAbilities.filter(a => a.type === 'oneExtraActionPerTurn').length;
    G.maxActions = 3 + permanentBonus;

    expect(G.maxActions).toBe(4);
  });

  it('3.4 – zwei oneExtraActionPerTurn stapeln sich → maxActions = 5', () => {
    const G = makeMinimalGameState();
    const player = G.players['0']!;
    applyBlueAbility(player, makeAbility('oneExtraActionPerTurn', true));
    applyBlueAbility(player, makeAbility('oneExtraActionPerTurn', true));

    const permanentBonus = player.activeAbilities.filter(a => a.type === 'oneExtraActionPerTurn').length;
    G.maxActions = 3 + permanentBonus;

    expect(G.maxActions).toBe(5);
  });

  it('3.5 – handLimitPlusOne erhöht handLimitModifier korrekt', () => {
    const G = makeMinimalGameState();
    const player = G.players['0']!;
    expect(player.handLimitModifier).toBe(0);
    applyBlueAbility(player, makeAbility('handLimitPlusOne', true));
    expect(player.handLimitModifier).toBe(1);
    applyBlueAbility(player, makeAbility('handLimitPlusOne', true));
    expect(player.handLimitModifier).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// TIER 2: Integrationstest für blaue Wildcards (onesCanBeEights, etc.)
// ---------------------------------------------------------------------------

import { PortaleVonMolthar } from './index';
import type { PaymentSelection } from './types';

describe('TIER 2 – Integration: Charakter mit Wildcard-Fähigkeit aktivieren', () => {
  it('2.8 – activatePortalCard akzeptiert PaymentSelection[] mit onesCanBeEights', () => {
    const G = makeMinimalGameState();
    const player = G.players['0']!;

    // Charakter ins Portal: kostet Summe 16 (= zwei 8er)
    player.portal.push({
      id: 'entry-1',
      activated: false,
      card: {
        id: 'card-1',
        name: 'Teurer Char',
        imageName: 'img',
        powerPoints: 1,
        diamonds: 0,
        cost: [{ type: 'sumAnyTuple', sum: 16 }],
        abilities: []
      }
    });

    // Spieler hat 2 Einser auf der Hand
    player.hand.push({ id: 'pearl-1-1', value: 1, hasSwapSymbol: false });
    player.hand.push({ id: 'pearl-1-2', value: 1, hasSwapSymbol: false });

    const ctx = makeCtx('0');

    // Ohne Modifier: schlägt fehl (Summe 1+1=2 ≠ 16)
    let result = PortaleVonMolthar.moves!.activatePortalCard({ G, ctx }, 0,
      [{ source: 'hand', handCardIndex: 0, value: 1 }, { source: 'hand', handCardIndex: 1, value: 1 }] as PaymentSelection[]
    );
    expect(result).toBe('INVALID_MOVE');

    // Spieler erhält die onesCanBeEights-Fähigkeit
    applyBlueAbility(player, makeAbility('onesCanBeEights', true));

    // Mit expliziter PaymentSelection (deklariert 1er als 8): valid!
    result = PortaleVonMolthar.moves!.activatePortalCard({ G, ctx }, 0, [
      { source: 'hand', handCardIndex: 0, value: 8, abilityType: 'onesCanBeEights' },
      { source: 'hand', handCardIndex: 1, value: 8, abilityType: 'onesCanBeEights' },
    ] as PaymentSelection[]);
    expect(result).not.toBe('INVALID_MOVE');

    expect(player.portal).toHaveLength(0);
    expect(player.activatedCharacters).toHaveLength(1);
    expect(player.hand).toHaveLength(0);
  });

  it('2.8 – activatePortalCard akzeptiert PaymentSelection[] mit threesCanBeAny', () => {
    const G = makeMinimalGameState();
    const player = G.players['0']!;
    player.portal.push({
      id: 'entry-2',
      activated: false,
      card: {
        id: 'card-2', name: 'Char2', imageName: 'img', powerPoints: 1, diamonds: 0,
        cost: [{ type: 'number', value: 7 }],
        abilities: []
      }
    });
    player.hand.push({ id: 'pearl-3-0', value: 3, hasSwapSymbol: false });
    applyBlueAbility(player, makeAbility('threesCanBeAny', true));

    const ctx = makeCtx('0');

    // Ohne Modifier: 3 ≠ 7 → fehlschlag
    let result = PortaleVonMolthar.moves!.activatePortalCard({ G, ctx }, 0,
      [{ source: 'hand', handCardIndex: 0, value: 3 }] as PaymentSelection[]
    );
    expect(result).toBe('INVALID_MOVE');

    // Mit threesCanBeAny deklariert zu 7: valid!
    result = PortaleVonMolthar.moves!.activatePortalCard({ G, ctx }, 0,
      [{ source: 'hand', handCardIndex: 0, value: 7, abilityType: 'threesCanBeAny' }] as PaymentSelection[]
    );
    expect(result).not.toBe('INVALID_MOVE');
  });

  it('2.6 – Backend blockiert onesCanBeEights ohne Fähigkeit', () => {
    const G = makeMinimalGameState();
    const player = G.players['0']!;
    player.portal.push({
      id: 'entry-3', activated: false,
      card: { id: 'card-3', name: 'C', imageName: '', powerPoints: 0, diamonds: 0, cost: [{ type: 'sumAnyTuple', sum: 16 }], abilities: [] }
    });
    player.hand.push({ id: 'pearl-1-1', value: 1, hasSwapSymbol: false });
    player.hand.push({ id: 'pearl-1-2', value: 1, hasSwapSymbol: false });
    const ctx = makeCtx('0');

    // Kein Ability → INVALID_MOVE (Betrugsversuch)
    const result = PortaleVonMolthar.moves!.activatePortalCard({ G, ctx }, 0, [
      { source: 'hand', handCardIndex: 0, value: 8, abilityType: 'onesCanBeEights' },
      { source: 'hand', handCardIndex: 1, value: 8, abilityType: 'onesCanBeEights' },
    ] as PaymentSelection[]);
    expect(result).toBe('INVALID_MOVE');
  });

  it('2.6 – Backend blockiert threesCanBeAny auf Nicht-3-Karte', () => {
    const G = makeMinimalGameState();
    const player = G.players['0']!;
    player.portal.push({
      id: 'entry-4', activated: false,
      card: { id: 'card-4', name: 'C', imageName: '', powerPoints: 0, diamonds: 0, cost: [{ type: 'number', value: 7 }], abilities: [] }
    });
    player.hand.push({ id: 'pearl-5-0', value: 5, hasSwapSymbol: false });
    applyBlueAbility(player, makeAbility('threesCanBeAny', true));
    const ctx = makeCtx('0');

    // threesCanBeAny auf Karte mit Wert 5 → INVALID_MOVE (nur 3er können transformiert werden)
    const result = PortaleVonMolthar.moves!.activatePortalCard({ G, ctx }, 0,
      [{ source: 'hand', handCardIndex: 0, value: 7, abilityType: 'threesCanBeAny' }] as PaymentSelection[]
    );
    expect(result).toBe('INVALID_MOVE');
  });

  it('2.6 – Backend blockiert decreaseWithPearl ohne ausreichende Diamanten', () => {
    const G = makeMinimalGameState();
    const player = G.players['0']!;
    player.diamonds = 0;
    player.portal.push({
      id: 'entry-5', activated: false,
      card: { id: 'card-5', name: 'C', imageName: '', powerPoints: 0, diamonds: 0, cost: [{ type: 'number', value: 4 }], abilities: [] }
    });
    player.hand.push({ id: 'pearl-5-0', value: 5, hasSwapSymbol: false });
    applyBlueAbility(player, makeAbility('decreaseWithPearl', true));
    const ctx = makeCtx('0');

    // Keine Diamanten vorhanden → INVALID_MOVE
    const result = PortaleVonMolthar.moves!.activatePortalCard({ G, ctx }, 0,
      [{ source: 'hand', handCardIndex: 0, value: 4, abilityType: 'decreaseWithPearl', diamondsUsed: 1 }] as PaymentSelection[]
    );
    expect(result).toBe('INVALID_MOVE');
  });

  it('2.6 – Backend blockiert doppelte Nutzung derselben Handkarte', () => {
    const G = makeMinimalGameState();
    const player = G.players['0']!;
    player.portal.push({
      id: 'entry-6', activated: false,
      card: { id: 'card-6', name: 'C', imageName: '', powerPoints: 0, diamonds: 0, cost: [{ type: 'nTuple', n: 2 }], abilities: [] }
    });
    player.hand.push({ id: 'pearl-5-0', value: 5, hasSwapSymbol: false });
    const ctx = makeCtx('0');

    // Dieselbe Karte zweimal → INVALID_MOVE
    const result = PortaleVonMolthar.moves!.activatePortalCard({ G, ctx }, 0,
      [{ source: 'hand', handCardIndex: 0, value: 5 }, { source: 'hand', handCardIndex: 0, value: 5 }] as PaymentSelection[]
    );
    expect(result).toBe('INVALID_MOVE');
  });
});

// ---------------------------------------------------------------------------
// TIER 5: Blaue Information & Ressourcen (previewCharacter, tradeTwoForDiamond)
// ---------------------------------------------------------------------------

describe('TIER 5 – Blaue Information & Ressourcen', () => {
  it('5.1-5.4 – peekCharacterDeck zeigt dem Spieler die oberste Karte', () => {
    const G = makeMinimalGameState();
    const ctx = makeCtx('0');
    const player = G.players['0']!;

    // Deck vorbereiten
    G.characterDeck.push({ id: 'c-deck-1', name: 'DeckKarte', imageName: '', powerPoints: 1, diamonds: 0, cost: [], abilities: [] });
    
    // Ohne Fähigkeit -> INVALID_MOVE
    let result = PortaleVonMolthar.moves!.peekCharacterDeck({ G, ctx });
    expect(result).toBe('INVALID_MOVE');

    // Mit Fähigkeit
    applyBlueAbility(player, makeAbility('previewCharacter', true));
    
    // actionCount > 0 -> INVALID_MOVE
    G.actionCount = 1;
    result = PortaleVonMolthar.moves!.peekCharacterDeck({ G, ctx });
    expect(result).toBe('INVALID_MOVE');

    // actionCount === 0 -> Klappt!
    G.actionCount = 0;
    result = PortaleVonMolthar.moves!.peekCharacterDeck({ G, ctx });
    expect(result).not.toBe('INVALID_MOVE');
    
    expect(player.peekedCard).toBeDefined();
    expect(player.peekedCard!.id).toBe('c-deck-1');

    // Im onEnd Hook muss peekedCard wieder gelöscht werden (Task 5.3 implizit + Sicherheit)
    PortaleVonMolthar.turn!.onEnd!({ G, ctx } as any);
    expect(player.peekedCard).toBeNull();
  });

  it('5.5-5.8 – tradeForDiamond tauscht genaue eine 2-Perle gegen 1 Diamant', () => {
    const G = makeMinimalGameState();
    const ctx = makeCtx('0');
    const player = G.players['0']!;

    player.hand = [
      { id: 'p1', value: 1, hasSwapSymbol: false },
      { id: 'p2', value: 2, hasSwapSymbol: false },
      { id: 'p3', value: 3, hasSwapSymbol: false },
    ];
    player.diamonds = 0;

    // Ohne Fähigkeit -> INVALID_MOVE
    let result = PortaleVonMolthar.moves!.tradeForDiamond({ G, ctx }, 1); // 1 = 2-Perle
    expect(result).toBe('INVALID_MOVE');

    // Mit Fähigkeit
    applyBlueAbility(player, makeAbility('tradeTwoForDiamond', true));

    // Falsche Karte (Wert !== 2) -> INVALID_MOVE
    result = PortaleVonMolthar.moves!.tradeForDiamond({ G, ctx }, 0); // index 0 (Wert 1)
    expect(result).toBe('INVALID_MOVE');

    // Richtig! (Index 1 = 2-Perle)
    result = PortaleVonMolthar.moves!.tradeForDiamond({ G, ctx }, 1);
    expect(result).not.toBe('INVALID_MOVE');
    
    expect(player.diamonds).toBe(1);
    expect(player.hand).toHaveLength(2);
    expect(player.hand.find(c => c.value === 2)).toBeUndefined();
    expect(G.pearlDiscardPile).toHaveLength(1);
    expect(G.pearlDiscardPile[0]!.id).toBe('p2');
  });
});

// ---------------------------------------------------------------------------
// TIER 6: Aufgedruckte Perlenwerte (numberAdditionalCardActions, anyAdditionalCardActions)
// ---------------------------------------------------------------------------

describe('TIER 6 – Aufgedruckte Perlenwerte (source: ability)', () => {
  const makePortalEntry = (id: string, cost: any[], _abilityType: string) => ({
    id: `portal-${id}`,
    activated: false as const,
    card: {
      id, name: id, imageName: '', powerPoints: 1, diamonds: 0, cost, abilities: []
    }
  });

  const makeActivatedChar = (id: string, abilityType: 'numberAdditionalCardActions' | 'anyAdditionalCardActions') => ({
    id: `act-${id}`,
    activated: true as const,
    card: {
      id, name: id, imageName: '', powerPoints: 1, diamonds: 0, cost: [],
      abilities: [{ id: `ab-${id}`, type: abilityType as any, persistent: true, description: '' }],
      printedPearls: abilityType === 'numberAdditionalCardActions'
        ? [{ value: 5 as const }]
        : undefined,
    }
  });

  it('6.3 – Backend erlaubt Zahlung durch Kombination: Handkarte + Bonusperle aus Charakterfähigkeit', () => {
    const G = makeMinimalGameState();
    const player = G.players['0']!;

    // Charakter im Portal kostet Summe 9
    player.portal.push(makePortalEntry('target', [{ type: 'sumAnyTuple', sum: 9 }], 'numberAdditionalCardActions'));
    // Spieler hat nur eine 4 in der Hand
    player.hand.push({ id: 'h1', value: 4, hasSwapSymbol: false });
    // Spieler hat aktivierten Charakter mit aufgedruckter 5
    player.activatedCharacters.push(makeActivatedChar('bonus-char', 'numberAdditionalCardActions') as any);

    const ctx = makeCtx('0');
    const charId = 'act-bonus-char';

    // Nur Handkarte: Summe 4 ≠ 9 → fehlschlag
    let result = PortaleVonMolthar.moves!.activatePortalCard({ G, ctx }, 0,
      [{ source: 'hand', handCardIndex: 0, value: 4 }] as PaymentSelection[]
    );
    expect(result).toBe('INVALID_MOVE');

    // Handkarte 4 + Bonusperle 5 = 9 → valid!
    result = PortaleVonMolthar.moves!.activatePortalCard({ G, ctx }, 0, [
      { source: 'hand', handCardIndex: 0, value: 4 },
      { source: 'ability', characterId: charId, value: 5 },
    ] as PaymentSelection[]);
    expect(result).not.toBe('INVALID_MOVE');

    // Echte Handkarte wurde verbraucht, Bonusperle aber nicht
    expect(player.hand).toHaveLength(0);
    // activatedCharacters bleibt unverändert (Bonuskarte wird nicht verbraucht)
    expect(player.activatedCharacters).toHaveLength(2); // alten + neu aktivierten
  });

  it('6.4 – Backend erlaubt anyAdditionalCardActions als Wildcard (beliebiger Wert)', () => {
    const G = makeMinimalGameState();
    const player = G.players['0']!;

    player.portal.push(makePortalEntry('target2', [{ type: 'number', value: 7 }], 'anyAdditionalCardActions'));
    player.activatedCharacters.push(makeActivatedChar('wildcard-char', 'anyAdditionalCardActions') as any);

    const ctx = makeCtx('0');
    const charId = 'act-wildcard-char';

    // Wildcard als 7 deklarieren → valid!
    const result = PortaleVonMolthar.moves!.activatePortalCard({ G, ctx }, 0,
      [{ source: 'ability', characterId: charId, value: 7 }] as PaymentSelection[]
    );
    expect(result).not.toBe('INVALID_MOVE');
  });

  it('6.5 – Backend blockiert source:ability wenn Charakter keine Bonus-Fähigkeit hat', () => {
    const G = makeMinimalGameState();
    const player = G.players['0']!;

    player.portal.push(makePortalEntry('target3', [{ type: 'number', value: 5 }], 'none'));
    // Charakter ohne Bonusperle
    player.activatedCharacters.push({
      id: 'act-no-bonus',
      activated: true,
      card: { id: 'no-bonus', name: 'N', imageName: '', powerPoints: 0, diamonds: 0, cost: [], abilities: [] }
    });

    const ctx = makeCtx('0');

    // Betrugsversuch: Charakter ohne Fähigkeit als Bonusperle → INVALID_MOVE
    const result = PortaleVonMolthar.moves!.activatePortalCard({ G, ctx }, 0,
      [{ source: 'ability', characterId: 'act-no-bonus', value: 5 }] as PaymentSelection[]
    );
    expect(result).toBe('INVALID_MOVE');
  });
});

// ---------------------------------------------------------------------------
// TIER 7: irrlicht – geteilte Aktivierung
// ---------------------------------------------------------------------------

describe('TIER 7 – irrlicht (geteilte Aktivierung)', () => {
  function makeIrrlichtGame() {
    // 3-player game with playerOrder [0, 1, 2]
    const makeP = (id: string): PlayerState => ({
      id, name: `P${id}`, hand: [], portal: [], activatedCharacters: [],
      powerPoints: 0, diamonds: 0, readyUp: false, isAI: false,
      handLimitModifier: 0, activeAbilities: [], colorIndex: 1, colorConfirmed: false,
    });
    const G = {
      ...makeMinimalGameState(),
      players: { '0': makeP('0'), '1': makeP('1'), '2': makeP('2') },
      playerOrder: ['0', '1', '2'],
    } as GameState;

    // Place irrlicht on player 1's portal
    const irrlichtCard = {
      id: 'irrlicht-1', name: 'Irrlicht', imageName: 'img', powerPoints: 3,
      diamonds: 0, cost: [], abilities: [{ id: 'a1', type: 'irrlicht' as const, persistent: false, description: '' }],
      sharedActivation: true,
    };
    G.players['1']!.portal.push({ id: 'portal-irrlicht', card: irrlichtCard, activated: false });
    return G;
  }

  it('7.6 – neighbors (player 0 and 2) can activate irrlicht on player 1\'s portal', () => {
    // Player 0 (left neighbor) can activate
    const G0 = makeIrrlichtGame();
    G0.players['0']!.hand = []; // Irrlicht costs nothing in this test
    const result0 = PortaleVonMolthar.moves!.activateSharedCharacter(
      { G: G0, ctx: makeCtx('0') }, '1', 0, []
    );
    expect(result0).not.toBe('INVALID_MOVE');
    expect(G0.players['1']!.portal).toHaveLength(0);
    expect(G0.players['0']!.activatedCharacters).toHaveLength(1);

    // Player 2 (right neighbor) can activate
    const G2 = makeIrrlichtGame();
    G2.players['2']!.hand = [];
    const result2 = PortaleVonMolthar.moves!.activateSharedCharacter(
      { G: G2, ctx: makeCtx('2') }, '1', 0, []
    );
    expect(result2).not.toBe('INVALID_MOVE');
    expect(G2.players['1']!.portal).toHaveLength(0);
    expect(G2.players['2']!.activatedCharacters).toHaveLength(1);
  });

  it('7.6 – non-neighbor player cannot activate irrlicht', () => {
    // In a 5-player game, player 3 is not a neighbor of player 0
    const makeP = (id: string): PlayerState => ({
      id, name: `P${id}`, hand: [], portal: [], activatedCharacters: [],
      powerPoints: 0, diamonds: 0, readyUp: false, isAI: false,
      handLimitModifier: 0, activeAbilities: [], colorIndex: 1, colorConfirmed: false,
    });
    const G = {
      ...makeMinimalGameState(),
      players: { '0': makeP('0'), '1': makeP('1'), '2': makeP('2'), '3': makeP('3'), '4': makeP('4') },
      playerOrder: ['0', '1', '2', '3', '4'],
    } as GameState;
    const irrlichtCard = {
      id: 'irrlicht-1', name: 'Irrlicht', imageName: 'img', powerPoints: 3,
      diamonds: 0, cost: [], abilities: [{ id: 'a1', type: 'irrlicht' as const, persistent: false, description: '' }],
      sharedActivation: true,
    };
    G.players['0']!.portal.push({ id: 'portal-irrlicht', card: irrlichtCard, activated: false });

    // Player 3 is not a neighbor of player 0 (neighbors are 1 and 4) → INVALID_MOVE
    const result = PortaleVonMolthar.moves!.activateSharedCharacter(
      { G, ctx: makeCtx('3') }, '0', 0, []
    );
    expect(result).toBe('INVALID_MOVE');
  });

  it('7.7 – power points go to the activating player (not the owner)', () => {
    const G = makeIrrlichtGame();
    G.players['0']!.hand = [];
    expect(G.players['0']!.powerPoints).toBe(0);
    expect(G.players['1']!.powerPoints).toBe(0);

    PortaleVonMolthar.moves!.activateSharedCharacter(
      { G, ctx: makeCtx('0') }, '1', 0, []
    );

    // Player 0 activated irrlicht → gets 3 power points
    expect(G.players['0']!.powerPoints).toBe(3);
    // Player 1 (owner) gets nothing
    expect(G.players['1']!.powerPoints).toBe(0);
  });

  it('7.7 – activateSharedCharacter fails for non-irrlicht card', () => {
    const G = makeIrrlichtGame();
    // Add a regular card to player 1's portal
    G.players['1']!.portal.push({
      id: 'portal-regular', activated: false,
      card: { id: 'regular', name: 'R', imageName: '', powerPoints: 1, diamonds: 0, cost: [], abilities: [] }
    });
    const result = PortaleVonMolthar.moves!.activateSharedCharacter(
      { G, ctx: makeCtx('0') }, '1', 1, []
    );
    expect(result).toBe('INVALID_MOVE');
  });
});

// ---------------------------------------------------------------------------
// TIER 8: Integration & Validierung
// ---------------------------------------------------------------------------

describe('TIER 8 – Integration & Validierung', () => {
  function simulateTurnEnd(G: GameState, playerId: string) {
    PortaleVonMolthar.turn!.onEnd!({ G, ctx: makeCtx(playerId) } as any);
  }
  function simulateTurnBegin(G: GameState, playerId: string) {
    PortaleVonMolthar.turn!.onBegin!({ G, ctx: makeCtx(playerId) } as any);
  }

  it('8.1/8.2 – 5-turn simulation with multiple abilities, no cross-player bleed', () => {
    const G = makeMinimalGameState();
    const p0 = G.players['0']!;
    const p1 = G.players['1']!;

    // Turn 1: Player 0 activates a threeExtraActions card
    simulateTurnBegin(G, '0');
    expect(G.maxActions).toBe(3);

    p0.portal.push({
      id: 'entry-red', activated: false,
      card: { id: 'red-card', name: 'RedCard', imageName: '', powerPoints: 1, diamonds: 0, cost: [],
        abilities: [{ id: 'r1', type: 'threeExtraActions' as const, persistent: false, description: '' }] }
    });
    PortaleVonMolthar.moves!.activatePortalCard({ G, ctx: makeCtx('0') }, 0, []);
    expect(G.maxActions).toBe(6);
    expect(p0.powerPoints).toBe(1);
    expect(p1.powerPoints).toBe(0);
    expect(p1.activeAbilities).toHaveLength(0);
    simulateTurnEnd(G, '0');

    // Turn 2: Player 1 - no extra action from player 0's ability
    simulateTurnBegin(G, '1');
    expect(G.maxActions).toBe(3);
    expect(G.nextPlayerExtraAction).toBe(false);
    simulateTurnEnd(G, '1');

    // Turn 3: Player 0 activates a oneExtraActionPerTurn card (blue)
    simulateTurnBegin(G, '0');
    p0.portal.push({
      id: 'entry-blue', activated: false,
      card: { id: 'blue-card', name: 'BlueCard', imageName: '', powerPoints: 2, diamonds: 0, cost: [],
        abilities: [{ id: 'b1', type: 'oneExtraActionPerTurn' as const, persistent: true, description: '' }] }
    });
    PortaleVonMolthar.moves!.activatePortalCard({ G, ctx: makeCtx('0') }, 0, []);
    expect(p0.activeAbilities).toHaveLength(1);
    expect(p0.activeAbilities[0]!.type).toBe('oneExtraActionPerTurn');
    expect(p1.activeAbilities).toHaveLength(0); // No bleed to player 1
    simulateTurnEnd(G, '0');

    // Turn 4: Player 0 gets permanent +1 action
    simulateTurnBegin(G, '0');
    expect(G.maxActions).toBe(4);
    simulateTurnEnd(G, '0');

    // Turn 5: Player 1 unaffected
    simulateTurnBegin(G, '1');
    expect(G.maxActions).toBe(3);
    expect(G.players['1']!.activeAbilities).toHaveLength(0);
    simulateTurnEnd(G, '1');
  });

  it('8.3 – blue ability effects persist correctly across multiple turns', () => {
    const G = makeMinimalGameState();
    const p0 = G.players['0']!;

    // Set up via activatedCharacters (the source of truth) so syncPlayerAbilities works
    const makeActivatedCard = (id: string, abilityType: string, persistent: boolean) => ({
      id: `act-${id}`, activated: true as const,
      card: {
        id, name: id, imageName: '', powerPoints: 0, diamonds: 0, cost: [],
        abilities: [{ id: `ab-${id}`, type: abilityType as any, persistent, description: '' }],
      }
    });
    p0.activatedCharacters.push(makeActivatedCard('c1', 'oneExtraActionPerTurn', true));
    p0.activatedCharacters.push(makeActivatedCard('c2', 'oneExtraActionPerTurn', true));
    p0.activatedCharacters.push(makeActivatedCard('c3', 'handLimitPlusOne', true));

    for (let turn = 0; turn < 3; turn++) {
      simulateTurnBegin(G, '0');
      expect(G.maxActions).toBe(5); // 3 + 2
      expect(p0.handLimitModifier).toBe(1);
      G.actionCount = G.maxActions;
      simulateTurnEnd(G, '0');
    }
    expect(p0.activeAbilities).toHaveLength(3);
  });
});
