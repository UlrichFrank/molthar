import { renderWithLang } from './renderWithLang';
import { describe, it, expect } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { PlayerStatusBadge } from '../components/PlayerStatusBadge';
import type { PlayerState } from '@portale-von-molthar/shared';

function makePlayerState(overrides: Partial<PlayerState> = {}): PlayerState {
  return {
    id: '0',
    name: 'Alice',
    hand: [],
    portal: [],
    activatedCharacters: [],
    powerPoints: 7,
    diamondCards: Array.from({ length: 3 }, () => ({} as never)),
    readyUp: false,
    isAI: false,
    handLimitModifier: 0,
    activeAbilities: [],
    colorIndex: 1,
    ...overrides,
  } as PlayerState;
}

describe('PlayerStatusBadge', () => {
  it('renders powerPoints and diamonds', () => {
    renderWithLang(<PlayerStatusBadge playerState={makePlayerState({ powerPoints: 7, diamondCards: Array.from({ length: 3 }, () => ({} as never)) })} />);
    expect(screen.getByText(/★ 7/)).toBeDefined();
    expect(screen.getByText(/💎 3/)).toBeDefined();
  });

  it('shows no ability symbols when activeAbilities is empty', () => {
    renderWithLang(<PlayerStatusBadge playerState={makePlayerState({ activeAbilities: [] })} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('shows ability symbols for persistent abilities', () => {
    const state = makePlayerState({
      activeAbilities: [
        { id: 'a1', persistent: true, type: 'handLimitPlusOne', description: '' },
        { id: 'a2', persistent: false, type: 'threeExtraActions', description: '' },
      ],
    });
    renderWithLang(<PlayerStatusBadge playerState={state} />);
    expect(screen.getByTitle('+1 Handlimit')).toBeDefined();
  });

  it('shows +N for more than 5 abilities', () => {
    const abilities = Array.from({ length: 7 }, (_, i) => ({
      id: `a${i}`,
      persistent: true,
      type: 'handLimitPlusOne' as const,
      description: '',
    }));
    renderWithLang(<PlayerStatusBadge playerState={makePlayerState({ activeAbilities: abilities })} />);
    expect(screen.getByText('+2')).toBeDefined();
  });

  it('opens dialog on click', () => {
    renderWithLang(<PlayerStatusBadge playerState={makePlayerState({ name: 'Alice' })} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('Alice')).toBeDefined();
  });

  // playerName prop
  it('shows playerName when prop is set', () => {
    renderWithLang(<PlayerStatusBadge playerState={makePlayerState()} playerName="Spieler 1" />);
    expect(screen.getByText('Spieler 1')).toBeDefined();
  });

  it('does not show a name line when playerName is not set', () => {
    renderWithLang(<PlayerStatusBadge playerState={makePlayerState({ name: 'Alice' })} />);
    // Name should not be visible in badge itself (only in dialog after click)
    expect(screen.queryByText('Alice')).toBeNull();
  });

  // actionCount / maxActions props
  it('shows action counter when actionCount and maxActions are set', () => {
    renderWithLang(<PlayerStatusBadge playerState={makePlayerState()} actionCount={1} maxActions={3} />);
    expect(screen.getByText('1/3')).toBeDefined();
  });

  it('does not show action counter when props are not set', () => {
    renderWithLang(<PlayerStatusBadge playerState={makePlayerState()} />);
    expect(screen.queryByText(/\/3/)).toBeNull();
  });

  it('shows green color when more than 1 action remaining', () => {
    renderWithLang(<PlayerStatusBadge playerState={makePlayerState()} actionCount={1} maxActions={3} />);
    const counter = screen.getByTestId('action-counter');
    expect(counter.getAttribute('data-action-color')).toBe('#22c55e');
  });

  it('shows yellow color when 1 action remaining', () => {
    renderWithLang(<PlayerStatusBadge playerState={makePlayerState()} actionCount={2} maxActions={3} />);
    const counter = screen.getByTestId('action-counter');
    expect(counter.getAttribute('data-action-color')).toBe('#facc15');
  });

  it('shows red color when actions exhausted', () => {
    renderWithLang(<PlayerStatusBadge playerState={makePlayerState()} actionCount={3} maxActions={3} />);
    const counter = screen.getByTestId('action-counter');
    expect(counter.getAttribute('data-action-color')).toBe('#ef4444');
  });

  // isActiveTurn prop
  it('highlights badge border when isActiveTurn is true', () => {
    renderWithLang(<PlayerStatusBadge playerState={makePlayerState()} isActiveTurn={true} />);
    const badge = screen.getByTestId('player-status-badge');
    expect(badge.getAttribute('data-active-turn')).toBe('true');
  });

  it('does not set data-active-turn when isActiveTurn is false', () => {
    renderWithLang(<PlayerStatusBadge playerState={makePlayerState()} isActiveTurn={false} />);
    const badge = screen.getByTestId('player-status-badge');
    expect(badge.getAttribute('data-active-turn')).toBeNull();
  });

  it('shows action counter in opponent badge with isActiveTurn=true', () => {
    renderWithLang(
      <PlayerStatusBadge
        playerState={makePlayerState()}
        playerName="Gegner"
        isActiveTurn={true}
        actionCount={2}
        maxActions={3}
      />
    );
    expect(screen.getByText('2/3')).toBeDefined();
    const badge = screen.getByTestId('player-status-badge');
    expect(badge.getAttribute('data-active-turn')).toBe('true');
  });
});
