/**
 * botNeededValues — berechnet welche Perlenwerte ein NPC-Bot noch benötigt.
 *
 * Kernfunktion: computeNeededValues()
 *
 * Statt eines graduierten Scores gibt diese Funktion eine binäre Menge zurück:
 * "Diese Perlenwerte (1–8) würden meinen Fortschritt zur Aktivierung erhöhen."
 *
 * Alle Portal-Karten werden als Union betrachtet — eine Perle ist nützlich
 * wenn sie für IRGENDEINE Karte den Fortschritt erhöht.
 */

import type { CharacterCard, CharacterAbility, PearlCard, CostComponent } from './types.js';
import { findCostAssignment } from './costCalculation.js';

type PearlValue = PearlCard['value']; // 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
const EVEN_VALUES: PearlValue[] = [2, 4, 6, 8];
const ODD_VALUES: PearlValue[] = [1, 3, 5, 7];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Berechnet die Menge der Perlenwerte die den Bot näher zur Aktivierung bringen.
 *
 * @param cards          Alle Portal-Karten des Bots
 * @param hand           Aktuelle Handkarten
 * @param diamonds       Anzahl verfügbarer Diamanten
 * @param activeAbilities Aktive blaue Fähigkeiten des Spielers
 * @param virtualPearls  Virtuelle Perlen aus Karten-Fähigkeiten (numberAdditionalCard etc.)
 */
export function computeNeededValues(
  cards: CharacterCard[],
  hand: PearlCard[],
  diamonds: number,
  activeAbilities: CharacterAbility[],
  virtualPearls: Array<PearlValue | 'any'> = [],
): Set<PearlValue> {
  const needed = new Set<PearlValue>();

  for (const card of cards) {
    const cardNeeded = neededForCard(card, hand, diamonds, virtualPearls);
    for (const v of cardNeeded) needed.add(v);
  }

  // Post-processing: Ability-Modifikationen
  applyAbilityModifications(needed, hand, diamonds, activeAbilities);

  return needed;
}

// ---------------------------------------------------------------------------
// Per-Card Berechnung
// ---------------------------------------------------------------------------

function neededForCard(
  card: CharacterCard,
  hand: PearlCard[],
  diamonds: number,
  virtualPearls: Array<PearlValue | 'any'>,
): Set<PearlValue> {
  // Bereits vollständig zahlbar → nichts nötig
  if (findCostAssignment(card.cost, hand, diamonds) !== null) {
    return new Set();
  }

  const needed = new Set<PearlValue>();

  // Virtuelle Perlen zur Hand hinzufügen für die Berechnung
  const effectiveHand = buildEffectiveHand(hand, virtualPearls, card.cost);

  // Greedy component assignment: versuche Komponenten nacheinander zu erfüllen
  // Verbleibende Handkarten für jede Komponente tracken
  const remaining = [...effectiveHand];

  for (const comp of card.cost) {
    const result = tryFulfillComponent(comp, remaining, diamonds);
    if (result.fulfilled) {
      // Verbrauchte Karten aus remaining entfernen
      for (const idx of result.usedIndices.sort((a, b) => b - a)) {
        remaining.splice(idx, 1);
      }
      if (result.usedDiamond) diamonds = Math.max(0, diamonds - 1);
    } else {
      // Komponente nicht erfüllbar → benötigte Werte berechnen
      const missing = missingForComponent(comp, remaining);
      for (const v of missing) needed.add(v);
    }
  }

  return needed;
}

// ---------------------------------------------------------------------------
// Virtuelle Hand (numberAdditionalCardActions / anyAdditionalCardActions)
// ---------------------------------------------------------------------------

function buildEffectiveHand(
  hand: PearlCard[],
  virtualPearls: Array<PearlValue | 'any'>,
  cost: CostComponent[],
): PearlCard[] {
  const effective = [...hand];
  let idCounter = 0;

  for (const vp of virtualPearls) {
    if (vp === 'any') {
      // Wildcard: wähle den Wert der am meisten fehlt (Heuristik: ersten fehlenden Wert für erste number-Komponente)
      const firstNumberComp = cost.find(c => c.type === 'number' && c.value !== undefined);
      const wildcardValue = (firstNumberComp?.value as PearlValue | undefined) ?? 1;
      effective.push({ id: `__virtual_any_${idCounter++}`, value: wildcardValue, hasSwapSymbol: false, hasRefreshSymbol: false });
    } else {
      effective.push({ id: `__virtual_${vp}_${idCounter++}`, value: vp, hasSwapSymbol: false, hasRefreshSymbol: false });
    }
  }

  return effective;
}

