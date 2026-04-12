import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EndTurnButton } from '../components/EndTurnButton';

describe('EndTurnButton', () => {
  it('renders null when not active', () => {
    const { container } = render(
      <EndTurnButton isActive={false} actionCount={3} maxActions={3} onEndTurn={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders null when actions not exhausted', () => {
    const { container } = render(
      <EndTurnButton isActive={true} actionCount={1} maxActions={3} onEndTurn={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders null when active but 0 actions taken and max is 3', () => {
    const { container } = render(
      <EndTurnButton isActive={true} actionCount={0} maxActions={3} onEndTurn={() => {}} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders button when active and actions exhausted', () => {
    render(<EndTurnButton isActive={true} actionCount={3} maxActions={3} onEndTurn={() => {}} />);
    expect(screen.getByRole('button', { name: /Zug beenden/i })).toBeDefined();
  });

  it('calls onEndTurn when clicked', () => {
    const onEndTurn = vi.fn();
    render(<EndTurnButton isActive={true} actionCount={3} maxActions={3} onEndTurn={onEndTurn} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onEndTurn).toHaveBeenCalledOnce();
  });

  it('renders button when actionCount exceeds maxActions', () => {
    render(<EndTurnButton isActive={true} actionCount={4} maxActions={3} onEndTurn={() => {}} />);
    expect(screen.getByRole('button')).toBeDefined();
  });
});
