import type { GameBoardCore } from '../../hooks/useGameBoardCore';
import { GameDialog, GameDialogTitle } from '../GameDialog';
import { characterImageSrc } from '../../lib/cardImageSrc';
import { useTranslation } from '../../i18n/useTranslation';

interface ActivatedGridSheetProps {
  core: GameBoardCore;
  onClose: () => void;
}

/** Task 5.1-5.3: scrollable bottom-sheet grid of all activated characters (8–15 realistic). */
export function ActivatedGridSheet({ core, onClose }: ActivatedGridSheetProps) {
  const { t } = useTranslation();

  return (
    <GameDialog onOverlayClick={onClose}>
      <GameDialogTitle>{t('mobile.activatedTitle', { count: core.activatedCharacters.length })}</GameDialogTitle>
      <div className="mobile-activated-grid">
        {core.activatedCharacters.map((entry, i) => (
          <button
            key={entry.id}
            type="button"
            className="mobile-card-btn mobile-card-btn--portal"
            onClick={() => { core.setActiveCharacterIndex(i); onClose(); }}
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
