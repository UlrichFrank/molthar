import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce, useDebouncedCallback, useDebouncedAsync } from '../hooks/useDebounce';

describe('useDebounce Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('debounces value changes with default delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'initial' },
    });

    expect(result.current).toBe('initial');

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('updated');
  });

  it('debounces value changes with custom delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 1000), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'first change' });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(result.current).toBe('first change');
  });

  it('resets timer on rapid value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'initial' },
    });

    rerender({ value: 'change1' });
    act(() => vi.advanceTimersByTime(300));

    rerender({ value: 'change2' });
    act(() => vi.advanceTimersByTime(300));

    expect(result.current).toBe('initial');

    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('change2');
  });

  it('works with object values', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: { count: 0 } },
    });

    expect(result.current.count).toBe(0);

    rerender({ value: { count: 1 } });
    expect(result.current.count).toBe(0);

    act(() => vi.advanceTimersByTime(500));
    expect(result.current.count).toBe(1);
  });
});

describe('useDebouncedCallback Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces function calls', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockFn, 500));

    result.current('arg1');
    result.current('arg2');
    result.current('arg3');

    expect(mockFn).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockFn).toHaveBeenCalledOnce();
    expect(mockFn).toHaveBeenCalledWith('arg3');
  });

  it('clears previous timeout on new call', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockFn, 500));

    result.current();
    act(() => vi.advanceTimersByTime(300));

    result.current();
    expect(mockFn).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(200));
    expect(mockFn).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(300));
    expect(mockFn).toHaveBeenCalledOnce();
  });

  it('supports multiple arguments', () => {
    const mockFn = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(mockFn, 500));

    result.current('arg1', 'arg2', 42);

    act(() => vi.advanceTimersByTime(500));

    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 42);
  });
});

describe('useDebouncedAsync Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it.skip('debounces async function calls', async () => {
    vi.useRealTimers();
    const mockAsyncFn = vi.fn().mockResolvedValue('result');
    const { result } = renderHook(() => useDebouncedAsync(mockAsyncFn, 500));

    vi.useFakeTimers();

    const promise1 = result.current('arg1');
    const promise2 = result.current('arg2');

    expect(mockAsyncFn).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    vi.useRealTimers();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_result1, _result2] = await Promise.all([promise1, promise2]);

    vi.useFakeTimers();

    expect(mockAsyncFn).toHaveBeenCalledOnce();
    expect(mockAsyncFn).toHaveBeenCalledWith('arg2');
  });

  it('handles async function errors gracefully', async () => {
    vi.useRealTimers();
    const mockAsyncFn = vi.fn().mockRejectedValue(new Error('API error'));
    const { result } = renderHook(() => useDebouncedAsync(mockAsyncFn, 500));

    vi.useFakeTimers();

    const promise = result.current();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    vi.useRealTimers();
    const response = await promise;
    vi.useFakeTimers();

    expect(response).toBeUndefined();
  });

  it('resolves with async function result', async () => {
    vi.useRealTimers();
    const mockAsyncFn = vi.fn().mockResolvedValue('async result');
    const { result } = renderHook(() => useDebouncedAsync(mockAsyncFn, 500));

    vi.useFakeTimers();

    const promise = result.current();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    vi.useRealTimers();
    const response = await promise;
    vi.useFakeTimers();

    expect(response).toBe('async result');
  });
});
