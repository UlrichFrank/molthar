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

/** Task 6.8: opponent's portal + activated characters, reachable from the status bar. */
export function OpponentDetailSheet({ G, core, playerId, onClose }: OpponentDetailSheetProps) {
  const { t } = useTranslation();
  const player = G.players?.[playerId];
  if (!player) return null;
  const name = core.resolvePlayerName(playerId, player.name);
  const portal = player.portal ?? [];
  const activated = player.activatedCharacters ?? [];

  return (
    <GameDialog onOverlayClick={onClose}>
      <GameDialogTitle>{name}</GameDialogTitle>

      <div className="mobile-section-title">{t('mobile.portal')}</div>
      <div className="mobile-portal-slots" style={{ marginBottom: 16 }}>
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
      <div className="game-dialog-actions" style={{ justifyContent: 'center' }}>
        <button
          type="button"
          className="game-dialog-btn-neutral"
          style={{ flex: 'none', padding: '0.6rem 2rem' }}
          onClick={onClose}
        >
          {t('common.close')}
        </button>
      </div>
    </GameDialog>
  );
}
