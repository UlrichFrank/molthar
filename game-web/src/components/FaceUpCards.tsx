import type { PearlCard, CharacterCard } from '../lib/types';
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
  return (
    <div className="face-up-cards">
      <div className="card-section">
        <h3 className="section-title">Pearl Cards</h3>
        <div className="cards-grid">
          {pearlCards.map((card, idx) => (
            <button
              key={idx}
              className={`card pearl-card ${selectedPearl === idx ? 'selected' : ''}`}
              onClick={() => onSelectPearl(idx)}
              title={`Pearl ${card.value}`}
            >
              <span className="card-value">{card.value}</span>
            {card.hasSwapSymbol && <span className="swap-symbol">⇄</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="card-section">
        <h3 className="section-title">Character Cards</h3>
        <div className="cards-grid">
          {characterCards.map((card, idx) => (
            <button
              key={idx}
              className={`card character-card ${selectedCharacter === idx ? 'selected' : ''}`}
              onClick={() => onSelectCharacter(idx)}
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
    </div>
  );
}
