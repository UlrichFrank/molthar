import type { PlayerState, CharacterCard } from '@portale-von-molthar/shared';

interface PlayerPortalProps {
  player: PlayerState;
  isCurrentPlayer: boolean;
}

export function PlayerPortal({
  player,
  isCurrentPlayer,
}: PlayerPortalProps) {
  // Calculate total active power/diamonds if not on player state?
  // Actually shared state has them pre-calculated usually, but let's check.
  // Assuming PlayerState has powerPoints and diamonds.
  
  const activeCharacters = player.portal.filter(slot => slot.activated).map(slot => slot.card);

  return (
    <div 
      className={`player-portal-container ${isCurrentPlayer ? 'current' : 'opponent'}`}
      style={{
        backgroundImage: isCurrentPlayer ? 'url(/assets/Kleiderschrank Portal.png)' : undefined,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: '100%',
        maxWidth: '900px',
        aspectRatio: '16 / 9',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: isCurrentPlayer ? '2rem' : '1rem',
      }}
    >
      <div className="player-portal-info">
        <h3 className="player-name">{player.name}</h3>

        <div className="portal-stats">
          <div className="stat">
            <span className="label">Power:</span>
            <span className="value power">{player.powerPoints}</span>
          </div>
          <div className="stat">
            <span className="label">Diamonds:</span>
            <span className="value diamonds">{player.diamonds}</span>
          </div>
          <div className="stat">
            <span className="label">Hand:</span>
            <span className="value">{player.hand.length}</span>
          </div>
        </div>
      </div>

      {/* Diamonds Section (left side of portal) */}
      {player.diamonds > 0 && (
        <div className="diamonds-section">
          <div className="diamonds-display">
            {Array(player.diamonds).fill(null).map((_, idx) => (
              <span key={idx} className="diamond">💎</span>
            ))}
          </div>
        </div>
      )}

      {/* Active Characters Section (right side of portal) */}
      {activeCharacters.length > 0 && (
        <div className="active-characters">
          <h4 className="section-label">Active Characters</h4>
          <div className="characters-display">
            {activeCharacters.map((char: CharacterCard, idx: number) => (
              <div key={idx} className="active-character">
                <span className="name">{char.name}</span>
                <span className="power">⚡{char.powerPoints}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
