import React from 'react';
import type { ActivatedCharacter } from '@portale-von-molthar/shared';
import { GameDialog, GameDialogTitle } from './GameDialog';

interface ActivatedCharacterDetailViewProps {
  character: ActivatedCharacter | null;
  onClose: () => void;
  rotated?: boolean;
}

export const ActivatedCharacterDetailView: React.FC<ActivatedCharacterDetailViewProps> = ({
  character,
  onClose,
  rotated = true,
}) => {
  if (!character) return null;

  const { card } = character;
  const redAbilities = card.abilities.filter(a => !a.persistent);
  const blueAbilities = card.abilities.filter(a => a.persistent);

  return (
    <GameDialog onOverlayClick={onClose}>
      <GameDialogTitle>Character Details</GameDialogTitle>

      <div className="flex flex-col items-center gap-4">
        <img
          src={`/assets/${encodeURIComponent(card.imageName)}`}
          alt={card.name}
          className={`w-auto max-h-[240px] object-contain block rounded-lg cursor-pointer hover:scale-[1.02] transition-transform duration-200${rotated ? ' rotate-180' : ''}`}
          onClick={onClose}
        />

        <div className="grid grid-cols-2 gap-3 p-3 bg-white/10 rounded border-l-[3px] border-[#16c784] w-full">
          <div className="flex flex-col gap-0.5 items-center">
            <span style={{ fontSize: '0.75rem', color: '#9DB4D1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Power Points</span>
            <span style={{ fontSize: '1.4rem', color: '#FFD700', fontWeight: 'bold' }}>{card.powerPoints}</span>
          </div>
          <div className="flex flex-col gap-0.5 items-center">
            <span style={{ fontSize: '0.75rem', color: '#9DB4D1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Diamonds</span>
            <span style={{ fontSize: '1.4rem', color: '#FFD700', fontWeight: 'bold' }}>{card.diamonds || 0}</span>
          </div>
        </div>

        {card.abilities.length > 0 && (
          <div className="flex flex-col gap-2 w-full">
            <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#16c784', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Abilities</h3>
            {redAbilities.map(ability => (
              <div key={ability.id} className="p-3 rounded border-l-4 bg-[rgba(220,100,100,0.1)] border-[#DC6464]">
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem', textTransform: 'uppercase', color: '#DC6464' }}>Red (Instant)</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#D0D0D0', lineHeight: 1.4 }}>{ability.description}</p>
              </div>
            ))}
            {blueAbilities.map(ability => (
              <div key={ability.id} className="p-3 rounded border-l-4 bg-[rgba(100,150,220,0.1)] border-[#6496DC]">
                <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem', textTransform: 'uppercase', color: '#6496DC' }}>Blue (Persistent)</span>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#D0D0D0', lineHeight: 1.4 }}>{ability.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </GameDialog>
  );
};
