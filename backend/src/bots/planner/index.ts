/**
 * planner — probability-based move selection for NPC bots.
 *
 * Core idea: estimate the expected number of *actions* still needed to reach
 * the 12-point threshold ("ETA") and pick the action that minimises it.
 *
 *  - expActions(card, hand): expected actions to make a card payable. At each
 *    step the bot either takes a visible useful pearl (1 action) or digs for
 *    one — blind draw (1/p) or refreshing the display (1/(1-(1-p)^4) + 1),
 *    where p is the probability that an unknown pearl is useful. The unknown
 *    pool only uses public information (own hand, display, discard pile).
 *  - eta(state): best plan of up to two character cards (portal or display)
 *    plus a generic rate for any points still missing afterwards.
 *  - On the last turn of the game the bot instead maximises points reachable
 *    within the remaining actions (exhaustive search over certain moves).
 *
 * Personalities plug in via PlannerParams (temperature, diamond value,
 * ability appetite, opponent denial weight, red-ability preference).
 */

import type {
  GameState,
  CharacterCard,
  PearlCard,
  PaymentSelection,
  PlayerState,
  CostComponent,
} from '@portale-von-molthar/shared';
import { findCostAssignment, FINAL_ROUND_POWER_THRESHOLD } from '@portale-von-molthar/shared';
import type { BotAction } from '../enumerate';
import { canPayHist, costKey as costKeyOf, costTable, emptyHist, extrasNum, histKey, histNum, histOf, histSize } from './hist';
import type { Hist, PayExtras } from './hist';

// ---------------------------------------------------------------------------
// Parameters
// ---------------------------------------------------------------------------

export interface PlannerParams {
  /** Softmax temperature over ETA (actions). 0 = always best. */
  temperature: number;
  /** Generic cost in actions per missing point beyond the planned cards. */
  rate: number;
  /** Action-equivalent value of one diamond reward. */
  diamondValue: number;
  /** Multiplier on ability values (engine appetite). */
  abilityWeight: number;
  /** Weight of opponent ETA increase (denial). 0 = ignore opponents. */
  denyWeight: number;
  /** Extra action-equivalent bonus for red attack abilities. */
  redBonus: number;
  /** Penalty (actions) per unused pearl in hand above this many — hand clutter. */
  clutterFrom: number;
  clutterCost: number;
  /** Cost multiplier for the second card of a plan (uncertainty discount). */
  secondCardWeight: number;
  /** Action cost per expected hand-limit overflow (forced discard ends the turn). */
  overflowCost: number;
  /** Additive bias on the display-refresh option (positive = refresh less). */
  refreshBias: number;
  /** Extra actions charged once when points must come from cards not yet visible. */
  restPenalty: number;
  /** Extra cost for discarding a portal card to make room (hysteresis against churn). */
  swapMargin: number;
}

export const DEFAULT_PARAMS: PlannerParams = {
  temperature: 0,
  rate: 3.5,
  diamondValue: 0.3,
  abilityWeight: 1,
  denyWeight: 0,
  redBonus: 0,
  clutterFrom: 5,
  clutterCost: 0,
  secondCardWeight: 1,
  overflowCost: 1.5,
  refreshBias: 1.0,
  restPenalty: 3,
  swapMargin: 0,
};

const BIG = 30;
const REFRESH_SAMPLES = 8;

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface PrintedSource { characterId: string; value: number | null } // null = wildcard

interface Ctx {
  G: GameState;
  me: PlayerState;
  params: PlannerParams;
  extras: PayExtras;
  printed: PrintedSource[];
  /** Probability that an unknown pearl has value v (index 1..8). */
  q: number[];
  handLimit: number;
  actionsLeft: number;
  memoE: Map<string, number>;
  memoEta: Map<string, number>;
}

function abilityTypes(p: PlayerState): Set<string> {
  return new Set(p.activeAbilities.map(a => a.type));
}

