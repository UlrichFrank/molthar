/**
 * EdelsteinBot — "Edelsteinsammlerin Erda" (Engine-First)
 * Strategy: diamond — same planner as Wendelin, but values diamond rewards
 * and blue engine abilities higher and trades 2-pearls for diamonds eagerly.
 */

import { makePlannerBot, PERSONA_PARAMS } from './personas';

export const EdelsteinBot = makePlannerBot('diamond', PERSONA_PARAMS.diamond);
