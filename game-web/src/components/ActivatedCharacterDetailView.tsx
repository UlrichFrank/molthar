import React from 'react';
import type { ActivatedCharacter } from '@portale-von-molthar/shared';
import '../styles/activatedCharacterDetailView.css';

interface ActivatedCharacterDetailViewProps {
  character: ActivatedCharacter | null;
  onClose: () => void;
}

export const ActivatedCharacterDetailView: React.FC<ActivatedCharacterDetailViewProps> = ({
  character,
  onClose,
}) => {
  if (!character) return null;

  // Construct image path from card ID
  const imagePath = `/assets/${encodeURIComponent(character.card.id)}.jpg`;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close modal when clicking on the overlay background (not the card)
    if (e.currentTarget === e.target) {
      onClose();
    }
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Close modal when clicking the card again
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="detailViewOverlay" onClick={handleOverlayClick}>
      <div className="detailViewContent">
        <div className="detailViewCard" onClick={handleCardClick}>
          <img
            src={imagePath}
            alt={character.card.name}
            className="detailViewImage"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22150%22%3E%3Crect fill=%22%23333%22 width=%22100%22 height=%22150%22/%3E%3C/svg%3E';
            }}
          />
        </div>

        {/* Card Info Section */}
        <div className="detailViewInfo">
          <h2 className="characterName">{character.card.name}</h2>
          
          <div className="statsGrid">
            <div className="statItem">
              <span className="statLabel">Power Points</span>
              <span className="statValue">{character.card.powerPoints}</span>
            </div>
            
            {character.card.costType && (
              <div className="statItem">
                <span className="statLabel">Cost</span>
                <span className="statValue">{formatCostType(character.card.costType)}</span>
              </div>
            )}
            
            <div className="statItem">
              <span className="statLabel">Diamonds</span>
              <span className="statValue">{character.card.diamonds || 0}</span>
            </div>
          </div>

          {/* Abilities Section */}
          {(character.card.redAbility || character.card.blueAbility) && (
            <div className="abilitiesSection">
              <h3>Abilities</h3>
              {character.card.redAbility && (
                <div className="ability red">
                  <span className="abilityType">Red (Instant)</span>
                  <p>{character.card.redAbility.description}</p>
                </div>
              )}
              {character.card.blueAbility && (
                <div className="ability blue">
                  <span className="abilityType">Blue (Persistent)</span>
                  <p>{character.card.blueAbility.description}</p>
                </div>
              )}
            </div>
          )}

          <p className="closeHint">Click overlay or press Escape to close</p>
        </div>
      </div>
    </div>
  );
};

function formatCostType(costType: unknown): string {
  if (typeof costType !== 'object' || costType === null) return 'Unknown';

  const cost = costType as Record<string, unknown>;

  if ('fixedSum' in cost) {
    return `Fixed Sum: ${cost.fixedSum}`;
  }
  if ('identicalValues' in cost) {
    return `${cost.identicalValues} Identical Cards`;
  }
  if ('run' in cost) {
    return `Run of ${cost.run}`;
  }
  if ('pairs' in cost) {
    return `${cost.pairs} Pairs`;
  }

  return 'Unknown';
}
