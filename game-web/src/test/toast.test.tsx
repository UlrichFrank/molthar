import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { Toast, ToastContainer } from '../components/Toast';
import { useToast } from '../hooks/useToast';

describe('Toast Component', () => {
  it('renders with message and icon', () => {
    const onDismiss = vi.fn();
    const toast = {
      id: '1',
      type: 'success' as const,
      message: 'Success!',
      duration: 3000,
    };

    render(<Toast toast={toast} onDismiss={onDismiss} />);

    expect(screen.getByText('Success!')).toBeInTheDocument();
  });

  it('calls onDismiss when close button clicked', async () => {
    const onDismiss = vi.fn();
    const toast = {
      id: '1',
      type: 'error' as const,
      message: 'Error occurred',
    };

    render(<Toast toast={toast} onDismiss={onDismiss} />);

    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(onDismiss).toHaveBeenCalledWith('1');
    });
  });

  it('auto-dismisses after duration', async () => {
    const onDismiss = vi.fn();
    const toast = {
      id: '1',
      type: 'info' as const,
      message: 'Info message',
      duration: 100,
    };

    render(<Toast toast={toast} onDismiss={onDismiss} />);

    await waitFor(
      () => {
        expect(onDismiss).toHaveBeenCalledWith('1');
      },
      { timeout: 500 }
    );
  });

  it('has proper ARIA attributes', () => {
    const onDismiss = vi.fn();
    const toast = {
      id: '1',
      type: 'warning' as const,
      message: 'Warning',
    };

    const { container } = render(
      <Toast toast={toast} onDismiss={onDismiss} />
    );

    const element = container.querySelector('[role="status"]');
    expect(element).toHaveAttribute('aria-live', 'polite');
    expect(element).toHaveAttribute('aria-atomic', 'true');
  });
});

describe('ToastContainer', () => {
  it('renders multiple toasts', () => {
    const onDismiss = vi.fn();
    const toasts = [
      { id: '1', type: 'success' as const, message: 'Success 1' },
      { id: '2', type: 'error' as const, message: 'Error 1' },
    ];

    render(<ToastContainer toasts={toasts} onDismiss={onDismiss} />);

    expect(screen.getByText('Success 1')).toBeInTheDocument();
    expect(screen.getByText('Error 1')).toBeInTheDocument();
  });

  it('renders empty when no toasts', () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <ToastContainer toasts={[]} onDismiss={onDismiss} />
    );

    const toasts = container.querySelectorAll('.toast');
    expect(toasts.length).toBe(0);
  });
});

describe('useToast Hook', () => {
  it('adds toast with message and type', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast('Hello', 'success', 0);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Hello');
    expect(result.current.toasts[0].type).toBe('success');
  });

  it('provides success shorthand', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.success('Success message', 0);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe('success');
  });

  it('provides error shorthand', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.error('Error message', 0);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe('error');
  });

  it('provides warning shorthand', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.warning('Warning message', 0);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe('warning');
  });

  it('provides info shorthand', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.info('Info message', 0);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].type).toBe('info');
  });

  it('removes toast by id', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast('Message 1', 'info', 0);
      result.current.addToast('Message 2', 'info', 0);
    });

    expect(result.current.toasts).toHaveLength(2);

    act(() => {
      result.current.removeToast(result.current.toasts[0].id);
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe('Message 2');
  });

  it('generates unique toast IDs', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast('Message 1', 'info', 0);
      result.current.addToast('Message 2', 'info', 0);
      result.current.addToast('Message 3', 'info', 0);
    });

    const ids = result.current.toasts.map((t) => t.id);
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toBe(ids.length);
  });

  it('auto-dismisses toast after duration', async () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.addToast('Auto-dismiss', 'info', 100);
    });

    expect(result.current.toasts).toHaveLength(1);

    await waitFor(
      () => {
        expect(result.current.toasts).toHaveLength(0);
      },
      { timeout: 500 }
    );
  });
});
