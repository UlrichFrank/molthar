/**
 * Turn Indicator Display Component
 * Shows which player is currently active and turn position on the game board
 *
 * Positioned at bottom-left of the game board and displays the active player
 * with turn context (e.g., "Player 2 1/3"). Updates reactively when the active
 * player changes.
 *
 * Props:
 * - activePlayerIndex: 0-indexed position of active player in player order
 * - totalPlayers: Total number of players in the game (for context)
 * - playerName: Name/ID of the player being referenced (e.g., "Player 2")
 * - isActivePlayer: Whether this player is the active player (for styling)
 * - currentTurn: Current turn number (defaults to activePlayerIndex + 1)
 *
 * Styling: Uses turnActionCounter.css for bottom-left positioning and styling.
 * Color changes to blue when isActivePlayer is false.
 */

interface TurnIndicatorDisplayProps {
  activePlayerIndex: number;
  totalPlayers: number;
  playerName?: string;
  isActivePlayer?: boolean;
  currentTurn?: number;
}

export function TurnIndicatorDisplay({
  activePlayerIndex,
  totalPlayers,
  playerName = `Player ${activePlayerIndex + 1}`,
  isActivePlayer = true,
  currentTurn = activePlayerIndex + 1
}: TurnIndicatorDisplayProps) {
  // CSS class for non-active player styling (blue)
  const indicatorClass = isActivePlayer ? 'turn-indicator' : 'turn-indicator turn-indicator-inactive';

  return (
    <div className={indicatorClass}>
      <span className="turn-label">
        {playerName} {currentTurn}/{totalPlayers}
      </span>
    </div>
  );
}