// ---------------------------------------------------------------------------
// Komponenten-Erfüllung (greedy)
// ---------------------------------------------------------------------------

interface FulfillResult {
  fulfilled: boolean;
  usedIndices: number[];
  usedDiamond: boolean;
}

function tryFulfillComponent(
  comp: CostComponent,
  hand: PearlCard[],
  diamonds: number,
): FulfillResult {
  const no: FulfillResult = { fulfilled: false, usedIndices: [], usedDiamond: false };

  switch (comp.type) {
    case 'number': {
      const v = comp.value!;
      const idx = hand.findIndex(p => p.value === v);
      if (idx >= 0) return { fulfilled: true, usedIndices: [idx], usedDiamond: false };
      return no;
    }

    case 'nTuple': {
      const v = comp.value!;
      const n = comp.n!;
      const indices = hand.map((p, i) => (p.value === v ? i : -1)).filter(i => i >= 0);
      if (indices.length >= n) return { fulfilled: true, usedIndices: indices.slice(0, n), usedDiamond: false };
      return no;
    }

    case 'evenTuple': {
      const n = comp.n!;
      const indices = hand.map((p, i) => (p.value % 2 === 0 ? i : -1)).filter(i => i >= 0);
      if (indices.length >= n) return { fulfilled: true, usedIndices: indices.slice(0, n), usedDiamond: false };
      return no;
    }

    case 'oddTuple': {
      const n = comp.n!;
      const indices = hand.map((p, i) => (p.value % 2 !== 0 ? i : -1)).filter(i => i >= 0);
      if (indices.length >= n) return { fulfilled: true, usedIndices: indices.slice(0, n), usedDiamond: false };
      return no;
    }

    case 'run': {
      const length = comp.length!;
      // Versuche alle möglichen Startpositionen
      for (let start = 1; start <= 9 - length; start++) {
        const runValues = Array.from({ length }, (_, i) => start + i);
        const usedIndices: number[] = [];
        const remaining = [...hand];
        let ok = true;
        for (const rv of runValues) {
          const idx = remaining.findIndex(p => p.value === rv);
          if (idx < 0) { ok = false; break; }
          usedIndices.push(hand.indexOf(remaining[idx]!));
          remaining.splice(idx, 1);
        }
        if (ok) return { fulfilled: true, usedIndices, usedDiamond: false };
      }
      return no;
    }

    case 'sumAnyTuple': {
      const target = comp.sum!;
      // Greedy: nimm Karten absteigend bis Summe erreicht
      const sorted = hand
        .map((p, i) => ({ value: p.value, idx: i }))
        .sort((a, b) => b.value - a.value);
      let sum = 0;
      const usedIndices: number[] = [];
      for (const { value, idx } of sorted) {
        if (sum >= target) break;
        sum += value;
        usedIndices.push(idx);
      }
      if (sum >= target) return { fulfilled: true, usedIndices, usedDiamond: false };
      return no;
    }

    case 'sumTuple': {
      const target = comp.sum!;
      const n = comp.n!;
      // Versuche n Karten die target summieren (greedy)
      if (hand.length < n) return no;
      const sorted = hand
        .map((p, i) => ({ value: p.value, idx: i }))
        .sort((a, b) => b.value - a.value);
      const usedIndices = sorted.slice(0, n).map(x => x.idx);
      const sum = usedIndices.reduce((s, i) => s + hand[i]!.value, 0);
      if (sum >= target) return { fulfilled: true, usedIndices, usedDiamond: false };
      return no;
    }

    case 'tripleChoice': {
      const v1 = comp.value1!;
      const v2 = comp.value2!;
      const idx1 = hand.findIndex(p => p.value === v1);
      if (idx1 >= 0) return { fulfilled: true, usedIndices: [idx1], usedDiamond: false };
      const idx2 = hand.findIndex(p => p.value === v2);
      if (idx2 >= 0) return { fulfilled: true, usedIndices: [idx2], usedDiamond: false };
      return no;
    }

    case 'diamond': {
      const required = comp.value ?? 1;
      if (diamonds >= required) return { fulfilled: true, usedIndices: [], usedDiamond: true };
      return no;
    }

    default:
      return no;
  }
}

// ---------------------------------------------------------------------------
// Welche Werte würden diese Komponente erfüllen?
// ---------------------------------------------------------------------------

