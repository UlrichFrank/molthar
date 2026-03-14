/**
 * Final Round & Winner Logic: Endgame determination
 * Triggered when a player reaches 12+ power points
 */

import type { IGameState } from '../../lib/types';

/**
 * Determine if final round is active
 */
export function isFinalRoundActive(state: IGameState): boolean {
  return state.finalRoundActive;
}

/**
 * Check if current player is in final round
 */
export function isPlayerInFinalRound(state: IGameState): boolean {
  if (!state.finalRoundActive) {
    return false;
  }

  return state.finalRoundPlayers.includes(state.currentPlayer);
}

/**
 * Get remaining players in final round (in order)
 */
export function getRemainingFinalRoundPlayers(state: IGameState): number[] {
  if (!state.finalRoundActive) {
    return [];
  }

  const remaining = state.finalRoundPlayers.filter(
    (playerIdx) => playerIdx >= state.currentPlayer || playerIdx <= state.currentPlayer
  );

  return remaining;
}

/**
 * Check if final round is complete (all players have taken their final turn)
 */
export function isFinalRoundComplete(state: IGameState): boolean {
  if (!state.finalRoundActive) {
    return false;
  }

  // Final round is complete when we've cycled back to the first final round player
  const firstFinalPlayer = state.finalRoundPlayers[0];
  return state.currentPlayer === firstFinalPlayer && state.gameLog.length > 0;
}

/**
 * Calculate winner based on power points (primary) and diamonds (tiebreaker)
 * Returns player index
 */
export function calculateWinner(state: IGameState): number {
  if (state.players.length === 0) {
    return -1;
  }

  let winner = 0;
  let maxPower = state.players[0].portal.powerPoints;
  let maxDiamonds = state.players[0].portal.diamonds;

  for (let i = 1; i < state.players.length; i++) {
    const player = state.players[i];
    const playerPower = player.portal.powerPoints;
    const playerDiamonds = player.portal.diamonds;

    if (
      playerPower > maxPower ||
      (playerPower === maxPower && playerDiamonds > maxDiamonds)
    ) {
      winner = i;
      maxPower = playerPower;
      maxDiamonds = playerDiamonds;
    }
  }

  return winner;
}

/**
 * Get winner information
 */
export function getWinnerInfo(state: IGameState): {
  playerIndex: number;
  playerId: string;
  playerName: string;
  powerPoints: number;
  diamonds: number;
} | null {
  if (!state.winner && !state.finalRoundActive) {
    return null;
  }

  const winnerIdx = calculateWinner(state);
  if (winnerIdx < 0 || winnerIdx >= state.players.length) {
    return null;
  }

  const winner = state.players[winnerIdx];
  return {
    playerIndex: winnerIdx,
    playerId: winner.id,
    playerName: winner.name,
    powerPoints: winner.portal.powerPoints,
    diamonds: winner.portal.diamonds,
  };
}

/**
 * Format winner announcement
 */
export function formatWinnerAnnouncement(state: IGameState): string {
  const winnerInfo = getWinnerInfo(state);
  if (!winnerInfo) {
    return 'No winner determined';
  }

  return (
    `${winnerInfo.playerName} wins! ` +
    `(${winnerInfo.powerPoints} power points, ${winnerInfo.diamonds} diamonds)`
  );
}
