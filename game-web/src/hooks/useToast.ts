import { useState, useCallback } from 'react';
import type { ToastMessage, ToastType } from '../components/Toast';

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (message: string, type: ToastType = 'info', duration = 3000) => {
      const id = `${Date.now()}-${Math.random()}`;
      const newToast: ToastMessage = { id, message, type, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        const timer = setTimeout(() => {
          removeToast(id);
        }, duration);

        return () => clearTimeout(timer);
      }

      return () => removeToast(id);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (message: string, duration?: number) =>
      addToast(message, 'success', duration),
    [addToast]
  );

  const error = useCallback(
    (message: string, duration?: number) =>
      addToast(message, 'error', duration),
    [addToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) =>
      addToast(message, 'warning', duration),
    [addToast]
  );

  const info = useCallback(
    (message: string, duration?: number) =>
      addToast(message, 'info', duration),
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
