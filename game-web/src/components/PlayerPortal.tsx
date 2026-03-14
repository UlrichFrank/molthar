import type { PlayerState, CharacterCard } from '../lib/types';

interface PlayerPortalProps {
  player: PlayerState;
  isCurrentPlayer: boolean;
}

export function PlayerPortal({
  player,
  isCurrentPlayer,
}: PlayerPortalProps) {
  return (
    <div className={`player-portal ${isCurrentPlayer ? 'current' : 'opponent'}`}>
      <h3 className="player-name">{player.name}</h3>

      <div className="portal-stats">
        <div className="stat">
          <span className="label">Power:</span>
          <span className="value power">{player.portal.powerPoints}</span>
        </div>
        <div className="stat">
          <span className="label">Diamonds:</span>
          <span className="value diamonds">{player.portal.diamonds}</span>
        </div>
        <div className="stat">
          <span className="label">Hand:</span>
          <span className="value">{player.hand.length}</span>
        </div>
      </div>

      {player.portal.characters.length > 0 && (
        <div className="active-characters">
          <h4 className="section-label">Active Characters</h4>
          {player.portal.characters.map((char: CharacterCard, idx: number) => (
            <div key={idx} className="active-character">
              <span className="name">{char.name}</span>
              <span className="power">⚡{char.powerPoints}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
