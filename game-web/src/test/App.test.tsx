import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../App';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { CardInfo } from '../components/CardInfo';
import type { CharacterCard } from '../lib/types';

describe('App', () => {
  it('renders the game start screen', () => {
    render(<App />);
    const heading = screen.getByText(/Portale von Molthar/i);
    expect(heading).toBeDefined();
  });

  it('renders start game button', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /Start Game/i });
    expect(button).toBeDefined();
  });
});

describe('ErrorDisplay Component', () => {
  it('renders error message when error is provided', () => {
    render(<ErrorDisplay error="Test error message" />);
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('does not render when error is undefined', () => {
    const { container } = render(<ErrorDisplay error={undefined} />);
    expect(container.querySelector('.error-display')).not.toBeInTheDocument();
  });

  it('calls onDismiss when close button is clicked', () => {
    const onDismiss = vi.fn();
    render(<ErrorDisplay error="Test error" onDismiss={onDismiss} />);
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(onDismiss).toHaveBeenCalled();
  });
});

describe('CardInfo Component', () => {
  const mockCharacter: CharacterCard = {
    id: 'test-1',
    name: 'Test Hero',
    cost: [{ type: 'number', value: 5 }],
    powerPoints: 3,
    diamonds: 2,
    ability: 'none',
  };

  it('renders character name and stats', () => {
    render(<CardInfo character={mockCharacter} />);
    expect(screen.getByText('Test Hero')).toBeInTheDocument();
    expect(screen.getByText(/⚡3/)).toBeInTheDocument();
    expect(screen.getByText(/💎2/)).toBeInTheDocument();
  });

  it('displays cost information', () => {
    render(<CardInfo character={mockCharacter} />);
    expect(screen.getByText(/Cost:/)).toBeInTheDocument();
  });

  it('does not display ability when ability is none', () => {
    render(<CardInfo character={mockCharacter} />);
    expect(screen.queryByText(/Ability:/)).not.toBeInTheDocument();
  });
});
