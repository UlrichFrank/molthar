/**
 * hist — fast, histogram-based payability checks for bot planning.
 *
 * A hand is represented as counts per pearl value (index 1..8, index 0 unused).
 * `canPayHist` decides whether a cost can be covered by some sub-multiset of the
 * histogram. It is only used for *planning* (deficits, probabilities); actual
 * payments are still built with the game's own `findCostAssignment`.
 */

import type { CostComponent } from '@portale-von-molthar/shared';

export type Hist = number[]; // length 9

export function emptyHist(): Hist {
  return [0, 0, 0, 0, 0, 0, 0, 0, 0];
}

export function histOf(values: number[]): Hist {
  const h = emptyHist();
  for (const v of values) h[v]!++;
  return h;
}

/** Numeric key: 4 bits per value (counts < 16). */
export function histNum(h: Hist): number {
  let k = 0;
  for (let v = 8; v >= 1; v--) k = k * 16 + Math.min(15, h[v]!);
  return k;
}

export function histKey(h: Hist): string {
  return String(histNum(h));
}

export function extrasNum(x: PayExtras): number {
  return Math.min(15, x.diamonds) + (Math.min(3, x.wild) << 4) + (x.onesCanBeEights ? 64 : 0) + (x.threesCanBeAny ? 128 : 0);
}

/** Per-cost memo tables keyed by numeric hist/extras keys. */
export function costTable<T>(store: Map<string, Map<number, T>>, cost: CostComponent[]): Map<number, T> {
  const k = costKey(cost);
  let t = store.get(k);
  if (!t) {
    t = new Map();
    store.set(k, t);
  }
  return t;
}

export function histSize(h: Hist): number {
  let n = 0;
  for (let v = 1; v <= 8; v++) n += h[v]!;
  return n;
}

/** Wildcards (printed "any" pearls) are tried as every value. */
export interface PayExtras {
  diamonds: number;
  wild: number;
  onesCanBeEights: boolean;
  threesCanBeAny: boolean;
}

const ORDER: Record<CostComponent['type'], number> = {
  diamond: 0, number: 1, tripleChoice: 2, nTuple: 3, run: 4, sumTuple: 5,
  evenTuple: 6, oddTuple: 6, sumAnyTuple: 7,
};

const sortedCache = new WeakMap<CostComponent[], CostComponent[]>();
function sortedCost(cost: CostComponent[]): CostComponent[] {
  let s = sortedCache.get(cost);
  if (!s) {
    s = [...cost].sort((a, b) => ORDER[a.type] - ORDER[b.type]);
    sortedCache.set(cost, s);
  }
  return s;
}

const costKeyCache = new WeakMap<CostComponent[], string>();
export function costKey(cost: CostComponent[]): string {
  let k = costKeyCache.get(cost);
  if (!k) {
    k = JSON.stringify(cost);
    costKeyCache.set(cost, k);
  }
  return k;
}

/** Enumerate sub-multisets of `h` with `size` cards (or any size if -1) matching filter & sum. */
function forEachSubset(
  h: Hist,
  size: number,
  sum: number, // -1 = no sum constraint
  allowed: (v: number) => boolean,
  cb: () => boolean, // h is mutated in place (cards removed) during callback; return true to stop
): boolean {
  const rec = (v: number, left: number, sumLeft: number): boolean => {
    if ((size === -1 || left === 0) && (sum === -1 || sumLeft === 0)) {
      if (size !== -1 || sum !== -1) {
        if (cb()) return true;
      }
      if (size !== -1) return false; // exact size reached
      if (sumLeft === 0) return false;
    }
    if (v > 8) return false;
    if (size !== -1 && left <= 0) return false;
    if (sum !== -1 && sumLeft < v) return false;
    // skip value v
    if (rec(v + 1, left, sumLeft)) return true;
    if (!allowed(v)) return false;
    const max = h[v]!;
    let taken = 0;
    for (let k = 1; k <= max; k++) {
      if (size !== -1 && k > left) break;
      if (sum !== -1 && k * v > sumLeft) break;
      h[v]!--; taken++;
      if (rec(v + 1, left - k, sum === -1 ? -1 : sumLeft - k * v)) { h[v]! += taken; return true; }
    }
    h[v]! += taken;
    return false;
  };
  return rec(1, size, sum);
}

