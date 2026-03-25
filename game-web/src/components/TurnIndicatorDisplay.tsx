/**
 * Turn Indicator Display Component
 * Shows which player is currently active on the game board
 *
 * Positioned at bottom-left of the game board and displays the active player
 * index (1-indexed for user display). Updates reactively when the active player changes.
 *
 * Props:
 * - activePlayerIndex: 0-indexed position of active player in player order
 * - totalPlayers: Total number of players in the game (for context)
 *
 * Styling: Uses turnActionCounter.css for bottom-left positioning and styling
 */

interface TurnIndicatorDisplayProps {
  activePlayerIndex: number;
  totalPlayers: number;
}

export function TurnIndicatorDisplay({ activePlayerIndex, totalPlayers }: TurnIndicatorDisplayProps) {
  return (
    <div className="turn-indicator">
      <span className="turn-label">
        Player {activePlayerIndex + 1} Active
      </span>
    </div>
  );
}
