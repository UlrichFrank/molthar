import type { GameBoardCore } from '../../hooks/useGameBoardCore';
import { useTranslation } from '../../i18n/useTranslation';

interface ActionBarProps {
  core: GameBoardCore;
  isActive: boolean;
  actionCount: number;
  maxActions: number;
}

/**
 * Task 4.4/6.7: thumb-reachable fixed action bar — end turn, replace pearl slots,
 * and the contextual actions that appear as buttons rather than auto-opened dialogs
 * (hand discard, rehand cards).
 */
export function ActionBar({ core, isActive, actionCount, maxActions }: ActionBarProps) {
  const { t } = useTranslation();
  const canEndTurn = isActive && actionCount >= maxActions;

  return (
    <div className="mobile-action-bar">
      {core.canDiscardHand && (
        <button type="button" className="mobile-action-btn" onClick={core.openHandDiscardDialog}>
          {t('canvas.discardCards')}
        </button>
      )}

      {isActive && actionCount >= maxActions && core.hasChangeHandAbility && !core.rehandDone && (
        <button type="button" className="mobile-action-btn" onClick={core.rehandCards}>
          {t('game.rehandCards')}
        </button>
      )}

      {core.canReplacePearlSlotsFree && (
        <button type="button" className="mobile-action-btn" onClick={core.replacePearlSlotsAbility}>
          {t('canvas.freePearlReplace')}
        </button>
      )}
      {!core.canReplacePearlSlotsFree && (
        <button type="button" className="mobile-action-btn" disabled={!core.canReplacePearlSlots} onClick={core.replacePearlSlots}>
          {t('mobile.replacePearlSlots')}
        </button>
      )}

      <button
        type="button"
        className="mobile-action-btn mobile-action-btn--end-turn"
        disabled={!canEndTurn}
        onClick={core.endTurn}
      >
        {t('game.endTurn')}
      </button>
    </div>
  );
}
