import { useEffect, useState } from 'react';
import '../styles/Toast.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onDismiss(toast.id);
      }, 300); // Match animation duration
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const icon = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }[toast.type];

  return (
    <div
      className={`toast toast-${toast.type} ${isExiting ? 'toast-exit' : ''}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span className="toast-icon">{icon}</span>
      <span className="toast-message">{toast.message}</span>
      <button
        className="toast-close"
        onClick={() => {
          setIsExiting(true);
          setTimeout(() => onDismiss(toast.id), 300);
        }}
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
