import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

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
