import { useState } from 'react';
import type { PearlCard, CharacterCard } from '@portale-von-molthar/shared';
import { CardInfo } from './CardInfo';
import '../styles/Components.css';

interface FaceUpCardsProps {
  pearlCards: PearlCard[];
  characterCards: CharacterCard[];
  selectedPearl: number | null;
  selectedCharacter: number | null;
  onSelectPearl: (index: number) => void;
  onSelectCharacter: (index: number) => void;
}

export function FaceUpCards({
  pearlCards,
  characterCards,
  selectedPearl,
  selectedCharacter,
  onSelectPearl,
  onSelectCharacter,
}: FaceUpCardsProps) {
  const [hoveredCharIdx, setHoveredCharIdx] = useState<number | null>(null);

  // Helper function to get pearl card image path
  function getPearlCardImage(value: number): string {
    return `/assets/Perlenkarte${value}.jpeg`;
  }

  // Helper function to get character card image path
  function getCharacterCardImage(cardName: string): string {
    // Card names are like "Character 1", "Character 2", etc.
    // Assets are named "Charakterkarte1.jpeg", "Charakterkarte2.jpeg", etc.
    const match = cardName.match(/(\d+)/);
    if (match) {
      const num = match[1];
      return `/assets/Charakterkarte${num}.jpeg`;
    }
    // Fallback to generic back image or placeholder
    return '/assets/Charakterkarte Hinten.jpeg';
  }

  return (
    <div className="auslage-container">
      {/* Character Cards Section */}
      <div className="auslage-section characters-section">
        <h3 className="auslage-label">Charakterkarten</h3>
        <div className="auslage-cards-row">
          {characterCards.map((card, idx) => (
            <button
              key={idx}
              className={`card character-card auslage-card card-with-image ${selectedCharacter === idx ? 'selected' : ''}`}
              onClick={() => onSelectCharacter(idx)}
              onMouseEnter={() => setHoveredCharIdx(idx)}
              onMouseLeave={() => setHoveredCharIdx(null)}
              title={card.name}
              style={{
                backgroundImage: `url(${getCharacterCardImage(card.name)})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            >
              <div className="card-name visually-hidden">{card.name}</div>
              <div className="card-stats visually-hidden">
                <span>⚡{card.powerPoints}</span>
                <span>💎{card.diamonds}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pearl Cards Section */}
      <div className="auslage-section pearls-section">
        <h3 className="auslage-label">Perlenkarten</h3>
        <div className="auslage-cards-row">
          {pearlCards.map((card, idx) => (
            <button
              key={idx}
              className={`card pearl-card auslage-card card-with-image ${selectedPearl === idx ? 'selected' : ''}`}
              onClick={() => onSelectPearl(idx)}
              title={`Pearl ${card.value}${card.hasSwapSymbol ? ' (Swap)' : ''}`}
              style={{
                backgroundImage: `url(${getPearlCardImage(card.value)})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            >
              <span className="card-value visually-hidden">{card.value}</span>
              {card.hasSwapSymbol && <span className="swap-symbol visually-hidden">⇄</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Character Info Popup */}
      {hoveredCharIdx !== null && characterCards[hoveredCharIdx] && (
        <div className="character-info-popup">
          <CardInfo character={characterCards[hoveredCharIdx]} />
        </div>
      )}
    </div>
  );
}
