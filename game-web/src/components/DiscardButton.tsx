/**
 * Discard Button Component
 * Separate button shown when player needs to discard cards to comply with hand limit
 *
 * Display:
 * - Red button with "Discard Cards" text
 * - Only shown when requiresHandDiscard is true
 * - Click opens discard dialog
 *
 * Props:
 * - requiresHandDiscard: Whether discard button should be shown
 * - onDiscardCards: Callback when button is clicked
 *
 * Styling: Uses turnActionCounter.css for positioning and styling
 */

interface DiscardButtonProps {
  requiresHandDiscard?: boolean;
  onDiscardCards?: () => void;
}

export function DiscardButton({
  requiresHandDiscard = false,
  onDiscardCards,
}: DiscardButtonProps) {
  // Only show button if discard is required
  if (!requiresHandDiscard) {
    return null;
  }

  return (
    <button
      onClick={onDiscardCards}
      className={`action-counter action-counter-red action-counter-button discard-button`}
      aria-label="Discard cards to comply with hand limit"
      title="Your hand exceeds the limit. Click to select cards to discard and return your hand to the allowed size."
    >
      <span className="actions-text">
        Discard Cards
      </span>
    </button>
  );
}
