/**
 * Action Counter Display Component
 * Shows current/maximum actions for the active player with visual color feedback
 * 
 * The counter displays as "Actions: N/M" where N is the current action count
 * and M is the maximum available actions for the turn.
 * 
 * Color Coding:
 * - Green: Normal state (1-2 actions remaining)
 * - Yellow: At maximum capacity (used all available actions)
 * - Red: Out of actions (0 actions remaining)
 * 
 * Updates reactively when actionCount or maxActions changes. The component
 * also considers bonus actions granted by activated character abilities.
 * 
 * Props:
 * - currentActions: Number of actions remaining for the current player
 * - maxActions: Maximum number of actions available (base 3 + bonuses)
 * 
 * Styling: Uses turnActionCounter.css for bottom-left positioning and colors
 */

interface ActionCounterDisplayProps {
  currentActions: number;
  maxActions: number;
}

export function ActionCounterDisplay({ currentActions, maxActions }: ActionCounterDisplayProps) {
  // Determine color based on action state
  let colorClass = 'green'; // Normal state
  if (currentActions === 0) {
    colorClass = 'red'; // Out of actions
  } else if (currentActions === maxActions) {
    colorClass = 'yellow'; // At max capacity
  }

  return (
    <div className={`action-counter action-counter-${colorClass}`}>
      <span className="actions-text">
        Actions: {currentActions}/{maxActions}
      </span>
    </div>
  );
}
