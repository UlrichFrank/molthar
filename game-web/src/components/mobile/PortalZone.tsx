import type { GameBoardCore } from '../../hooks/useGameBoardCore';
import { characterImageSrc } from '../../lib/cardImageSrc';
import { useTranslation } from '../../i18n/useTranslation';

interface PortalZoneProps {
  core: GameBoardCore;
}

/** Own portal — two character slots (same row as the character market). */
export function PortalZone({ core }: PortalZoneProps) {
  const { t } = useTranslation();
  const portal = core.playerPortal;

  return (
    <div className="mobile-portal-slots" aria-label={t('mobile.portal')}>
      {[0, 1].map(i => {
        const entry = portal[i];
        return (
          <div key={i} className="mobile-portal-slot-col">
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
            {/* Mirrors canvasRegions.ts — only rendered when the swap ability is usable. */}
            {entry && core.canSwapPortal && (
              <button type="button" className="mobile-action-btn mobile-portal-swap-btn" onClick={() => core.openPortalSwap(i)}>
                {t('canvas.swap')}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Own activated characters as an overlapping fan, always visible; the count opens the full grid. */
export function OwnActivatedRow({ core, onOpenActivatedGrid }: { core: GameBoardCore; onOpenActivatedGrid: () => void }) {
  const { t } = useTranslation();
  const list = core.activatedCharacters;
  return (
    <div className="mobile-own-activated">
      <div className="mobile-fan" style={{ '--n': Math.max(list.length, 2) } as React.CSSProperties}>
        {list.map((entry, i) => (
          <button key={entry.id} type="button" className="mobile-card-btn mobile-card-btn--activated" onClick={() => core.setActiveCharacterIndex(i)}>
            <img src={characterImageSrc(entry.card)} alt={entry.card.name} />
          </button>
        ))}
        {list.length === 0 && <span className="mobile-fan-empty">{t('mobile.activatedTitle', { count: 0 })}</span>}
      </div>
      <button type="button" className="mobile-activated-counter" onClick={onOpenActivatedGrid}>
        💎 {core.playerDiamonds} · {t('mobile.activatedCount', { count: list.length })}
      </button>
    </div>
  );
}
