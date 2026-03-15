import { useEffect, useState, useRef } from 'react';

/**
 * Debounce a value with configurable delay
 * Useful for optimizing expensive operations (API calls, search, etc.)
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounce a callback function
 * Useful for handling rapid events (scroll, resize, input, etc.)
 */
export function useDebouncedCallback<TArgs extends any[], TResult>(
  callback: (...args: TArgs) => TResult,
  delay: number = 500
): (...args: TArgs) => void {
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedCallback = (...args: TArgs) => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    timeoutIdRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Debounce an async function
 * Useful for debouncing async operations like API calls
 */
export function useDebouncedAsync<TArgs extends any[], TResult>(
  asyncFn: (...args: TArgs) => Promise<TResult>,
  delay: number = 500
): (...args: TArgs) => Promise<TResult | undefined> {
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedAsync = (...args: TArgs): Promise<TResult | undefined> => {
    return new Promise((resolve) => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }

      timeoutIdRef.current = setTimeout(async () => {
        try {
          const result = await asyncFn(...args);
          resolve(result);
        } catch (error) {
          console.error('Debounced async error:', error);
          resolve(undefined);
        }
      }, delay);
    });
  };

  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, []);

  return debouncedAsync;
}
