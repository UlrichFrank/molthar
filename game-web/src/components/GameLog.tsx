import type { GameAction } from '../lib/types';
import '../styles/Components.css';

interface GameLogProps {
  gameLog: GameAction[];
  playerNames: Map<string, string>;
  maxEntries?: number;
}

export function GameLog({ gameLog, playerNames, maxEntries = 10 }: GameLogProps) {
  // Show last N entries
  const entries = gameLog.slice(Math.max(0, gameLog.length - maxEntries));

  const getActionLabel = (action: GameAction): string => {
    switch (action.type) {
      case 'takePearlCard':
        return 'Took Pearl';
      case 'placeCharacter':
        return 'Placed Character';
      case 'activateCharacter':
        return 'Activated Character';
      case 'discardCards':
        return 'Discarded Cards';
      case 'endTurn':
        return 'Ended Turn';
      case 'useRedAbility':
        return 'Used Ability';
      default:
        return 'Unknown Action';
    }
  };

  return (
    <div className="game-log">
      <h3 className="log-title">Game Log</h3>
      <div className="log-entries">
        {entries.length === 0 ? (
          <div className="log-empty">Game started...</div>
        ) : (
          entries.map((action, idx) => {
            const playerName = playerNames.get(action.playerId) || 'Unknown';
            const actionLabel = getActionLabel(action);
            return (
              <div key={idx} className="log-entry">
                <span className="log-player">{playerName}</span>
                <span className="log-action">{actionLabel}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
