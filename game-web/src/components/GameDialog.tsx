import React from 'react';
import { useTranslation } from '../i18n/useTranslation';

interface GameDialogProps {
  children: React.ReactNode;
  variant?: 'default' | 'wide' | 'split';
  onOverlayClick?: () => void;
}

export function GameDialog({ children, variant = 'default', onOverlayClick }: GameDialogProps) {
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onOverlayClick && e.currentTarget === e.target) {
      onOverlayClick();
    }
  };

  const dialogClasses = ['game-dialog'];
  if (variant === 'wide') dialogClasses.push('game-dialog--wide');
  if (variant === 'split') {
    dialogClasses.push('game-dialog--wide');
    dialogClasses.push('game-dialog--split');
  }

  return (
    <div className="game-dialog-overlay" onClick={handleOverlayClick}>
      <div className={dialogClasses.join(' ')}>
        {children}
      </div>
    </div>
  );
}

interface GameDialogTitleProps {
  children: React.ReactNode;
}

export function GameDialogTitle({ children }: GameDialogTitleProps) {
  return <h2 className="game-dialog-title">{children}</h2>;
}

interface GameDialogActionsProps {
  confirmLabel: string;
  confirmDisabled?: boolean;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function GameDialogActions({
  confirmLabel,
  confirmDisabled = false,
  cancelLabel,
  onConfirm,
  onCancel,
}: GameDialogActionsProps) {
  const { t } = useTranslation();
  const resolvedCancelLabel = cancelLabel ?? t('common.cancel');
  return (
    <div className="game-dialog-actions">
      <button
        className="game-dialog-btn-confirm"
        onClick={onConfirm}
        disabled={confirmDisabled}
      >
        {confirmLabel}
      </button>
      <button className="game-dialog-btn-cancel" onClick={onCancel}>
        {resolvedCancelLabel}
      </button>
    </div>
  );
}

interface CardPickerProps<T> {
  cards: T[];
  selected: Set<number>;
  /** Indices reserved for trade (shown dimmed with 💎 symbol, not selectable as hand cards) */
  reserved?: Set<number>;
  onToggle: (i: number) => void;
  getImageSrc: (card: T) => string;
  getAlt: (card: T) => string;
}

export function CardPicker<T>({
  cards,
  selected,
  reserved,
  onToggle,
  getImageSrc,
  getAlt,
}: CardPickerProps<T>) {
  return (
    <div className="game-dialog-card-grid">
      {cards.map((card, idx) => (
        <button
          key={idx}
          className="game-dialog-card-btn"
          onClick={() => onToggle(idx)}
        >
          <img src={getImageSrc(card)} alt={getAlt(card)} />
          {selected.has(idx) && <div className="game-dialog-card-selected-overlay" />}
          {reserved?.has(idx) && <div className="game-dialog-card-reserved-overlay">💎</div>}
        </button>
      ))}
    </div>
  );
}
