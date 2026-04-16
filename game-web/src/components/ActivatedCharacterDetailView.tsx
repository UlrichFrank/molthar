import React from 'react';
import type { ActivatedCharacter } from '@portale-von-molthar/shared';
import { GameDialog, GameDialogTitle } from './GameDialog';
import { CharacterAbilityList } from './CharacterAbilityList';
import { useTranslation } from '../i18n/useTranslation';

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
  const { t } = useTranslation();
  if (!character) return null;

  const { card } = character;

  return (
    <GameDialog onOverlayClick={onClose}>
      <GameDialogTitle>{t('detail.title')}</GameDialogTitle>

      <div className="flex flex-col items-center gap-4">
        <img
          src={`/assets/${encodeURIComponent(card.imageName)}`}
          alt={card.name}
          className={`w-auto max-h-[240px] object-contain block rounded-lg cursor-pointer hover:scale-[1.02] transition-transform duration-200${rotated ? ' rotate-180' : ''}`}
          onClick={onClose}
        />

        <div className="grid grid-cols-2 gap-3 p-3 bg-white/10 rounded border-l-[3px] border-[#16c784] w-full">
          <div className="flex flex-col gap-0.5 items-center">
            <span style={{ fontSize: '0.75rem', color: '#9DB4D1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('detail.powerPoints')}</span>
            <span style={{ fontSize: '1.4rem', color: '#FFD700', fontWeight: 'bold' }}>{card.powerPoints}</span>
          </div>
          <div className="flex flex-col gap-0.5 items-center">
            <span style={{ fontSize: '0.75rem', color: '#9DB4D1', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('detail.diamonds')}</span>
            <span style={{ fontSize: '1.4rem', color: '#FFD700', fontWeight: 'bold' }}>{card.diamonds || 0}</span>
          </div>
        </div>

        <CharacterAbilityList card={card} />
      </div>
    </GameDialog>
  );
};
