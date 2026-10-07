/**
 * RalfBot — "Raubritter Ralf" (Disruption-First)
 * Strategy: aggressive — same planner, but also counts how much an action
 * slows down the leading opponent (denies pearls/cards they need) and
 * prefers red attack abilities (steal hand card, discard portal card).
 */

import { makePlannerBot, PERSONA_PARAMS } from './personas';

export const RalfBot = makePlannerBot('aggressive', PERSONA_PARAMS.aggressive);