function payRec(cost: CostComponent[], i: number, h: Hist, diamonds: number): boolean {
  if (i >= cost.length) return true;
  const c = cost[i]!;
  const next = () => payRec(cost, i + 1, h, diamonds);
  switch (c.type) {
    case 'diamond':
      return diamonds >= (c.value ?? 1) && payRec(cost, i + 1, h, diamonds - (c.value ?? 1));
    case 'number': {
      const v = c.value!;
      if (h[v]! < 1) return false;
      h[v]!--;
      const ok = next();
      h[v]!++;
      return ok;
    }
    case 'tripleChoice': {
      for (const v of [c.value1 ?? 3, c.value2 ?? 6]) {
        if (h[v]! >= 3) {
          h[v]! -= 3;
          const ok = next();
          h[v]! += 3;
          if (ok) return true;
        }
      }
      return false;
    }
    case 'nTuple': {
      const n = c.n ?? 2;
      for (let v = 1; v <= 8; v++) {
        if (h[v]! >= n) {
          h[v]! -= n;
          const ok = next();
          h[v]! += n;
          if (ok) return true;
        }
      }
      return false;
    }
    case 'run': {
      const L = c.length ?? 3;
      for (let s = 1; s + L - 1 <= 8; s++) {
        let ok = true;
        for (let v = s; v < s + L; v++) if (h[v]! < 1) { ok = false; break; }
        if (!ok) continue;
        for (let v = s; v < s + L; v++) h[v]!--;
        const r = next();
        for (let v = s; v < s + L; v++) h[v]!++;
        if (r) return true;
      }
      return false;
    }
    case 'sumTuple':
      return forEachSubset(h, c.n ?? 3, c.sum ?? 0, () => true, next);
    case 'sumAnyTuple':
      return forEachSubset(h, -1, c.sum ?? 0, () => true, next);
    case 'evenTuple':
      return forEachSubset(h, c.n ?? 3, -1, v => v % 2 === 0, next);
    case 'oddTuple':
      return forEachSubset(h, c.n ?? 3, -1, v => v % 2 === 1, next);
    default:
      return false;
  }
}

const payMemo = new Map<string, Map<number, boolean>>();

/** Can `cost` be paid from histogram `h` (plus extras)? Memoised. */
export function canPayHist(cost: CostComponent[], h: Hist, x: PayExtras): boolean {
  const t = costTable(payMemo, cost);
  const key = histNum(h) * 256 + extrasNum(x);
  const hit = t.get(key);
  if (hit !== undefined) return hit;
  if (t.size > 300_000) t.clear();
  const res = canPayFlex(sortedCost(cost), [...h], x);
  t.set(key, res);
  return res;
}

function canPayFlex(cost: CostComponent[], h: Hist, x: PayExtras): boolean {
  if (x.wild > 0) {
    for (let v = 1; v <= 8; v++) {
      h[v]!++;
      const ok = canPayFlex(cost, h, { ...x, wild: x.wild - 1 });
      h[v]!--;
      if (ok) return true;
    }
    return false;
  }
  if (payRec(cost, 0, h, x.diamonds)) return true;
  if (x.onesCanBeEights && h[1]! > 0) {
    h[1]!--; h[8]!++;
    const ok = canPayFlex(cost, h, { ...x, onesCanBeEights: false });
    h[1]!++; h[8]!--;
    if (ok) return true;
  }
  if (x.threesCanBeAny && h[3]! > 0) {
    for (let v = 1; v <= 8; v++) {
      if (v === 3) continue;
      h[3]!--; h[v]!++;
      const ok = canPayFlex(cost, h, { ...x, threesCanBeAny: false });
      h[3]!++; h[v]!--;
      if (ok) return true;
    }
  }
  return false;
}

/** Number of cards a cost consumes at minimum (used to cap search depth). */
export function cardsNeeded(cost: CostComponent[]): number {
  let n = 0;
  for (const c of cost) {
    switch (c.type) {
      case 'number': n += 1; break;
      case 'nTuple': n += c.n ?? 2; break;
      case 'tripleChoice': n += 3; break;
      case 'run': n += c.length ?? 3; break;
      case 'sumTuple': case 'evenTuple': case 'oddTuple': n += c.n ?? 3; break;
      case 'sumAnyTuple': n += Math.ceil((c.sum ?? 0) / 8); break;
      default: break;
    }
  }
  return n;
}
