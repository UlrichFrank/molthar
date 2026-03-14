import type { PlayerState, CharacterCard } from '../lib/types';

interface OpponentPortalsProps {
  players: PlayerState[];
  characters: CharacterCard[];
}

export function OpponentPortals({ players }: OpponentPortalsProps) {
  return (
    <div className="opponent-portals">
      {players.map((player, idx) => (
        <div key={idx} className="opponent-portal-compact">
          <div className="player-name">{player.name}</div>
          <div className="stats-row">
            <span className="stat">⚡{player.portal.powerPoints}</span>
            <span className="stat">💎{player.portal.diamonds}</span>
            <span className="stat">🃏{player.hand.length}</span>
          </div>
          {player.portal.characters.length > 0 && (
            <div className="active-count">
              {player.portal.characters.length} active
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
