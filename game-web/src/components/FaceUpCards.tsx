import { useState } from 'react';
import type { PearlCard, CharacterCard } from '../lib/types';
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

  return (
    <div 
      className="face-up-cards auslage-container"
      style={{
        backgroundImage: 'url(/assets/Auslage.png)',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        width: '100%',
        maxWidth: '1000px',
        aspectRatio: '16 / 9',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Character Cards Section */}
      <div className="auslage-section characters-section">
        <div className="auslage-cards-row">
          {characterCards.map((card, idx) => (
            <button
              key={idx}
              className={`card character-card auslage-card ${selectedCharacter === idx ? 'selected' : ''}`}
              onClick={() => onSelectCharacter(idx)}
              onMouseEnter={() => setHoveredCharIdx(idx)}
              onMouseLeave={() => setHoveredCharIdx(null)}
              title={card.name}
            >
              <div className="card-name">{card.name}</div>
              <div className="card-stats">
                <span>⚡{card.powerPoints}</span>
                <span>💎{card.diamonds}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Pearl Cards Section */}
      <div className="auslage-section pearls-section">
        <div className="auslage-cards-row">
          {pearlCards.map((card, idx) => (
            <button
              key={idx}
              className={`card pearl-card auslage-card ${selectedPearl === idx ? 'selected' : ''}`}
              onClick={() => onSelectPearl(idx)}
              title={`Pearl ${card.value}${card.hasSwapSymbol ? ' (Swap)' : ''}`}
            >
              <span className="card-value">{card.value}</span>
              {card.hasSwapSymbol && <span className="swap-symbol">⇄</span>}
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
