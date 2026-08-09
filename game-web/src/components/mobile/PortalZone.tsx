import type { GameBoardCore } from '../../hooks/useGameBoardCore';
import { characterImageSrc } from '../../lib/cardImageSrc';
import { useTranslation } from '../../i18n/useTranslation';

interface PortalZoneProps {
  core: GameBoardCore;
  onOpenActivatedGrid: () => void;
}

/** Task 4.2: own portal — up to 2 character slots, diamond count, activated-characters counter. */
export function PortalZone({ core, onOpenActivatedGrid }: PortalZoneProps) {
  const { t } = useTranslation();
  const portal = core.playerPortal;

  return (
    <div className="mobile-zone">
      <div className="mobile-section-title">{t('mobile.portal')}</div>
      <div className="mobile-portal-section">
        <div className="mobile-portal-slots">
          {[0, 1].map(i => {
            const entry = portal[i];
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                {entry ? (
                  <button
                    type="button"
                    className={'mobile-card-btn mobile-card-btn--portal' + (core.canAct ? ' mobile-card-btn--actionable' : '')}
                    onClick={() => core.openOwnPortalSlot(i)}
                  >
                    <img src={characterImageSrc(entry.card)} alt={entry.card.name} />
                  </button>
                ) : (
                  <div className="mobile-card-btn mobile-card-btn--portal mobile-card-btn--portal-empty" aria-hidden="true" />
                )}
                {/* Task 4.2 fix: mirrors canvasRegions.ts — only rendered when the swap ability
                    is actually usable (isActive, actionCount === 0, changeCharacterActions active). */}
                {entry && core.canSwapPortal && (
                  <button
                    type="button"
                    className="mobile-action-btn"
                    style={{ padding: '2px 8px', fontSize: '0.65rem', flex: '0 0 auto' }}
                    onClick={() => core.openPortalSwap(i)}
                  >
                    {t('canvas.swap')}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className="mobile-portal-meta">
          <span>💎 {core.playerDiamonds}</span>
          <button type="button" className="mobile-activated-counter" onClick={onOpenActivatedGrid}>
            {t('mobile.activatedCount', { count: core.activatedCards.length })}
          </button>
        </div>
      </div>
    </div>
  );
}
