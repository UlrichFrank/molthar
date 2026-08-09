import type { GameState } from '@portale-von-molthar/shared';
import type { GameBoardCore } from '../../hooks/useGameBoardCore';
import { pearlImageSrc, PEARL_BACK_IMAGE_SRC, characterImageSrc, CHARACTER_BACK_IMAGE_SRC } from '../../lib/cardImageSrc';
import { useTranslation } from '../../i18n/useTranslation';

interface MarketZoneProps {
  G: GameState;
  core: GameBoardCore;
}

/**
 * Task 4.1: market zone — 4 pearl slots + pearl pile on one non-wrapping row,
 * 2 character slots + character pile on a second one.
 *
 * The umbrella "Markt" heading is gone on purpose: each row carries its own
 * "Markt · …" label, so a third title would only cost vertical space in the
 * scroll area without adding information.
 */
export function MarketZone({ G, core }: MarketZoneProps) {
  const { t } = useTranslation();
  const characterSlots = G.characterSlots || [];
  const pearlSlots = G.pearlSlots || [];

  return (
    <div className="mobile-zone mobile-market-zone">
      <div>
        <div className="mobile-section-title">{t('mobile.marketPearls')}</div>
        <div className="mobile-market-row mobile-market-row--pearls">
          {[0, 1, 2, 3].map(i => {
            const card = pearlSlots[i];
            return card ? (
              <button
                key={`pearl-${i}`}
                type="button"
                className={'mobile-card-btn mobile-card-btn--pearl' + (card.isJoker ? ' mobile-card-btn--joker' : '')}
                onClick={() => core.takePearlFromMarket(i)}
              >
                <img src={pearlImageSrc(card)} alt={t('mobile.pearlValue', { value: card.value })} />
              </button>
            ) : (
              <div key={`pearl-empty-${i}`} className="mobile-card-btn mobile-card-btn--pearl mobile-card-btn--portal-empty" />
            );
          })}

          <button
            type="button"
            className="mobile-card-btn mobile-card-btn--pearl mobile-card-btn--deck"
            onClick={() => core.takePearlFromDeck()}
            disabled={G.pearlDeck.length === 0}
          >
            <img src={PEARL_BACK_IMAGE_SRC} alt={t('mobile.pearlDeck')} />
            <span className="mobile-deck-count">{G.pearlDeck.length}</span>
          </button>
        </div>
      </div>

      <div>
        <div className="mobile-section-title">{t('mobile.marketCharacters')}</div>
        <div className="mobile-market-row mobile-market-row--characters">
          {[0, 1].map(i => {
            const card = characterSlots[i];
            return card ? (
              <button
                key={`char-${i}`}
                type="button"
                className="mobile-card-btn mobile-card-btn--character"
                onClick={() => core.takeCharacterFromDisplay(i)}
              >
                <img src={characterImageSrc(card)} alt={card.name} />
              </button>
            ) : (
              <div key={`char-empty-${i}`} className="mobile-card-btn mobile-card-btn--character mobile-card-btn--portal-empty" />
            );
          })}

          <button
            type="button"
            className="mobile-card-btn mobile-card-btn--character mobile-card-btn--deck"
            onClick={() => core.takeCharacterFromDeck()}
            disabled={G.characterDeck.length === 0}
          >
            <img src={CHARACTER_BACK_IMAGE_SRC} alt={t('mobile.characterDeck')} />
            <span className="mobile-deck-count">{G.characterDeck.length}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
