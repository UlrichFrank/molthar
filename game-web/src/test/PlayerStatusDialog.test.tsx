import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlayerStatusDialog } from '../components/PlayerStatusDialog';
import type { PlayerState } from '@portale-von-molthar/shared';

function makePlayerState(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    id: '0',
    name: 'Bob',
    hand: [],
    portal: [],
    activatedCharacters: [],
    powerPoints: 5,
    diamonds: 2,
    readyUp: false,
    isAI: false,
    handLimitModifier: 0,
    activeAbilities: [],
    colorIndex: 1,
    ...overrides,
  } as PlayerState;
}

describe('PlayerStatusDialog', () => {
  it('renders player name as title', () => {
    render(<PlayerStatusDialog playerState={makePlayerState({ name: 'Bob' })} onClose={() => {}} />);
    expect(screen.getByText('Bob')).toBeDefined();
  });

  it('displays powerPoints and diamonds', () => {
    render(<PlayerStatusDialog playerState={makePlayerState({ powerPoints: 5, diamonds: 2 })} onClose={() => {}} />);
    expect(screen.getByText('5')).toBeDefined();
    expect(screen.getByText(/💎 2/)).toBeDefined();
  });

  it('shows "Keine aktiven Fähigkeiten" when abilities list is empty', () => {
    render(<PlayerStatusDialog playerState={makePlayerState({ activeAbilities: [] })} onClose={() => {}} />);
    expect(screen.getByText('Keine aktiven Fähigkeiten')).toBeDefined();
  });

  it('shows ability names for persistent abilities', () => {
    const state = makePlayerState({
      activeAbilities: [
        { id: 'a1', persistent: true, type: 'handLimitPlusOne', description: '' },
      ],
    });
    render(<PlayerStatusDialog playerState={state} onClose={() => {}} />);
    expect(screen.getByText('+1 Handlimit')).toBeDefined();
  });

  it('does not show non-persistent (red) abilities', () => {
    const state = makePlayerState({
      activeAbilities: [
        { id: 'a1', persistent: false, type: 'threeExtraActions', description: '' },
      ],
    });
    render(<PlayerStatusDialog playerState={state} onClose={() => {}} />);
    expect(screen.getByText('Keine aktiven Fähigkeiten')).toBeDefined();
  });

  it('renders player name from playerName prop instead of playerState.name', () => {
    render(
      <PlayerStatusDialog
        playerState={makePlayerState({ name: 'Player 1' })}
        playerName="Ulrich"
        onClose={() => {}}
      />
    );
    expect(screen.getByText('Ulrich')).toBeDefined();
    expect(screen.queryByText('Player 1')).toBeNull();
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <PlayerStatusDialog playerState={makePlayerState()} onClose={onClose} />
    );
    const overlay = container.querySelector('.game-dialog-overlay') as HTMLElement;
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });
});
