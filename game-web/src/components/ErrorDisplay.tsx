import { useState, useEffect } from 'react';
import '../styles/Components.css';

interface ErrorDisplayProps {
  error?: string;
  onDismiss?: () => void;
}

export function ErrorDisplay({ error, onDismiss }: ErrorDisplayProps) {
  const [visible, setVisible] = useState(!!error);

  useEffect(() => {
    setVisible(!!error);
    if (error) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, onDismiss]);

  if (!visible || !error) return null;

  return (
    <div className="error-display">
      <div className="error-content">
        <span className="error-icon">⚠️</span>
        <span className="error-text">{error}</span>
        <button
          className="error-close"
          onClick={() => {
            setVisible(false);
            onDismiss?.();
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
