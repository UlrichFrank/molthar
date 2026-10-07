/**
 * WendelinBot — "Weiser Wendelin" (Stratege)
 * Strategy: efficient — pure tempo. Picks the action that minimises the
 * expected number of actions until 12 points (see planner/), almost
 * deterministically (low softmax temperature).
 */

import { makePlannerBot, PERSONA_PARAMS } from './personas';

export const WendelinBot = makePlannerBot('efficient', PERSONA_PARAMS.efficient);
