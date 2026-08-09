import type { GameBoardCore } from '../../hooks/useGameBoardCore';
import { pearlImageSrc } from '../../lib/cardImageSrc';
import { useTranslation } from '../../i18n/useTranslation';

interface HandDockProps {
  core: GameBoardCore;
}

/** Task 4.3: fixed, horizontally scrollable hand of pearl cards; jokers set apart. */
export function HandDock({ core }: HandDockProps) {
  const { t } = useTranslation();
  return (
    <div className="mobile-hand-dock" aria-label={t('mobile.hand')}>
      {core.playerHand.map((card, i) => (
        <div
          key={card.id ?? i}
          className={'mobile-card-btn mobile-card-btn--hand' + (card.isJoker ? ' mobile-card-btn--joker' : '')}
          style={card.isJoker ? { marginLeft: 6 } : undefined}
        >
          <img src={pearlImageSrc(card)} alt={t('mobile.pearlValue', { value: card.value })} />
        </div>
      ))}
    </div>
  );
}
