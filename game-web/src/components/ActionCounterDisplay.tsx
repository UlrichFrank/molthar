/**
 * Action Counter Display Component
 * Shows current/maximum actions for the active player with visual color feedback
 * 
 * Display Format:
 * - Shows "X / Y" format where X = actions used, Y = max actions available
 * - When all actions are consumed (currentActions === 0), displays "End Turn" button
 * 
 * Color Coding:
 * - Green: Normal state (2+ actions remaining)
 * - Yellow: Low actions (1 action remaining)
 * - Red: Out of actions (0 actions remaining) - "End Turn" button appears
 * 
 * Behavior:
 * - Active Player: Button is enabled only when actions remain (disabled when 0 remaining)
 * - Opponents: Read-only display of action count
 * - Supports bonus actions (e.g., "1 / 4" if maxActions includes +1 bonus)
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
  // Calculate used actions
  const usedActions = maxActions - currentActions;
  
  // DEBUG: Log component props
  console.debug('ActionCounterDisplay props:', {
    currentActions,
    maxActions,
    usedActions,
    isActivePlayer,
    hasActionsRemaining: currentActions > 0
  });
  
  // Determine color based on action state
  let colorClass = 'green'; // Normal state (most actions remaining)
  if (currentActions === 0) {
    colorClass = 'red'; // Out of actions
  } else if (currentActions <= 1) {
    colorClass = 'yellow'; // Nearly out of actions
  }

  // Determine button text: show "X / Y" or "End Turn"
  const hasActionsRemaining = currentActions > 0;
  const buttonText = hasActionsRemaining 
    ? `${usedActions} / ${maxActions}` 
    : 'End Turn';

  // Show button (interactive when active player, non-interactive when out of actions)
  if (isActivePlayer) {
    return (
      <button
        onClick={onEndTurn}
        disabled={hasActionsRemaining}
        className={`action-counter action-counter-${colorClass} action-counter-button`}
        aria-label={hasActionsRemaining ? `${usedActions} of ${maxActions} actions used` : 'End turn'}
        title={hasActionsRemaining ? `${currentActions} action(s) remaining` : 'End turn'}
      >
        <span className="actions-text">
          {buttonText}
        </span>
      </button>
    );
  }

  // Show read-only status for opponents
  return (
    <div className={`action-counter action-counter-${colorClass}`}>
      <span className="actions-text">
        {usedActions} / {maxActions}
      </span>
    </div>
  );
}
