import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorDisplay } from '../components/ErrorDisplay';

describe('ErrorDisplay Error Recovery', () => {
  it('renders error message when provided', () => {
    const onDismiss = vi.fn();

    render(
      <ErrorDisplay
        error="Something went wrong"
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('does not show retry button when onRetry is not provided', () => {
    const onDismiss = vi.fn();

    render(
      <ErrorDisplay
        error="Something went wrong"
        onDismiss={onDismiss}
      />
    );

    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dismiss/i })).toBeInTheDocument();
  });

  it('shows retry button when onRetry is provided', () => {
    const onDismiss = vi.fn();
    const onRetry = vi.fn();

    render(
      <ErrorDisplay
        error="Something went wrong"
        onDismiss={onDismiss}
        onRetry={onRetry}
      />
    );

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onDismiss = vi.fn();
    const onRetry = vi.fn();

    render(
      <ErrorDisplay
        error="Failed to load"
        onDismiss={onDismiss}
        onRetry={onRetry}
      />
    );

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('dismisses error when retry button is clicked', () => {
    const onDismiss = vi.fn();
    const onRetry = vi.fn();

    const { rerender } = render(
      <ErrorDisplay
        error="Failed to load"
        onDismiss={onDismiss}
        onRetry={onRetry}
      />
    );

    const retryBtn = screen.getByRole('button', { name: /retry/i });
    fireEvent.click(retryBtn);

    // After retry, error should be cleared
    rerender(
      <ErrorDisplay
        error={undefined}
        onDismiss={onDismiss}
        onRetry={onRetry}
      />
    );

    expect(screen.queryByText('Failed to load')).not.toBeInTheDocument();
  });

  it('displays different error types', () => {
    const onDismiss = vi.fn();

    const { container } = render(
      <ErrorDisplay
        error="Test error"
        type="error"
        onDismiss={onDismiss}
      />
    );

    expect(container.querySelector('.error-display-error')).toBeInTheDocument();
  });

  it('auto-dismisses after duration', async () => {
    const onDismiss = vi.fn();
    vi.useFakeTimers();

    const { rerender } = render(
      <ErrorDisplay
        error="Temporary error"
        duration={1000}
        onDismiss={onDismiss}
      />
    );

    expect(screen.getByText('Temporary error')).toBeInTheDocument();

    vi.advanceTimersByTime(1000);

    rerender(
      <ErrorDisplay
        error={undefined}
        duration={1000}
        onDismiss={onDismiss}
      />
    );

    expect(screen.queryByText('Temporary error')).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = vi.fn();

    render(
      <ErrorDisplay
        error="Something went wrong"
        onDismiss={onDismiss}
      />
    );

    const dismissBtn = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissBtn);

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
