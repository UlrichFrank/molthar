/**
 * Action Counter Display Component
 * Shows current/maximum actions for the active player with visual color feedback
 *
 * Display Format:
 * - Shows "Player X Y / Z" format where X = player ID, Y = actions used, Z = max actions available
 * - When hand exceeds limit, displays "Discard Cards" button
 * - When all actions are consumed, displays "End Turn" button
 *
 * Color Coding:
 * - Blue: Non-active player (read-only display)
 * - Green: Active player, normal state (2+ actions remaining)
 * - Yellow: Active player, low actions (1 action remaining)
 * - Red: Active player, out of actions (0 actions remaining) or hand limit exceeded
 *
 * Behavior:
 * - Active Player: Shows action count, "Discard Cards" (if needed), or "End Turn"
 * - When requiresHandDiscard: Shows "Discard Cards" button instead of action count
 * - Opponents: Read-only display of action count in blue
 *
 * Props:
 * - currentActions: Number of actions remaining for the current player
 * - maxActions: Maximum number of actions available (base 3 + bonuses)
 * - isActivePlayer: Whether this is the active player (controls button interactivity and color)
 * - playerName: Name/ID of the player (e.g., "Player 2")
 * - requiresHandDiscard: Whether player needs to discard cards before ending turn
 * - onDiscardCards: Callback when Discard Cards button is clicked
 * - onEndTurn: Callback when End Turn button is clicked
 *
 * Styling: Uses turnActionCounter.css for bottom-left positioning and colors
 */

interface ActionCounterDisplayProps {
  currentActions: number;
  maxActions: number;
  isActivePlayer: boolean;
  playerName?: string;
  requiresHandDiscard?: boolean;
  onDiscardCards?: () => void;
  onEndTurn?: () => void;
}

export function ActionCounterDisplay({
  currentActions,
  maxActions,
  isActivePlayer,
  playerName = 'Player',
  requiresHandDiscard = false,
  onDiscardCards,
  onEndTurn,
}: ActionCounterDisplayProps) {
  // Calculate used actions
  const usedActions = maxActions - currentActions;

  // Determine color based on action state and player active status
  let colorClass = isActivePlayer ? 'green' : 'blue'; // Blue for non-active, green for normal active
  if (isActivePlayer) {
    if (currentActions === 0) {
      colorClass = 'red'; // Out of actions
    } else if (currentActions <= 1) {
      colorClass = 'yellow'; // Nearly out of actions
    }
  }

  // When hand limit is exceeded, show "Discard Cards" button instead of action count
  if (isActivePlayer && requiresHandDiscard) {
    return (
      <button
        onClick={onDiscardCards}
        className={`action-counter action-counter-red action-counter-button`}
        aria-label="Discard cards to comply with hand limit"
        title="Your hand exceeds the limit. Click to select cards to discard and return your hand to the allowed size."
      >
        <span className="actions-text">
          Discard Cards
        </span>
      </button>
    );
  }

  // Determine button text: show "Player X Y / Z" or "End Turn"
  const hasActionsRemaining = currentActions > 0;
  const buttonText = hasActionsRemaining
    ? `${playerName} ${usedActions} / ${maxActions}`
    : 'End Turn';

  // Show button (interactive when active player, non-interactive when out of actions)
  if (isActivePlayer) {
    return (
      <button
        onClick={onEndTurn}
        disabled={hasActionsRemaining}
        className={`action-counter action-counter-${colorClass} action-counter-button`}
        aria-label={hasActionsRemaining ? `${playerName}: ${usedActions} of ${maxActions} actions used` : 'End turn'}
        title={hasActionsRemaining ? `${currentActions} action(s) remaining` : 'End turn'}
      >
        <span className="actions-text">
          {buttonText}
        </span>
      </button>
    );
  }

  // Show read-only status for opponents (non-active players) - blue color
  return (
    <div className={`action-counter action-counter-${colorClass}`}>
      <span className="actions-text">
        {playerName} {usedActions} / {maxActions}
      </span>
    </div>
  );
}
