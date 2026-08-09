import type { GameState } from '@portale-von-molthar/shared';
import type { NeighborOpponent } from './canvasRegions';

/** Returns player IDs for the four opponent zones [left, top-left, top-right, right], or null for empty slots. */
export function buildOpponentsPlayerIDs(G: GameState, myPlayerID: string): Array<string | null> {
  const playerOrder = G.playerOrder || Object.keys(G.players || {});
  const n = playerOrder.length;
  const myIndex = playerOrder.indexOf(myPlayerID);

  function getOpponentId(offset: number): string | null {
    const idx = ((myIndex + offset) % n + n) % n;
    if (idx === myIndex) return null;
    return playerOrder[idx] ?? null;
  }

  if (n <= 1) return [null, null, null, null];
  if (n === 2) return [getOpponentId(1), null, null, null];
  if (n === 3) return [getOpponentId(1), null, null, getOpponentId(-1)];
  if (n === 4) return [getOpponentId(1), getOpponentId(2), null, getOpponentId(-1)];
  return [getOpponentId(1), getOpponentId(-2), getOpponentId(2), getOpponentId(-1)];
}

/** Returns the two direct neighbors (left = zoneIndex 0, right = zoneIndex 3) for irrlicht regions. */
export function getNeighborOpponents(G: GameState, myPlayerID: string): NeighborOpponent[] {
  const playerOrder = G.playerOrder || Object.keys(G.players || {});
  const n = playerOrder.length;
  if (n < 2) return [];
  const myIndex = playerOrder.indexOf(myPlayerID);

  const result: NeighborOpponent[] = [];

  const leftId = playerOrder[((myIndex + 1) % n + n) % n];
  if (leftId && leftId !== myPlayerID) {
    const player = G.players?.[leftId];
    if (player) result.push({ playerId: leftId, portal: player.portal ?? [], zoneIndex: 0 });
  }

  if (n >= 3) {
    const rightId = playerOrder[((myIndex - 1) % n + n) % n];
    if (rightId && rightId !== myPlayerID) {
      const player = G.players?.[rightId];
      if (player) result.push({ playerId: rightId, portal: player.portal ?? [], zoneIndex: 3 });
    }
  }

  return result;
}

/** Player order rotated so it starts right after `myPlayerID`, with `myPlayerID` excluded. */
export function rotatedOpponentOrder(G: GameState, myPlayerID: string): string[] {
  const order = G.playerOrder || Object.keys(G.players || {});
  const myIdx = order.indexOf(myPlayerID);
  const rotated = myIdx >= 0 ? [...order.slice(myIdx + 1), ...order.slice(0, myIdx)] : order;
  return rotated.filter(id => id !== myPlayerID);
}
