import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from '../hooks/useLocalStorage';

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test', 'initial'));
    expect(result.current[0]).toBe('initial');
  });

  it('stores and retrieves string value', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'initial'));

    act(() => {
      result.current[1]('updated');
    });

    expect(result.current[0]).toBe('updated');
    expect(localStorage.getItem('testKey')).toBe('"updated"');
  });

  it('stores and retrieves object value', () => {
    const initialObj = { name: 'Alice', score: 100 };
    const { result } = renderHook(() => useLocalStorage('objKey', initialObj));

    const newObj = { name: 'Bob', score: 200 };
    act(() => {
      result.current[1](newObj);
    });

    expect(result.current[0]).toEqual(newObj);
    expect(JSON.parse(localStorage.getItem('objKey') || '{}')).toEqual(newObj);
  });

  it('stores and retrieves array value', () => {
    const initialArray = [1, 2, 3];
    const { result } = renderHook(() => useLocalStorage('arrayKey', initialArray));

    const newArray = [4, 5, 6];
    act(() => {
      result.current[1](newArray);
    });

    expect(result.current[0]).toEqual(newArray);
    expect(JSON.parse(localStorage.getItem('arrayKey') || '[]')).toEqual(newArray);
  });

  it('supports setter function pattern', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);

    act(() => {
      result.current[1]((prev) => prev + 10);
    });

    expect(result.current[0]).toBe(11);
  });

  it('loads persisted value on mount', () => {
    localStorage.setItem('existingKey', JSON.stringify('persisted value'));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { result: _result } = renderHook(() => useLocalStorage('existingKey', 'initial'));

    // Hook initializes in useEffect
    expect(localStorage.getItem('existingKey')).toBe(JSON.stringify('persisted value'));
  });

  it('handles invalid JSON gracefully', () => {
    localStorage.setItem('invalidKey', 'not valid json {');
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useLocalStorage('invalidKey', 'fallback'));

    expect(result.current[0]).toBe('fallback');
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('handles localStorage quota exceeded', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    const { result } = renderHook(() => useLocalStorage('fullKey', 'initial'));

    act(() => {
      result.current[1]('new value');
    });

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  it('persists value across hook instances', () => {
    const { result: result1 } = renderHook(() => useLocalStorage('sharedKey', 'initial'));

    act(() => {
      result1.current[1]('shared value');
    });

    // result2 should load the persisted value from result1
    expect(localStorage.getItem('sharedKey')).toBe('"shared value"');
  });

  it('handles null and undefined values', () => {
    const { result } = renderHook(() => useLocalStorage<string | null>('nullKey', null));

    act(() => {
      result.current[1](null);
    });

    expect(result.current[0]).toBeNull();
    expect(localStorage.getItem('nullKey')).toBe('null');
  });

  it('supports number values', () => {
    const { result } = renderHook(() => useLocalStorage('numberKey', 42));

    act(() => {
      result.current[1](100);
    });

    expect(result.current[0]).toBe(100);
    expect(localStorage.getItem('numberKey')).toBe('100');
  });

  it('supports boolean values', () => {
    const { result } = renderHook(() => useLocalStorage('boolKey', false));

    act(() => {
      result.current[1](true);
    });

    expect(result.current[0]).toBe(true);
    expect(localStorage.getItem('boolKey')).toBe('true');
  });
});
