/**
 * Entry point of the single binary (`make binary`).
 *
 * The order matters: the card data has to be in place before
 * @portale-von-molthar/shared is first loaded (by server-bgio), because the
 * shared package reads the cards while being imported. require() keeps that
 * order explicit.
 */
/* eslint-disable @typescript-eslint/no-var-requires */
require('./embedded/cards');
require('./server-bgio');
