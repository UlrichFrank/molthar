import type { PlayerState, CharacterCard, PearlCard } from '@portale-von-molthar/shared';
import { HandDisplay } from './HandDisplay';
import { ActionButtons } from './ActionButtons';

interface PlayerPortalProps {
  player: PlayerState;
  isCurrentPlayer: boolean;
  hand?: PearlCard[];
  selectedHandIndices?: number[];
  gamePhase?: 'takingActions' | 'discardingExcessCards' | 'gameFinished';
  actionsRemaining?: number;
  selectedPearl?: number | null;
  selectedCharacter?: number | null;
  onSelectHandCard?: (index: number) => void;
  onClearHandSelection?: () => void;
  onTakePearl?: () => void;
  onPlaceCharacter?: () => void;
  onActivateCharacter?: (characterIndex: number) => void;
  onDiscardCards?: () => void;
  onEndTurn?: () => void;
}

export function PlayerPortal({
  player,
  isCurrentPlayer,
  hand = [],
  selectedHandIndices = [],
  gamePhase = 'takingActions',
  actionsRemaining = 0,
  selectedPearl = null,
  selectedCharacter = null,
  onSelectHandCard = () => {},
  onClearHandSelection = () => {},
  onTakePearl = () => {},
  onPlaceCharacter = () => {},
  onActivateCharacter = () => {},
  onDiscardCards = () => {},
  onEndTurn = () => {},
}: PlayerPortalProps) {
  const activeCharacters = player.portal.filter(slot => slot.activated).map(slot => slot.card);
  const showControls = isCurrentPlayer && hand.length > 0;

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
      }}
    >
      {/* Left side: Player Hand - positioned absolutely, no container div visible */}
      {showControls && (
        <div className="portal-hand-container">
          <HandDisplay
            hand={hand}
            selectedIndices={selectedHandIndices}
            phase={gamePhase}
            onSelect={onSelectHandCard}
            onClearSelection={onClearHandSelection}
            title="Your Hand"
          />
        </div>
      )}

      {/* Center: Player info */}
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

        {/* Diamonds Section */}
        {player.diamonds > 0 && (
          <div className="diamonds-section">
            <div className="diamonds-display">
              {Array(player.diamonds).fill(null).map((_, idx) => (
                <span key={idx} className="diamond">💎</span>
              ))}
            </div>
          </div>
        )}

        {/* Active Characters Section */}
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

      {/* Right side: Action buttons - positioned absolutely, no container div visible */}
      {showControls && (
        <div className="portal-actions-container">
          <ActionButtons
            gamePhase={gamePhase}
            actionsRemaining={actionsRemaining}
            selectedPearl={selectedPearl}
            selectedCharacter={selectedCharacter}
            selectedHandCount={selectedHandIndices.length}
            onTakePearl={onTakePearl}
            onPlaceCharacter={onPlaceCharacter}
            onActivateCharacter={onActivateCharacter}
            onDiscardCards={onDiscardCards}
            onEndTurn={onEndTurn}
            currentPlayer={player}
          />
        </div>
      )}
    </div>
  );
}
