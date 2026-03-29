import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders the lobby screen', () => {
    render(<App />);
    const heading = screen.getByText(/Portale von Molthar/i);
    expect(heading).toBeDefined();
  });
});