function printedSources(p: PlayerState, G?: GameState): PrintedSource[] {
  const used = new Set(G?.usedAbilitySourceCharacterIds ?? []);
  const out: PrintedSource[] = [];
  for (const ac of p.activatedCharacters) {
    if (used.has(ac.id)) continue;
    for (const ab of ac.card.abilities) {
      if (ab.type === 'numberAdditionalCardActions') {
        const v = ac.card.printedPearls?.[0] && 'value' in ac.card.printedPearls[0]
          ? (ac.card.printedPearls[0] as { value: number }).value
          : null;
        if (v) out.push({ characterId: ac.id, value: v });
      } else if (ab.type === 'anyAdditionalCardActions') {
        out.push({ characterId: ac.id, value: null });
      }
    }
  }
  return out;
}

function unknownPool(G: GameState, me: PlayerState): number[] {
  const known = emptyHist();
  for (const c of me.hand) known[c.value]!++;
  for (const c of G.pearlSlots) if (c) known[c.value]!++;
  for (const c of G.pearlDiscardPile) known[c.value]!++;
  const q = [0];
  let total = 0;
  for (let v = 1; v <= 8; v++) {
    const n = Math.max(0.25, 7 - known[v]!);
    q.push(n);
    total += n;
  }
  for (let v = 1; v <= 8; v++) q[v] = q[v]! / total;
  return q;
}

function buildCtx(G: GameState, playerID: string, params: PlannerParams): Ctx {
  const me = G.players[playerID]!;
  const ab = abilityTypes(me);
  const printed = printedSources(me);
  const usedTypes = new Set(G.usedPaymentAbilityTypes ?? []);
  return {
    G,
    me,
    params,
    printed,
    extras: {
      diamonds: me.diamondCards.length,
      wild: 0,
      onesCanBeEights: ab.has('onesCanBeEights') && !usedTypes.has('onesCanBeEights'),
      threesCanBeAny: ab.has('threesCanBeAny') && !usedTypes.has('threesCanBeAny'),
    },
    q: unknownPool(G, me),
    handLimit: 5 + me.handLimitModifier,
    actionsLeft: Math.max(0, G.maxActions - G.actionCount),
    memoE: new Map(),
    memoEta: new Map(),
  };
}

/** Hand histogram including printed pearls (planning view). */
function planHist(hand: Hist, ctx: Ctx): { h: Hist; x: PayExtras } {
  const h = [...hand];
  let wild = 0;
  for (const s of ctx.printed) {
    if (s.value === null) wild++;
    else h[s.value]!++;
  }
  return { h, x: { ...ctx.extras, wild } };
}

// ---------------------------------------------------------------------------
// Deficit & expected actions
// ---------------------------------------------------------------------------

const deficitMemo = new Map<string, Map<number, number>>();

function diamondCost(cost: CostComponent[]): number {
  return cost.filter(c => c.type === 'diamond').reduce((n, c) => n + (c.value ?? 1), 0);
}

/** Minimum number of extra pearls needed to pay `cost` from `h` (BIG if impossible). */
export function deficit(cost: CostComponent[], h: Hist, x: PayExtras, depth = 0): number {
  if (diamondCost(cost) > x.diamonds) return BIG;
  if (canPayHist(cost, h, x)) return 0;
  if (depth > 7) return BIG;
  const t = costTable(deficitMemo, cost);
  const key = histNum(h) * 256 + extrasNum(x);
  const hit = t.get(key);
  if (hit !== undefined) return hit;
  if (t.size > 300_000) t.clear();
  let best = BIG;
  for (let v = 1; v <= 8; v++) {
    h[v]!++;
    const d = deficit(cost, h, x, depth + 1);
    h[v]!--;
    if (d + 1 < best) best = d + 1;
    if (best === 1) break;
  }
  t.set(key, best);
  return best;
}

/**
 * Expected actions to make `cost` payable from hand `h` with display `vis`.
 * Includes only pearl acquisition, not the activation itself.
 */
