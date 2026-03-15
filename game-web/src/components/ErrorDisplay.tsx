import { useState, useEffect } from 'react';
import '../styles/Components.css';

interface ErrorDisplayProps {
  message?: string | undefined;
  error?: string | undefined;
  onDismiss?: () => void;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'info';
  duration?: number;
}

export function ErrorDisplay({
  message,
  error,
  onDismiss,
  onRetry,
  type = 'error',
  duration = 5000,
}: ErrorDisplayProps) {
  const [visible, setVisible] = useState(!!message || !!error);
  const displayMessage = message || error;

  useEffect(() => {
    if (!displayMessage) {
      setVisible(false);
      return;
    }

    setVisible(true);

    if (duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [displayMessage, duration, onDismiss]);

  if (!visible || !displayMessage) {
    return null;
  }

  const icon = {
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  }[type];

  return (
    <div
      className={`error-display error-display-${type}`}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="error-content">
        <span className="error-icon">{icon}</span>
        <p className="error-text">{displayMessage}</p>
      </div>
      <div className="error-actions">
        {onRetry && (
          <button
            className="error-retry"
            onClick={() => {
              onRetry();
              setVisible(false);
            }}
            aria-label="Retry the action"
          >
            🔄 Retry
          </button>
        )}
        <button
          className="error-dismiss"
          onClick={() => {
            setVisible(false);
            onDismiss?.();
          }}
          aria-label="Dismiss error message"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
