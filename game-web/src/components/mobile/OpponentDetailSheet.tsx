import type { GameState } from '@portale-von-molthar/shared';
import type { GameBoardCore } from '../../hooks/useGameBoardCore';
import { GameDialog, GameDialogTitle } from '../GameDialog';
import { characterImageSrc } from '../../lib/cardImageSrc';
import { useTranslation } from '../../i18n/useTranslation';

interface OpponentDetailSheetProps {
  G: GameState;
  core: GameBoardCore;
  playerId: string;
  onClose: () => void;
}

/**
 * Task 6.8/review point 3: opponent's portal + activated characters, reachable
 * from the status bar. The header mirrors what CanvasGameBoard/gameRender.ts show
 * per opponent zone: power points, diamonds and hand-card count (count only —
 * the cards themselves stay face-down).
 */
export function OpponentDetailSheet({ G, core, playerId, onClose }: OpponentDetailSheetProps) {
  const { t } = useTranslation();
  const player = G.players?.[playerId];
  if (!player) return null;
  const name = core.resolvePlayerName(playerId, player.name);
  const portal = player.portal ?? [];
  const activated = player.activatedCharacters ?? [];
  const handCount = player.hand?.length ?? 0;
  const diamonds = player.diamondCards?.length ?? 0;

  return (
    <GameDialog onOverlayClick={onClose}>
      <GameDialogTitle>{name}</GameDialogTitle>

      <div className="mobile-opponent-sheet-header">
        <span className="mobile-status-detail-points">★{player.powerPoints}</span>
        <span className="mobile-status-detail-diamonds">💎{diamonds}</span>
        <span className="mobile-opponent-sheet-hand-count">{t('mobile.handCount', { count: handCount })}</span>
      </div>

      <div className="mobile-section-title">{t('mobile.portal')}</div>
      <div className="mobile-portal-slots mobile-portal-slots--sheet">
        {[0, 1].map(i => {
          const entry = portal[i];
          return entry ? (
            <button
              key={i}
              type="button"
              className="mobile-card-btn mobile-card-btn--portal"
              onClick={() => { core.openOpponentPortalSlot(playerId, i); onClose(); }}
            >
              <img src={characterImageSrc(entry.card)} alt={entry.card.name} />
            </button>
          ) : (
            <div key={i} className="mobile-card-btn mobile-card-btn--portal mobile-card-btn--portal-empty" aria-hidden="true" />
          );
        })}
      </div>

      <div className="mobile-section-title">{t('mobile.activatedTitle', { count: activated.length })}</div>
      <div className="mobile-activated-grid">
        {activated.map((entry, i) => (
          <button
            key={entry.id}
            type="button"
            className="mobile-card-btn mobile-card-btn--portal"
            onClick={() => { core.openOpponentActivatedCharacter(playerId, i); onClose(); }}
          >
            <img src={characterImageSrc(entry.card)} alt={entry.card.name} />
          </button>
        ))}
      </div>
      {/* Fix: visible close button — at max-height: 85dvh, overlay-tap-to-close alone
          leaves only a thin strip to reach above the sheet. */}
      <div className="game-dialog-actions mobile-opponent-sheet-actions">
        <button
          type="button"
          className="game-dialog-btn-neutral mobile-opponent-sheet-close-btn"
          onClick={onClose}
        >
          {t('common.close')}
        </button>
      </div>
    </GameDialog>
  );
}
