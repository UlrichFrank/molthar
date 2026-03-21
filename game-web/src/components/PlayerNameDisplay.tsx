/**
 * Player Name Display Component
 * Shows the player's name above their hand cards
 * 
 * Positioned at the top-left area above the hand cards, displays
 * "Player: [Name]" in a readable format.
 * 
 * Props:
 * - playerName: The name of the player
 */

interface PlayerNameDisplayProps {
  playerName: string;
}

export function PlayerNameDisplay({ playerName }: PlayerNameDisplayProps) {
  return (
    <div className="player-name-display">
      <span className="player-name-text">
        Player: {playerName}
      </span>
    </div>
  );
}
