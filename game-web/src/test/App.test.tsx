import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders the main heading', () => {
    render(<App />);
    const heading = screen.getByText(/Portale von Molthar/i);
    expect(heading).toBeDefined();
  });

  it('renders button with initial count', () => {
    render(<App />);
    const button = screen.getByRole('button', { name: /Count is 0/i });
    expect(button).toBeDefined();
  });
});
