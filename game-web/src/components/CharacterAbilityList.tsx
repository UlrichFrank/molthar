import React from 'react';
import type { CharacterCard } from '@portale-von-molthar/shared';
import { getAbilityDisplay } from '../lib/abilityDisplayMap';
import { useTranslation } from '../i18n/useTranslation';

interface CharacterAbilityListProps {
  card: CharacterCard;
}

export const CharacterAbilityList: React.FC<CharacterAbilityListProps> = ({ card }) => {
  const { t } = useTranslation();
  if (card.abilities.length === 0) return null;

  const redAbilities = card.abilities.filter(a => !a.persistent);
  const blueAbilities = card.abilities.filter(a => a.persistent);

  return (
    <div className="flex flex-col gap-2 w-full">
      <h3 style={{ margin: 0, fontSize: '0.85rem', color: '#16c784', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>{t('detail.abilities')}</h3>
      {redAbilities.map(ability => {
        const display = getAbilityDisplay(ability.type);
        const desc = t(display.descriptionKey);
        return (
          <div key={ability.id} className="p-3 rounded border-l-4 bg-[rgba(220,100,100,0.1)] border-[#DC6464]">
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem', textTransform: 'uppercase', color: '#DC6464' }}>{t('detail.redInstant')}</span>
            {desc && <p style={{ margin: 0, fontSize: '0.85rem', color: '#D0D0D0', lineHeight: 1.4 }}>{desc}</p>}
          </div>
        );
      })}
      {blueAbilities.map(ability => {
        const display = getAbilityDisplay(ability.type);
        const desc = t(display.descriptionKey);
        return (
          <div key={ability.id} className="p-3 rounded border-l-4 bg-[rgba(100,150,220,0.1)] border-[#6496DC]">
            <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem', textTransform: 'uppercase', color: '#6496DC' }}>{t('detail.bluePersistent')}</span>
            {desc && <p style={{ margin: 0, fontSize: '0.85rem', color: '#D0D0D0', lineHeight: 1.4 }}>{desc}</p>}
          </div>
        );
      })}
    </div>
  );
};