function expActions(cost: CostComponent[], h: Hist, vis: Hist, x: PayExtras, ctx: Ctx): number {
  const d = deficit(cost, h, x);
  if (d === 0) return 0;
  if (d >= BIG) return BIG;
  const key = `${costKeyOf(cost)}|${histNum(h)}|${histNum(vis)}|${extrasNum(x)}`;
  const hit = ctx.memoE.get(key);
  if (hit !== undefined) return hit;

  let best = BIG;
  const useful: number[] = [];
  for (let v = 1; v <= 8; v++) {
    h[v]!++;
    const dv = deficit(cost, h, x);
    h[v]!--;
    if (dv < d) useful.push(v);
  }
  // Visible useful pearls: one action each.
  for (const v of useful) {
    if (vis[v]! > 0) {
      h[v]!++; vis[v]!--;
      const e = 1 + expActions(cost, h, vis, x, ctx);
      h[v]!--; vis[v]!++;
      if (e < best) best = e;
    }
  }
  // Digging: blind draw or display refresh, whichever is cheaper per useful hit.
  let p = 0;
  for (const v of useful) p += ctx.q[v]!;
  if (p > 0) {
    const draw = 1 / p;
    const refresh = 1 / (1 - Math.pow(1 - p, 4)) + 1;
    let cont = 0;
    for (const v of useful) {
      h[v]!++;
      cont += (ctx.q[v]! / p) * expActions(cost, h, vis, x, ctx);
      h[v]!--;
    }
    const e = Math.min(draw, refresh) + cont;
    if (e < best) best = e;
  }
  best = Math.min(best, BIG);
  ctx.memoE.set(key, best);
  return best;
}

/** Remove cards from `h` that `cost` does not need (keeps the deficit-preserving core). */
function coreFor(cost: CostComponent[], h: Hist, x: PayExtras): Hist {
  const d = deficit(cost, h, x);
  const core = [...h];
  for (let v = 1; v <= 8; v++) {
    while (core[v]! > 0) {
      core[v]!--;
      if (deficit(cost, core, x) !== d) { core[v]!++; break; }
    }
  }
  return core;
}

function subHist(a: Hist, b: Hist): Hist {
  return a.map((n, i) => Math.max(0, n - (b[i] ?? 0)));
}

// ---------------------------------------------------------------------------
// Ability valuation (in action equivalents)
// ---------------------------------------------------------------------------

function abilityValue(card: CharacterCard, ctx: Ctx, needAfter: number): number {
  const w = ctx.params.abilityWeight;
  let v = 0;
  const remainingActions = needAfter * ctx.params.rate;
  for (const ab of card.abilities) {
    switch (ab.type) {
      case 'threeExtraActions': v += 3; break;
      case 'oneExtraActionPerTurn': v += w * Math.min(4, remainingActions / 4); break;
      case 'numberAdditionalCardActions': v += w * Math.min(3, remainingActions / 4); break;
      case 'anyAdditionalCardActions': v += w * Math.min(4, remainingActions / 3); break;
      case 'handLimitPlusOne': v += w * 0.5; break;
      case 'onesCanBeEights': case 'threesCanBeAny': v += w * Math.min(1.5, remainingActions / 6); break;
      case 'nextPlayerOneExtraAction': v -= 0.5; break;
      case 'discardOpponentCharacter': case 'stealOpponentHandCard': v += ctx.params.redBonus + 0.5; break;
      case 'takeBackPlayedPearl': v += 0.5; break;
      case 'tradeTwoForDiamond': v += w * 0.3; break;
      default: break;
    }
  }
  return v + card.diamonds * ctx.params.diamondValue;
}

// ---------------------------------------------------------------------------
// ETA — expected actions until reaching the threshold
// ---------------------------------------------------------------------------

interface SimState {
  hand: Hist;
  portal: CharacterCard[];
  display: CharacterCard[];
  vis: Hist;
  points: number;
  diamonds: number;
}

interface Cand { card: CharacterCard; take: number; fromPortal: boolean }

function eta(s: SimState, ctx: Ctx): number {
  const need = FINAL_ROUND_POWER_THRESHOLD - s.points;
  if (need <= 0) return 0;
  const key = `${histNum(s.hand)}|${s.portal.map(c => c.id).join(',')}|${s.display.map(c => c.id).join(',')}|${histNum(s.vis)}|${s.points}|${s.diamonds}`;
  const hit = ctx.memoEta.get(key);
  if (hit !== undefined) return hit;
  const r = etaRaw(s, ctx, need);
  ctx.memoEta.set(key, r);
  return r;
}

