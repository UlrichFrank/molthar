import type { IGameState } from './types';

export interface GameStatistics {
  startTime: number;
  endTime?: number;
  totalMoves: number;
  totalTurns: number;
  playerStats: {
    playerId: string;
    playerName: string;
    finalPower: number;
    finalDiamonds: number;
    totalActionsUsed: number;
    characterCount: number;
  }[];
  winner?: {
    playerId: string;
    playerName: string;
    power: number;
    diamonds: number;
  };
}

/**
 * Initialize game statistics
 */
export function initializeStatistics(): GameStatistics {
  return {
    startTime: Date.now(),
    totalMoves: 0,
    totalTurns: 0,
    playerStats: [],
  };
}

/**
 * Update statistics from game state
 */
export function updateStatistics(
  stats: GameStatistics,
  gameState: IGameState
): GameStatistics {
  return {
    ...stats,
    totalMoves: gameState.gameLog.length,
    totalTurns: Math.floor(gameState.gameLog.length / 3), // Approx 3 actions per turn
    playerStats: gameState.players.map((player) => ({
      playerId: player.id,
      playerName: player.name,
      finalPower: player.portal.powerPoints,
      finalDiamonds: player.portal.diamonds,
      totalActionsUsed: gameState.gameLog.filter((log) => log.playerId === player.id)
        .length,
      characterCount: player.portal.characters.length,
    })),
  };
}

/**
 * Finalize statistics when game ends
 */
export function finalizeStatistics(
  stats: GameStatistics,
  gameState: IGameState,
  winnerName?: string
): GameStatistics {
  const finalStats = updateStatistics(stats, gameState);

  const winner = gameState.players.find((p) => p.name === winnerName);

  return {
    ...finalStats,
    endTime: Date.now(),
    winner: winner
      ? {
          playerId: winner.id,
          playerName: winner.name,
          power: winner.portal.powerPoints,
          diamonds: winner.portal.diamonds,
        }
      : undefined,
  };
}

/**
 * Calculate game duration in seconds
 */
export function getGameDuration(stats: GameStatistics): number {
  if (!stats.endTime) {
    return (Date.now() - stats.startTime) / 1000;
  }
  return (stats.endTime - stats.startTime) / 1000;
}

/**
 * Format game duration
 */
export function formatGameDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
}

/**
 * Get player ranking by power/diamonds
 */
export function getRanking(stats: GameStatistics) {
  return [...stats.playerStats].sort((a, b) => {
    if (b.finalPower !== a.finalPower) {
      return b.finalPower - a.finalPower;
    }
    return b.finalDiamonds - a.finalDiamonds;
  });
}
