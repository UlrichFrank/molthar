/**
 * Action Counter Display Component
 * Shows current/maximum actions for the active player with visual color feedback
 * 
 * The counter displays as "Actions: N/M" where N is the current action count
 * and M is the maximum available actions for the turn.
 * 
 * When currentActions reaches 0, displays an "End Turn" button (only clickable
 * for the active player, not for opponents).
 * 
 * Color Coding:
 * - Green: Normal state (2+ actions remaining)
 * - Yellow: Low actions (1 action remaining)
 * - Red: Out of actions (0 actions remaining) - shows "End Turn" button
 * 
 * Updates reactively when actionCount or maxActions changes. The component
 * also considers bonus actions granted by activated character abilities.
 * 
 * Props:
 * - currentActions: Number of actions remaining for the current player
 * - maxActions: Maximum number of actions available (base 3 + bonuses)
 * - isActivePlayer: Whether this is the active player (controls button interactivity)
 * - onEndTurn: Callback when End Turn button is clicked
 * 
 * Styling: Uses turnActionCounter.css for bottom-left positioning and colors
 */

interface ActionCounterDisplayProps {
  currentActions: number;
  maxActions: number;
  isActivePlayer: boolean;
  onEndTurn?: () => void;
}

export function ActionCounterDisplay({ 
  currentActions, 
  maxActions,
  isActivePlayer,
  onEndTurn,
}: ActionCounterDisplayProps) {
  // Determine color based on action state
  let colorClass = 'green'; // Normal state (most actions remaining)
  if (currentActions === 0) {
    colorClass = 'red'; // Out of actions
  } else if (currentActions <= 1) {
    colorClass = 'yellow'; // Nearly out of actions
  }

  // Show "End Turn" button when out of actions and is active player
  if (currentActions === 0 && isActivePlayer) {
    return (
      <button
        onClick={onEndTurn}
        className={`action-counter action-counter-${colorClass} action-counter-button`}
        aria-label="End turn"
      >
        <span className="actions-text end-turn-text">
          🔄 End Turn
        </span>
      </button>
    );
  }

  // Show status for opponents or when actions remain
  return (
    <div className={`action-counter action-counter-${colorClass}`}>
      <span className="actions-text">
        Actions: {currentActions}/{maxActions}
      </span>
    </div>
  );
}