function etaRaw(s: SimState, ctx: Ctx, need: number): number {
  const realHand = histSize(s.hand);
  const { h, x: x0 } = planHist(s.hand, ctx);
  const x = { ...x0, diamonds: s.diamonds };
  const p = ctx.params;

  const cands: Cand[] = [
    ...s.portal.map(card => ({ card, take: 0, fromPortal: true })),
    ...s.display.map(card => ({ card, take: 1, fromPortal: false })),
  ];
  const free = 2 - s.portal.length;

  const rest = (n: number) => (n > 0 ? n * p.rate + p.restPenalty : 0);
  let best = rest(need);
  const costA = cands.map(c => c.take + expActions(c.card.cost, [...h], [...s.vis], x, ctx) + 1);

  for (let i = 0; i < cands.length; i++) {
    const a = cands[i]!;
    if (costA[i]! >= BIG) continue;
    const ptsA = a.card.powerPoints;
    const needA = Math.max(0, need - ptsA);
    const dA = deficit(a.card.cost, [...h], x);
    const overflow = Math.max(0, realHand + dA - ctx.handLimit) * p.overflowCost;
    const valA = abilityValue(a.card, ctx, needA) - overflow;
    const single = costA[i]! - valA + rest(needA);
    if (single < best) best = single;
    if (needA === 0) continue;
    const coreA = coreFor(a.card.cost, h, x);
    const hB = subHist(h, coreA);
    for (let j = 0; j < cands.length; j++) {
      if (j === i) continue;
      const b = cands[j]!;
      const displayUsed = (a.fromPortal ? 0 : 1) + (b.fromPortal ? 0 : 1);
      const portalUsed = (a.fromPortal ? 1 : 0) + (b.fromPortal ? 1 : 0);
      if (displayUsed > free + (s.portal.length - portalUsed)) continue;
      const eB = expActions(b.card.cost, [...hB], [...s.vis], x, ctx);
      if (eB >= BIG) continue;
      const needB = Math.max(0, needA - b.card.powerPoints);
      const costB = (b.take + eB + 1) * p.secondCardWeight;
      const total = costA[i]! + costB - valA - abilityValue(b.card, ctx, needB) + rest(needB);
      if (total < best) best = total;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Payment (ability-aware)
// ---------------------------------------------------------------------------

/**
 * Build a payment for `card`, optionally using printed pearls of activated
 * characters and onesCanBeEights / threesCanBeAny conversions. Returns all
 * candidate payments found (different hand orderings) so the caller can pick
 * the one leaving the best hand.
 */
export function buildPayments(G: GameState, playerID: string, card: CharacterCard): PaymentSelection[][] {
  const me = G.players[playerID]!;
  const hand = me.hand;
  const diamonds = me.diamondCards.length;
  const sources = printedSources(me, G);
  const ab = abilityTypes(me);
  const usedTypes = new Set(G.usedPaymentAbilityTypes ?? []);
  const results: PaymentSelection[][] = [];
  const seen = new Set<string>();

  type V = { card: PearlCard; sel: PaymentSelection };
  const base: V[] = hand.map((c, i) => ({ card: c, sel: { source: 'hand', handCardIndex: i, value: c.value } as PaymentSelection }));

  // Variants of the virtual hand.
  const variants: V[][] = [];
  const printedVariants: V[][] = [[]];
  for (const s of sources) {
    const next: V[][] = [];
    const values = s.value === null ? [1, 2, 3, 4, 5, 6, 7, 8] : [s.value];
    for (const pv of printedVariants) {
      next.push(pv);
      for (const v of values) {
        next.push([...pv, {
          card: { id: `virt-${s.characterId}`, value: v as PearlCard['value'], hasSwapSymbol: false, hasRefreshSymbol: false },
          sel: { source: 'ability', characterId: s.characterId, value: v } as PaymentSelection,
        }]);
      }
    }
    printedVariants.splice(0, printedVariants.length, ...next.slice(0, 40));
  }
  const conv: V[][] = [base];
  if (ab.has('onesCanBeEights') && !usedTypes.has('onesCanBeEights')) {
    hand.forEach((c, i) => {
      if (c.value !== 1) return;
      const b = [...base];
      b[i] = { card: { ...c, value: 8 }, sel: { source: 'hand', handCardIndex: i, value: 8, abilityType: 'onesCanBeEights' } as PaymentSelection };
      conv.push(b);
    });
  }
  if (ab.has('threesCanBeAny') && !usedTypes.has('threesCanBeAny')) {
    hand.forEach((c, i) => {
      if (c.value !== 3) return;
      for (let v = 1; v <= 8; v++) {
        if (v === 3) continue;
        const b = [...base];
        b[i] = { card: { ...c, value: v as PearlCard['value'] }, sel: { source: 'hand', handCardIndex: i, value: v, abilityType: 'threesCanBeAny' } as PaymentSelection };
        conv.push(b);
      }
    });
  }
  for (const c of conv) for (const pv of printedVariants) variants.push([...c, ...pv]);

  for (const vh of variants) {
    for (const order of ['asc', 'desc', 'orig'] as const) {
      const sorted = order === 'orig' ? vh : [...vh].sort((a, b) => order === 'asc' ? a.card.value - b.card.value : b.card.value - a.card.value);
      const assignment = findCostAssignment(card.cost, sorted.map(v => v.card), diamonds);
      if (!assignment) continue;
      const used = new Set<number>();
      for (const idxs of assignment.values()) for (const i of idxs) used.add(i);
      const sel = [...used].map(i => sorted[i]!.sel);
      // Printed pearls only make sense when used; abilityType conversions only when the card is used.
      const key = sel.map(s => `${s.source}:${s.handCardIndex ?? s.characterId}:${s.value}`).sort().join(',');
      if (seen.has(key)) continue;
      seen.add(key);
      results.push(sel);
      if (results.length >= 12) return results;
    }
    if (results.length > 0 && vh === variants[0]) {
      // Plain hand works — still look at a few variants to save pearls.
    }
  }
  // Prefer payments that use fewer real hand cards.
  results.sort((a, b) => a.filter(s => s.source === 'hand').length - b.filter(s => s.source === 'hand').length);
  return results;
}

// ---------------------------------------------------------------------------
// Action enumeration & evaluation
// ---------------------------------------------------------------------------

interface Option { action: BotAction; cost: number }

function stateOf(G: GameState, me: PlayerState): SimState {
  return {
    hand: histOf(me.hand.map(c => c.value)),
    portal: me.portal.map(e => e.card),
    display: [...G.characterSlots],
    vis: histOf(G.pearlSlots.filter((c): c is PearlCard => !!c).map(c => c.value)),
    points: me.powerPoints,
    diamonds: me.diamondCards.length,
  };
}

/** Clutter penalty: hand cards beyond what the plan can use make overflow likely. */
function handAfterOverflow(s: SimState, ctx: Ctx): { hand: Hist; lost: number } {
  if (histSize(s.hand) <= ctx.handLimit) return { hand: s.hand, lost: 0 };
  // Forced discard ends the turn: drop the card whose loss hurts least.
  let bestHand = s.hand;
  let bestEta = Infinity;
  for (let v = 1; v <= 8; v++) {
    if (s.hand[v]! === 0) continue;
    const h = [...s.hand];
    h[v]!--;
    const e = eta({ ...s, hand: h }, ctx);
    if (e < bestEta) { bestEta = e; bestHand = h; }
  }
  return { hand: bestHand, lost: Math.max(0, ctx.actionsLeft - 1) };
}

function evalTakePearl(s: SimState, v: number, fromVis: boolean, ctx: Ctx): number {
  const hand = [...s.hand];
  hand[v]!++;
  const vis = [...s.vis];
  if (fromVis) vis[v]!--;
  const next = { ...s, hand, vis };
  const { hand: h2, lost } = handAfterOverflow(next, ctx);
  return eta({ ...next, hand: h2 }, ctx) + lost;
}

function oppEta(G: GameState, oppId: string, vis: Hist, display: CharacterCard[], ctx: Ctx): number {
  const opp = G.players[oppId]!;
  // Hidden information: opponent hand values are unknown → plan from an empty hand,
  // which still tells us which visible pearls/cards help their portal most.
  const s: SimState = {
    hand: emptyHist(),
    portal: opp.portal.map(e => e.card),
    display,
    vis,
    points: opp.powerPoints,
    diamonds: opp.diamondCards.length,
  };
  return eta(s, { ...ctx, printed: printedSources(opp), extras: { ...ctx.extras, onesCanBeEights: false, threesCanBeAny: false } });
}

function leaderId(G: GameState, playerID: string): string | null {
  let best: string | null = null;
  let pts = -1;
  for (const p of Object.values(G.players)) {
    if (p.id === playerID) continue;
    if (p.powerPoints > pts) { pts = p.powerPoints; best = p.id; }
  }
  return best;
}

function isLastTurn(G: GameState): boolean {
  return G.finalRoundNumber !== null && G.roundNumber >= G.finalRoundNumber;
}

export function enumerateOptions(G: GameState, playerID: string, params: PlannerParams): Option[] {
  const ctx = buildCtx(G, playerID, params);
  const me = ctx.me;
  const s = stateOf(G, me);
  const opts: Option[] = [];
  const opp = params.denyWeight > 0 ? leaderId(G, playerID) : null;
  const oppBase = opp ? oppEta(G, opp, s.vis, s.display, ctx) : 0;
  const deny = (vis: Hist, display: CharacterCard[]) =>
    opp ? -params.denyWeight * (oppEta(G, opp, vis, display, ctx) - oppBase) : 0;

  // Activate portal cards.
  me.portal.forEach((entry, i) => {
    const payments = buildPayments(G, playerID, entry.card);
    let bestPay: PaymentSelection[] | null = null;
    let bestCost = Infinity;
    for (const pay of payments) {
      const hand = [...s.hand];
      for (const sel of pay) if (sel.source === 'hand') hand[me.hand[sel.handCardIndex!]!.value]!--;
      const portal = s.portal.filter((_, k) => k !== i);
      const points = s.points + entry.card.powerPoints;
      const diamondCost = entry.card.cost.filter(c => c.type === 'diamond').reduce((n, c) => n + (c.value ?? 1), 0);
      const next: SimState = { ...s, hand, portal, points, diamonds: s.diamonds - diamondCost + entry.card.diamonds };
      // Bank the ability/diamond value the plan credited to this card while it was pending.
      const c = eta(next, ctx) - abilityValue(entry.card, ctx, Math.max(0, FINAL_ROUND_POWER_THRESHOLD - points));
      if (c < bestCost) { bestCost = c; bestPay = pay; }
    }
    // Tiny tie-break: activating early frees hand space at no cost.
    if (bestPay) opts.push({ action: { move: 'activatePortalCard', args: [i, bestPay] }, cost: bestCost - 0.05 });
  });

  // Take visible pearls.
  G.pearlSlots.forEach((card, slot) => {
    if (!card) return;
    const vis = [...s.vis];
    vis[card.value]!--;
    opts.push({
      action: { move: 'takePearlCard', args: [slot] },
      cost: evalTakePearl(s, card.value, true, ctx) + deny(vis, s.display),
    });
  });

  // Blind draw (expectation over the unknown pool).
  if (G.pearlDeck.length + G.pearlDiscardPile.length > 0) {
    let c = 0;
    for (let v = 1; v <= 8; v++) c += ctx.q[v]! * evalTakePearl(s, v, false, ctx);
    opts.push({ action: { move: 'takePearlCard', args: [-1] }, cost: c });
  }

  // Refresh the display: average ETA over sampled new displays. The samples
  // are optimistic compared to the analytic dig cost, refreshBias corrects that.
  {
    let c = 0;
    for (let k = 0; k < REFRESH_SAMPLES; k++) {
      const vis = emptyHist();
      for (let j = 0; j < 4; j++) vis[sampleValue(ctx.q, k * 4 + j)]!++;
      c += eta({ ...s, vis }, ctx);
    }
    opts.push({ action: { move: 'replacePearlSlots', args: [] }, cost: c / REFRESH_SAMPLES + params.refreshBias });
  }

  // Take character cards.
  G.characterSlots.forEach((card, idx) => {
    const display = s.display.filter((_, k) => k !== idx);
    const d = deny(s.vis, display);
    if (s.portal.length < 2) {
      opts.push({ action: { move: 'takeCharacterCard', args: [idx] }, cost: eta({ ...s, portal: [...s.portal, card], display }, ctx) + d });
    } else {
      for (let slot = 0; slot < 2; slot++) {
        const portal = [...s.portal];
        portal[slot] = card;
        opts.push({ action: { move: 'takeCharacterCard', args: [idx, slot] }, cost: eta({ ...s, portal, display }, ctx) + d + params.swapMargin });
      }
    }
  });

  return opts;
}

/** Deterministic quasi-random value from the pool distribution (stable across options). */
function sampleValue(q: number[], k: number): number {
  const r = (k * 0.6180339887 + 0.31) % 1;
  let acc = 0;
  for (let v = 1; v <= 8; v++) {
    acc += q[v]!;
    if (r < acc) return v;
  }
  return 8;
}

// ---------------------------------------------------------------------------
// Last-turn search: maximise points within the remaining actions
// ---------------------------------------------------------------------------

function lastTurnBest(G: GameState, playerID: string): { action: BotAction; points: number } | null {
  const me = G.players[playerID]!;
  const ctx = buildCtx(G, playerID, DEFAULT_PARAMS);
  const startHand = histOf(me.hand.map(c => c.value));
  const vis0 = G.pearlSlots.filter((c): c is PearlCard => !!c).map(c => c.value);
  type Node = { hand: Hist; portal: CharacterCard[]; display: CharacterCard[]; vis: number[]; diamonds: number };
  let bestPts = 0;
  let bestFirst: BotAction | null = null;

  const rec = (n: Node, left: number, gained: number, first: BotAction | null) => {
    if (gained > bestPts) { bestPts = gained; bestFirst = first; }
    if (left === 0) return;
    const { h, x: x0 } = planHist(n.hand, ctx);
    const x = { ...x0, diamonds: n.diamonds };
    // activate
    n.portal.forEach((card, i) => {
      if (!canPayHist(card.cost, h, x)) return;
      const core = coreFor(card.cost, h, x);
      // Remove only real hand cards (printed pearls refresh each turn but are single-use).
      const hand = subHist(n.hand, core);
      const act: BotAction = { move: 'activatePortalCard', args: [i] };
      rec({ ...n, hand, portal: n.portal.filter((_, k) => k !== i) }, left - 1, gained + card.powerPoints, first ?? act);
    });
    // take visible pearl (only if hand has room — overflow ends the turn)
    if (histSize(n.hand) < ctx.handLimit) {
      const tried = new Set<number>();
      n.vis.forEach((v, k) => {
        if (tried.has(v)) return;
        tried.add(v);
        const hand = [...n.hand]; hand[v]!++;
        const slot = G.pearlSlots.findIndex(c => c?.value === v);
        const act: BotAction = { move: 'takePearlCard', args: [slot] };
        rec({ ...n, hand, vis: n.vis.filter((_, j) => j !== k) }, left - 1, gained, first ?? act);
      });
    }
    // take display card
    if (first === null) {
      n.display.forEach((card, idx) => {
        const display = n.display.filter((_, k) => k !== idx);
        if (n.portal.length < 2) {
          rec({ ...n, portal: [...n.portal, card], display }, left - 1, gained, { move: 'takeCharacterCard', args: [idx] });
        } else {
          for (let slot = 0; slot < 2; slot++) {
            const portal = [...n.portal]; portal[slot] = card;
            rec({ ...n, portal, display }, left - 1, gained, { move: 'takeCharacterCard', args: [idx, slot] });
          }
        }
      });
    }
  };
  rec({ hand: startHand, portal: me.portal.map(e => e.card), display: [...G.characterSlots], vis: vis0, diamonds: me.diamondCards.length },
    Math.min(ctx.actionsLeft, 4), 0, null);
  if (!bestFirst || bestPts === 0) return null;
  return { action: bestFirst, points: bestPts };
}

// ---------------------------------------------------------------------------
// Public entry points
// ---------------------------------------------------------------------------

export function planAction(G: GameState, playerID: string, params: PlannerParams): BotAction {
  const me = G.players[playerID];
  if (!me) return { event: 'endTurn' };

  if (isLastTurn(G)) {
    const last = lastTurnBest(G, playerID);
    if (last) {
      const a = last.action;
      if ('move' in a && a.move === 'activatePortalCard') {
        const idx = a.args![0] as number;
        const pays = buildPayments(G, playerID, me.portal[idx]!.card);
        if (pays[0]) return { move: 'activatePortalCard', args: [idx, pays[0]] };
      } else {
        return a;
      }
    }
  }

  const opts = enumerateOptions(G, playerID, params);
  if (process.env.PLANNER_DEBUG) {
    for (const o of opts) console.log('   opt', 'move' in o.action ? o.action.move + JSON.stringify(o.action.args?.slice(0, 2)).slice(0, 60) : 'end', o.cost.toFixed(2));
  }
  if (opts.length === 0) return { event: 'endTurn' };
  return pickOption(opts, params.temperature).action;
}

function pickOption(opts: Option[], T: number): Option {
  let best = opts[0]!;
  for (const o of opts) if (o.cost < best.cost) best = o;
  if (T <= 0) return best;
  const weights = opts.map(o => Math.exp(-(o.cost - best.cost) / T));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < opts.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return opts[i]!;
  }
  return best;
}

/** Choose which hand cards to discard when over the hand limit (keeps the best ETA). */
export function pickDiscardIndices(G: GameState, playerID: string, excess: number, params: PlannerParams = DEFAULT_PARAMS): number[] {
  const me = G.players[playerID];
  if (!me || excess <= 0) return [];
  const ctx = buildCtx(G, playerID, params);
  const s = stateOf(G, me);
  const n = me.hand.length;
  let best: number[] = [];
  let bestCost = Infinity;
  const seen = new Set<string>();
  const rec = (start: number, chosen: number[]) => {
    if (chosen.length === excess) {
      const hand = [...s.hand];
      for (const i of chosen) hand[me.hand[i]!.value]!--;
      const key = histKey(hand);
      if (seen.has(key)) return;
      seen.add(key);
      const c = eta({ ...s, hand }, ctx);
      if (c < bestCost) { bestCost = c; best = [...chosen]; }
      return;
    }
    for (let i = start; i < n; i++) rec(i + 1, [...chosen, i]);
  };
  rec(0, []);
  return best;
}

/** Pick the most damaging opponent portal card to discard (closest to activation, most points). */
export function pickDiscardTarget(G: GameState, playerID: string): { playerId: string; entryId: string } | null {
  const ctx = buildCtx(G, playerID, DEFAULT_PARAMS);
  let best: { playerId: string; entryId: string; score: number } | null = null;
  for (const p of Object.values(G.players)) {
    if (p.id === playerID) continue;
    for (const e of p.portal) {
      const d = deficit(e.card.cost, histOf(p.hand.length ? [] : []), { diamonds: p.diamondCards.length, wild: 0, onesCanBeEights: false, threesCanBeAny: false });
      const score = e.card.powerPoints * 2 + p.powerPoints * 0.5 - Math.min(d, 6) * 0.5;
      if (!best || score > best.score) best = { playerId: p.id, entryId: e.id, score };
    }
  }
  void ctx;
  return best;
}

/** Pick the opponent hand card that helps us most (steal). */
export function pickStealTarget(G: GameState, playerID: string): { playerId: string; index: number } | null {
  const me = G.players[playerID]!;
  const ctx = buildCtx(G, playerID, DEFAULT_PARAMS);
  const s = stateOf(G, me);
  let best: { playerId: string; index: number; cost: number } | null = null;
  for (const p of Object.values(G.players)) {
    if (p.id === playerID || p.hand.length === 0) continue;
    p.hand.forEach((c, i) => {
      const hand = [...s.hand];
      hand[c.value]!++;
      const cost = eta({ ...s, hand }, ctx) - p.powerPoints * 0.05;
      if (!best || cost < best.cost) best = { playerId: p.id, index: i, cost };
    });
  }
  return best;
}
