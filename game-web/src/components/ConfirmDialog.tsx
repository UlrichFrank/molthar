import { useEffect } from 'react';
import { generateId, focusManager } from '../lib/accessibility';
import '../styles/Dialog.css';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isOpen?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isOpen = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogId = generateId('dialog');
  const titleId = generateId('title');
  const messageId = generateId('message');

  useEffect(() => {
    if (!isOpen) return;

    // Focus first button (cancel by default to prevent accidental confirmation)
    const cancelBtn = document.querySelector(`#${dialogId} [data-action="cancel"]`) as HTMLButtonElement;
    if (cancelBtn) {
      focusManager.focus(`#${dialogId} [data-action="cancel"]`);
    }

    // Trap focus within dialog
    const dialog = document.querySelector(`#${dialogId}`) as HTMLElement;
    if (dialog) {
      const unsubscribe = focusManager.trapFocus(dialog);
      return () => unsubscribe?.();
    }
  }, [dialogId, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div
        id={dialogId}
        className="dialog"
        role="alertdialog"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-header">
          <h2 id={titleId} className="dialog-title">
            {title}
          </h2>
        </div>

        <div className="dialog-content">
          <p id={messageId} className="dialog-message">
            {message}
          </p>
        </div>

        <div className="dialog-footer">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            data-action="cancel"
            aria-label={`${cancelText} dialog`}
          >
            {cancelText}
          </button>
          <button
            className={`btn ${isDangerous ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            data-action="confirm"
            aria-label={`${confirmText} action`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
