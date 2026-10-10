import type { GameState } from '@portale-von-molthar/shared';
import type { NeighborOpponent } from './canvasRegions';
import { getOpponentSeating, SEAT_INDEX } from './cardLayoutConstants';

/** Returns the player IDs per seat in SEAT_INDEX order [left, top-left, top-right, right, top-center], null for empty seats. */
export function buildOpponentsPlayerIDs(G: GameState, myPlayerID: string): Array<string | null> {
  const playerOrder = G.playerOrder || Object.keys(G.players || {});
  const n = playerOrder.length;
  const myIndex = playerOrder.indexOf(myPlayerID);
  const result: Array<string | null> = [null, null, null, null, null];
  if (myIndex < 0) return result;
  for (const { offset, seat } of getOpponentSeating(n)) {
    const idx = ((myIndex + offset) % n + n) % n;
    if (idx === myIndex) continue;
    result[SEAT_INDEX[seat]] = playerOrder[idx] ?? null;
  }
  return result;
}

/** Returns the two direct neighbors (next and previous player) for irrlicht regions, with their seat index. */
export function getNeighborOpponents(G: GameState, myPlayerID: string): NeighborOpponent[] {
  const playerOrder = G.playerOrder || Object.keys(G.players || {});
  const n = playerOrder.length;
  if (n < 2) return [];
  const ids = buildOpponentsPlayerIDs(G, myPlayerID);
  const myIndex = playerOrder.indexOf(myPlayerID);
  const wanted = n === 2 ? [1] : [1, -1];

  const result: NeighborOpponent[] = [];
  for (const offset of wanted) {
    const pid = playerOrder[((myIndex + offset) % n + n) % n];
    const seatIdx = ids.indexOf(pid ?? null);
    const player = pid ? G.players?.[pid] : undefined;
    if (pid && pid !== myPlayerID && player && seatIdx >= 0) {
      result.push({ playerId: pid, portal: player.portal ?? [], zoneIndex: seatIdx as 0 | 1 | 2 | 3 | 4 });
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