function missingForComponent(comp: CostComponent, hand: PearlCard[]): Set<PearlValue> {
  const missing = new Set<PearlValue>();

  switch (comp.type) {
    case 'number': {
      const v = comp.value as PearlValue;
      if (!hand.some(p => p.value === v)) missing.add(v);
      break;
    }

    case 'nTuple': {
      const v = comp.value as PearlValue;
      const have = hand.filter(p => p.value === v).length;
      if (have < comp.n!) missing.add(v);
      break;
    }

    case 'evenTuple': {
      const have = hand.filter(p => p.value % 2 === 0).length;
      if (have < comp.n!) {
        for (const v of EVEN_VALUES) missing.add(v);
      }
      break;
    }

    case 'oddTuple': {
      const have = hand.filter(p => p.value % 2 !== 0).length;
      if (have < comp.n!) {
        for (const v of ODD_VALUES) missing.add(v);
      }
      break;
    }

    case 'run': {
      const length = comp.length!;
      const handValues = new Set(hand.map(p => p.value));

      // Finde die Folge mit der besten Überlappung
      let bestOverlap = -1;
      let bestMissing: PearlValue[] = [];

      for (let start = 1; start <= 9 - length; start++) {
        const runValues = Array.from({ length }, (_, i) => (start + i) as PearlValue);
        const overlap = runValues.filter(v => handValues.has(v)).length;
        const runMissing = runValues.filter(v => !handValues.has(v));
        if (overlap > bestOverlap) {
          bestOverlap = overlap;
          bestMissing = runMissing;
        }
      }

      for (const v of bestMissing) missing.add(v);
      break;
    }

    case 'sumAnyTuple': {
      const target = comp.sum!;
      const currentSum = hand.reduce((s, p) => s + p.value, 0);
      const remainder = target - currentSum;
      if (remainder > 0 && remainder <= 8) {
        missing.add(remainder as PearlValue);
      } else if (remainder > 8) {
        // Jede Perle hilft — nimm den größtmöglichen Wert
        missing.add(8);
      }
      break;
    }

    case 'sumTuple': {
      const target = comp.sum!;
      const n = comp.n!;
      const currentSum = hand.slice(0, Math.min(hand.length, n)).reduce((s, p) => s + p.value, 0);
      const remainder = target - currentSum;
      if (remainder > 0 && remainder <= 8) {
        missing.add(remainder as PearlValue);
      } else if (remainder > 8) {
        missing.add(8);
      }
      break;
    }

    case 'tripleChoice': {
      const v1 = comp.value1 as PearlValue;
      const v2 = comp.value2 as PearlValue;
      if (!hand.some(p => p.value === v1)) missing.add(v1);
      if (!hand.some(p => p.value === v2)) missing.add(v2);
      break;
    }

    case 'diamond':
      // Diamanten sind keine Perlen → kein Beitrag
      break;

    default:
      break;
  }

  return missing;
}

// ---------------------------------------------------------------------------
// Ability-Modifikationen (Post-Processing)
// ---------------------------------------------------------------------------

function applyAbilityModifications(
  needed: Set<PearlValue>,
  hand: PearlCard[],
  diamonds: number,
  activeAbilities: CharacterAbility[],
): void {
  const abilityTypes = new Set(activeAbilities.map(a => a.type));

  // onesCanBeEights: 1 zählt als 8
  if (abilityTypes.has('onesCanBeEights')) {
    const onesOnHand = hand.filter(p => p.value === 1).length;
    if (onesOnHand > 0 && needed.has(8)) {
      needed.delete(8); // 1 deckt den Bedarf nach 8
    }
    if (needed.has(8)) {
      needed.add(1); // 1 wäre auch nützlich, da es als 8 zählt
    }
  }

  // threesCanBeAny: jede 3 auf Hand ist Wildcard → deckt einen beliebigen Bedarf
  if (abilityTypes.has('threesCanBeAny')) {
    const threesOnHand = hand.filter(p => p.value === 3).length;
    let wildcardCount = threesOnHand;
    for (const v of [...needed]) {
      if (wildcardCount <= 0) break;
      needed.delete(v);
      wildcardCount--;
    }
    // 3 auf Hand ist immer nützlich wenn noch etwas fehlt (da Wildcard)
    if (needed.size > 0) needed.add(3);
  }

  // decreaseWithPearl: Diamant vorhanden → Perle X+1 kann als X gezählt werden
  if (abilityTypes.has('decreaseWithPearl') && diamonds > 0) {
    const extras: PearlValue[] = [];
    for (const v of needed) {
      if (v < 8) extras.push((v + 1) as PearlValue);
    }
    for (const v of extras) needed.add(v);
  }
}
