import { describe, it, expect } from 'vitest';
import { computeNeededValues } from './botNeededValues';
import type { CharacterCard, PearlCard, CostComponent, CharacterAbility } from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pearl(value: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8): PearlCard {
  return { id: `p${value}-${Math.random()}`, value, hasSwapSymbol: false, hasRefreshSymbol: false };
}

function card(cost: CostComponent[], id = 'c'): CharacterCard {
  return { id, name: 'Test', imageName: 'test', cost, powerPoints: 3, diamonds: 0, abilities: [] };
}

function ability(type: CharacterAbility['type']): CharacterAbility {
  return { id: `a-${type}`, type, persistent: true, description: '' };
}

// ---------------------------------------------------------------------------
// Basisfälle
// ---------------------------------------------------------------------------

describe('computeNeededValues — Basisfälle', () => {
  it('leere Kartenliste → leeres Set', () => {
    expect(computeNeededValues([], [], 0, [])).toEqual(new Set());
  });

  it('bereits zahlbare Karte → leeres Set', () => {
    const c = card([{ type: 'number', value: 5 }]);
    expect(computeNeededValues([c], [pearl(5)], 0, [])).toEqual(new Set());
  });

  it('Union über mehrere Karten', () => {
    const a = card([{ type: 'number', value: 3 }], 'a');
    const b = card([{ type: 'number', value: 7 }], 'b');
    const result = computeNeededValues([a, b], [], 0, []);
    expect(result.has(3)).toBe(true);
    expect(result.has(7)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// number
// ---------------------------------------------------------------------------

describe('number-Kostentyp', () => {
  it('fehlender Wert wird erkannt', () => {
    const c = card([{ type: 'number', value: 5 }]);
    expect(computeNeededValues([c], [], 0, [])).toContain(5 as any);
  });

  it('vorhandener Wert wird nicht erkannt', () => {
    const c = card([{ type: 'number', value: 5 }]);
    expect(computeNeededValues([c], [pearl(5)], 0, [])).not.toContain(5 as any);
  });
});

// ---------------------------------------------------------------------------
// nTuple
// ---------------------------------------------------------------------------

describe('nTuple-Kostentyp', () => {
  it('Pair fehlt komplett → Wert benötigt', () => {
    const c = card([{ type: 'nTuple', n: 2, value: 4 }]);
    const result = computeNeededValues([c], [], 0, []);
    expect(result.has(4)).toBe(true);
  });

  it('Pair halb vorhanden → Wert noch benötigt', () => {
    const c = card([{ type: 'nTuple', n: 2, value: 4 }]);
    const result = computeNeededValues([c], [pearl(4)], 0, []);
    expect(result.has(4)).toBe(true);
  });

  it('Pair vollständig → nicht benötigt', () => {
    const c = card([{ type: 'nTuple', n: 2, value: 4 }]);
    const result = computeNeededValues([c], [pearl(4), pearl(4)], 0, []);
    expect(result.has(4)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// evenTuple / oddTuple
// ---------------------------------------------------------------------------

describe('evenTuple-Kostentyp', () => {
  it('gerade Perlen fehlen → alle geraden Werte benötigt', () => {
    const c = card([{ type: 'evenTuple', n: 2 }]);
    const result = computeNeededValues([c], [], 0, []);
    expect(result.has(2)).toBe(true);
    expect(result.has(4)).toBe(true);
    expect(result.has(6)).toBe(true);
    expect(result.has(8)).toBe(true);
  });

  it('genug gerade Perlen vorhanden → nicht benötigt', () => {
    const c = card([{ type: 'evenTuple', n: 2 }]);
    const result = computeNeededValues([c], [pearl(2), pearl(4)], 0, []);
    expect(result.has(2)).toBe(false);
    expect(result.has(4)).toBe(false);
  });
});

describe('oddTuple-Kostentyp', () => {
  it('ungerade Perlen fehlen → alle ungeraden Werte benötigt', () => {
    const c = card([{ type: 'oddTuple', n: 2 }]);
    const result = computeNeededValues([c], [], 0, []);
    expect(result.has(1)).toBe(true);
    expect(result.has(3)).toBe(true);
    expect(result.has(5)).toBe(true);
    expect(result.has(7)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------

describe('run-Kostentyp', () => {
  it('Folge fast vollständig → fehlende Lücke erkannt', () => {
    const c = card([{ type: 'run', length: 3 }]);
    // Hand hat 4 und 5 → Folge 3-4-5 oder 4-5-6 fast vollständig
    const result = computeNeededValues([c], [pearl(4), pearl(5)], 0, []);
    // Entweder 3 oder 6 sollte fehlen (fehlende Lücke)
    expect(result.has(3) || result.has(6)).toBe(true);
  });

  it('leere Hand → mindestens ein Wert benötigt', () => {
    const c = card([{ type: 'run', length: 3 }]);
    const result = computeNeededValues([c], [], 0, []);
    expect(result.size).toBeGreaterThan(0);
  });

  it('vollständige Folge → leer', () => {
    const c = card([{ type: 'run', length: 3 }]);
    const result = computeNeededValues([c], [pearl(3), pearl(4), pearl(5)], 0, []);
    expect(result.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// sumAnyTuple / sumTuple
// ---------------------------------------------------------------------------

describe('sumAnyTuple-Kostentyp', () => {
  it('Summe noch nicht erreicht, Rest erreichbar → Rest benötigt', () => {
    const c = card([{ type: 'sumAnyTuple', sum: 9 }]);
    const result = computeNeededValues([c], [pearl(3), pearl(2)], 0, []);
    // currentSum = 5, remainder = 4
    expect(result.has(4)).toBe(true);
  });

  it('Summe erreichbar → leer', () => {
    const c = card([{ type: 'sumAnyTuple', sum: 9 }]);
    const result = computeNeededValues([c], [pearl(5), pearl(4)], 0, []);
    expect(result.size).toBe(0);
  });
});

describe('sumTuple-Kostentyp', () => {
  it('n Karten die sum ergeben fehlen → Wert benötigt', () => {
    const c = card([{ type: 'sumTuple', n: 2, sum: 9 }]);
    const result = computeNeededValues([c], [pearl(3)], 0, []);
    expect(result.size).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// diamond
// ---------------------------------------------------------------------------

describe('diamond-Kostentyp', () => {
  it('Diamond-Kosten erzeugen keine Perlenbedürfnisse', () => {
    const c = card([{ type: 'diamond', value: 1 }]);
    // Kein Diamant vorhanden → Karte nicht zahlbar, aber keine Perlen nötig
    const result = computeNeededValues([c], [], 0, []);
    expect(result.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Ability-Modifikationen
// ---------------------------------------------------------------------------

describe('onesCanBeEights', () => {
  it('1 auf Hand ersetzt benötigte 8', () => {
    const c = card([{ type: 'number', value: 8 }]);
    const result = computeNeededValues([c], [pearl(1)], 0, [ability('onesCanBeEights')]);
    expect(result.has(8)).toBe(false);
  });

  it('ohne 1 auf Hand bleibt 8 benötigt und 1 wird hinzugefügt', () => {
    const c = card([{ type: 'number', value: 8 }]);
    const result = computeNeededValues([c], [], 0, [ability('onesCanBeEights')]);
    expect(result.has(8)).toBe(true);
    expect(result.has(1)).toBe(true);
  });
});

describe('threesCanBeAny', () => {
  it('3 auf Hand deckt einen fehlenden Wert', () => {
    const c = card([{ type: 'number', value: 7 }]);
    const result = computeNeededValues([c], [pearl(3)], 0, [ability('threesCanBeAny')]);
    expect(result.has(7)).toBe(false);
  });

  it('3 wird als nützlich markiert wenn noch Bedarf', () => {
    const c = card([{ type: 'number', value: 5 }, { type: 'number', value: 6 }]);
    // Hand leer, needed = {5, 6}, Fähigkeit threesCanBeAny: eine 3 würde einen decken
    const result = computeNeededValues([c], [], 0, [ability('threesCanBeAny')]);
    expect(result.has(3)).toBe(true);
  });
});

describe('decreaseWithPearl', () => {
  it('X+1 wird als Alternative zu X erkannt wenn Diamant vorhanden', () => {
    const c = card([{ type: 'number', value: 5 }]);
    const result = computeNeededValues([c], [], 1, [ability('decreaseWithPearl')]);
    expect(result.has(5)).toBe(true);
    expect(result.has(6)).toBe(true); // 6 kann per Diamant zu 5 werden
  });

  it('ohne Diamant kein X+1', () => {
    const c = card([{ type: 'number', value: 5 }]);
    const result = computeNeededValues([c], [], 0, [ability('decreaseWithPearl')]);
    expect(result.has(6)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Union über mehrere Portal-Karten
// ---------------------------------------------------------------------------

describe('Union über mehrere Portal-Karten', () => {
  it('Wert der für beide Karten hilft erscheint einmal', () => {
    const a = card([{ type: 'number', value: 5 }], 'a');
    const b = card([{ type: 'number', value: 5 }], 'b');
    const result = computeNeededValues([a, b], [], 0, []);
    expect(result.has(5)).toBe(true);
    expect(result.size).toBe(1);
  });

  it('Werte beider Karten in Union', () => {
    const a = card([{ type: 'number', value: 3 }], 'a');
    const b = card([{ type: 'number', value: 7 }], 'b');
    const result = computeNeededValues([a, b], [], 0, []);
    expect(result.has(3)).toBe(true);
    expect(result.has(7)).toBe(true);
  });

  it('eine Karte zahlbar → nur andere Karte trägt bei', () => {
    const a = card([{ type: 'number', value: 5 }], 'a');
    const b = card([{ type: 'number', value: 7 }], 'b');
    // Hand hat 5 → Karte a zahlbar, nur Karte b trägt bei
    const result = computeNeededValues([a, b], [pearl(5)], 0, []);
    expect(result.has(5)).toBe(false);
    expect(result.has(7)).toBe(true);
  });
});
