/**
 * Embeds assets/cards.json into the single binary.
 *
 * shared/src/game/cardDatabaseLoader.js normally reads cards.json from disk
 * when the shared package is first imported. A compiled binary has no such
 * file next to it, so this module hands the parsed data over through a
 * global, which the loader checks first. It must therefore be evaluated
 * before anything imports @portale-von-molthar/shared — see main-binary.ts.
 *
 * require() instead of import: the file lies outside tsc's rootDir; `bun
 * build` inlines it either way.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const cards: unknown[] = require('../../../assets/cards.json');

(globalThis as { __MOLTHAR_RAW_CARDS__?: unknown[] }).__MOLTHAR_RAW_CARDS__ = cards;

export {};
