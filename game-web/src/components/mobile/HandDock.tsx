import type { GameBoardCore } from '../../hooks/useGameBoardCore';
import { pearlImageSrc } from '../../lib/cardImageSrc';
import { useTranslation } from '../../i18n/useTranslation';

interface HandDockProps {
  core: GameBoardCore;
}

/**
 * Task 4.3: fixed, horizontally scrollable hand of pearl cards, fanned out with
 * overlap so 8-9 cards fit without scrolling on a typical phone; jokers set apart.
 * `overflow-x: auto` on `.mobile-hand-dock` remains the safety net for very large hands.
 */
export function HandDock({ core }: HandDockProps) {
  const { t } = useTranslation();
  return (
    <div className="mobile-hand-dock" aria-label={t('mobile.hand')}>
      {core.playerHand.map((card, i) => (
        <div
          key={card.id ?? i}
          className={'mobile-card-btn mobile-card-btn--hand' + (card.isJoker ? ' mobile-card-btn--joker' : '')}
        >
          <img src={pearlImageSrc(card)} alt={t('mobile.pearlValue', { value: card.value })} />
        </div>
      ))}
    </div>
  );
}
