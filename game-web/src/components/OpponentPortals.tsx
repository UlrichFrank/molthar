import type { PlayerState, CharacterCard } from '@portale-von-molthar/shared';

interface OpponentPortalsProps {
  players: PlayerState[];
}

export function OpponentPortals({ players }: OpponentPortalsProps) {
  const getPortalImage = (playerIndex: number): string => {
    // Map player indices to portal images
    // Portal numbering: 2, 3, 4, 5 (based on number of opponents)
    const portalNumber = playerIndex + 2; // 0->2, 1->3, 2->4, 3->5
    
    if (portalNumber <= 5) {
      return `/assets/Gegner Portal${portalNumber}.png`;
    }
    // For >4 opponents, show rolled scrolls
    return `/assets/Schriftrolle.png`;
  };

  const getPortalRotation = (playerIndex: number, totalPlayers: number): string => {
    // Rotate based on position around the table
    // Top: 0-180deg, Right: -90deg, Bottom: 0deg, Left: 90deg
    if (totalPlayers <= 2) return '0deg';
    if (totalPlayers === 3) {
      return playerIndex === 0 ? '180deg' : (playerIndex === 1 ? '-90deg' : '90deg');
    }
    if (totalPlayers === 4) {
      return playerIndex === 0 ? '180deg' : (playerIndex === 1 ? '-90deg' : (playerIndex === 2 ? '0deg' : '90deg'));
    }
    return '0deg';
  };

  return (
    <div className="opponent-portals">
      {players.map((player, idx) => {
        const portalImage = getPortalImage(idx);
        const rotation = getPortalRotation(idx, players.length);
        const isOpen = idx < 4; // Only show up to 4 open portals

        return (
          <div 
            key={idx} 
            className={`opponent-portal-card ${isOpen ? 'open' : 'closed'}`}
            style={{
              backgroundImage: `url(${portalImage})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              transform: `rotate(${rotation})`,
              width: '250px',
              height: '200px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
            }}
          >
            <div className="opponent-info">
              <div className="player-name">{player.name}</div>
              <div className="stats-row">
                <span className="stat">⚡{player.powerPoints}</span>
                <span className="stat">💎{player.diamonds}</span>
                <span className="stat">🃏{player.hand.length}</span>
              </div>
            </div>

            {isOpen && player.portal.length > 0 && (
              <div className="active-count">
                {player.portal.length} active
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
