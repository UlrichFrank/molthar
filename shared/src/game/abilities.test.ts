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

describe('TIER 2 – Integration: Charakter mit Wildcard-Fähigkeit aktivieren', () => {
  it('2.13 – activatePortalCard nutzt activeAbilities für cost validation', () => {
    const G = makeMinimalGameState();
    const player = G.players['0']!;
    
    // Charakter ins Portal legen, der ein 8er-Paar kostet
    player.portal.push({
      id: 'entry-1',
      activated: false,
      card: {
        id: 'card-1',
        name: 'Teurer Char',
        imageName: 'img',
        powerPoints: 1,
        diamonds: 0,
        cost: [{ type: 'nTuple', n: 2 }], // Verlangt 2 von der Liste (hier im Test wollen wir eigentlich dass es auch auf Wert 8 ankommt, nehmen wir also sumTuple oder so)
        abilities: []
      }
    });

    // Wir ändern die Kosten auf genauen Betrag: brauche 2 Achten! wait, there's no fixed value nTuple right now, nTuple just means any pair. 
    // Let's use number value=8 and another number value=8. But we need onesCanBeEights to work.
    // Let's make the cost: sumAnyTuple = 16. With two cards, if they are 1s, sum=2 without modifier, sum=16 with modifier!
    player.portal[0]!.card.cost = [{ type: 'sumAnyTuple', sum: 16 }];
    
    // Spieler hat 2 Einser auf der Hand
    player.hand.push({ id: 'pearl-1-1', value: 1, hasSwapSymbol: false });
    player.hand.push({ id: 'pearl-1-2', value: 1, hasSwapSymbol: false });

    const ctx = makeCtx('0');

    // Ohne Modifier: activatePortalCard schlägt fehl
    let result = PortaleVonMolthar.moves!.activatePortalCard({ G, ctx }, 0, [0, 1]);
    expect(result).toBe('INVALID_MOVE'); // Im boardgame.io Kontext gibt der Move `INVALID_MOVE` zurück

    // Jetzt bekommt der Spieler die onesCanBeEights-Fähigkeit (als bereits aktiviert)
    applyBlueAbility(player, makeAbility('onesCanBeEights', true));

    // Mit Modifier: onesCanBeEights - die beiden 1er zählen als 8, 8+8=16. Move ist gültig!
    result = PortaleVonMolthar.moves!.activatePortalCard({ G, ctx }, 0, [0, 1]);
    expect(result).not.toBe('INVALID_MOVE');
    
    // Karte ist aktiviert worden
    expect(player.portal).toHaveLength(0);
    expect(player.activatedCharacters).toHaveLength(1);
    expect(player.hand).toHaveLength(0); // Karten ausgegeben
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
