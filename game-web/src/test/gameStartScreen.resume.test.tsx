import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameStartScreen } from '../components/GameStartScreen';

describe('GameStartScreen Resume Functionality', () => {
  it('does not show resume button when canResume is false', () => {
    const onStartGame = vi.fn();
    const onResumeGame = vi.fn();

    render(
      <GameStartScreen
        onStartGame={onStartGame}
        onResumeGame={onResumeGame}
        canResume={false}
      />
    );

    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /resume game/i })).not.toBeInTheDocument();
  });

  it('shows resume button when canResume is true', () => {
    const onStartGame = vi.fn();
    const onResumeGame = vi.fn();

    render(
      <GameStartScreen
        onStartGame={onStartGame}
        onResumeGame={onResumeGame}
        canResume={true}
      />
    );

    expect(screen.getByRole('button', { name: /resume game/i })).toBeInTheDocument();
  });

  it('calls onResumeGame when resume button is clicked', () => {
    const onStartGame = vi.fn();
    const onResumeGame = vi.fn();

    render(
      <GameStartScreen
        onStartGame={onStartGame}
        onResumeGame={onResumeGame}
        canResume={true}
      />
    );

    const resumeBtn = screen.getByRole('button', { name: /resume game/i });
    fireEvent.click(resumeBtn);

    expect(onResumeGame).toHaveBeenCalledTimes(1);
  });

  it('does not show resume button when onResumeGame is not provided', () => {
    const onStartGame = vi.fn();

    render(
      <GameStartScreen
        onStartGame={onStartGame}
        canResume={true}
      />
    );

    expect(screen.queryByRole('button', { name: /resume game/i })).not.toBeInTheDocument();
  });

  it('shows both buttons when canResume is true and onResumeGame is provided', () => {
    const onStartGame = vi.fn();
    const onResumeGame = vi.fn();

    render(
      <GameStartScreen
        onStartGame={onStartGame}
        onResumeGame={onResumeGame}
        canResume={true}
      />
    );

    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resume game/i })).toBeInTheDocument();
  });
});
