import type { CharacterCard } from '../lib/types';
import '../styles/Components.css';

interface CardInfoProps {
  character: CharacterCard;
}

export function CardInfo({ character }: CardInfoProps) {
  const costText = getCostDescription(character.cost);

  return (
    <div className="card-info-panel">
      <h3 className="card-name">{character.name}</h3>
      
      <div className="card-details">
        <div className="detail-row">
          <span className="label">Cost:</span>
          <span className="value">{costText}</span>
        </div>

        <div className="detail-row">
          <span className="label">Power:</span>
          <span className="value power">⚡{character.powerPoints}</span>
        </div>

        <div className="detail-row">
          <span className="label">Diamonds:</span>
          <span className="value diamonds">💎{character.diamonds}</span>
        </div>

        {character.ability && character.ability !== 'none' && (
          <div className="detail-row">
            <span className="label">Ability:</span>
            <span className="value ability">{formatAbility(character.ability)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function getCostDescription(cost: Array<{ type: string; [key: string]: unknown }>): string {
  if (!cost || cost.length === 0) return 'Free';
  
  return cost
    .map((c) => {
      switch (c.type) {
        case 'number':
          return `${c.value}`;
        case 'nTuple':
          return `${c.n}×same`;
        case 'sumAnyTuple':
          return `Sum ${c.sum}`;
        case 'sumTuple':
          return `Sum ${c.min}-${c.max}`;
        case 'run':
          return `${c.length} run`;
        case 'evenTuple':
          return `${c.count}×even`;
        case 'oddTuple':
          return `${c.count}×odd`;
        case 'drillingChoice':
          return `${c.val1} or ${c.val2}`;
        case 'none':
          return 'Free';
        default:
          return 'Unknown';
      }
    })
    .join(' + ');
}

function formatAbility(ability: string): string {
  return ability
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}
