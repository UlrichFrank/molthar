import { useState, useMemo } from 'react';
import type { PearlCard } from '@portale-von-molthar/shared';
import { GameDialog, GameDialogTitle, GameDialogActions, CardPicker } from './GameDialog';
import { useTranslation } from '../i18n/useTranslation';

interface DiscardCardsDialogProps {
  hand: PearlCard[];
  excessCardCount: number;
  currentHandLimit: number;
  onDiscard: (selectedCardIndices: number[]) => void;
  onCancel: () => void;
}

export function DiscardCardsDialog({
  hand,
  excessCardCount,
  currentHandLimit,
  onDiscard,
  onCancel,
}: DiscardCardsDialogProps) {
  const { t } = useTranslation();
  const [selectedCardIndices, setSelectedCardIndices] = useState<Set<number>>(new Set());

  const isValidSelection = useMemo(() => {
    return selectedCardIndices.size === excessCardCount;
  }, [selectedCardIndices, excessCardCount]);

  const toggleCard = (index: number) => {
    const newSelected = new Set(selectedCardIndices);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedCardIndices(newSelected);
  };

  const handleDiscard = () => {
    if (isValidSelection) {
      onDiscard(Array.from(selectedCardIndices).sort());
    }
  };

  return (
    <GameDialog>
      <GameDialogTitle>{t('discard.title')}</GameDialogTitle>

      <div className="game-dialog-info">
        <p className="game-dialog-info-text">{t('discard.handSize', { count: hand.length })}</p>
        <p className="game-dialog-info-text">{t('discard.handLimit', { count: currentHandLimit })}</p>
        <p className="game-dialog-info-text game-dialog-info-text--warning">
          {excessCardCount === 1
            ? t('discard.mustDiscardOne', { count: excessCardCount })
            : t('discard.mustDiscardMany', { count: excessCardCount })}
        </p>
      </div>

      <div>
        <h3 style={{ margin: '0.5rem 0', fontSize: 'clamp(1rem, 4vw, 1.2rem)' }}>
          {excessCardCount === 1
            ? t('discard.selectOne', { count: excessCardCount })
            : t('discard.selectMany', { count: excessCardCount })}
        </h3>
        <CardPicker
          cards={hand}
          selected={selectedCardIndices}
          onToggle={toggleCard}
          getImageSrc={(card) => `/assets/Perlenkarte${card.value}${card.hasRefreshSymbol ? '-neu' : ''}.png`}
          getAlt={(card) => `Pearl ${card.value}`}
        />
      </div>

      <GameDialogActions
        confirmLabel={isValidSelection ? t('discard.confirm') : t('discard.invalidSelection')}
        confirmDisabled={!isValidSelection}
        onConfirm={handleDiscard}
        onCancel={onCancel}
      />
    </GameDialog>
  );
}
