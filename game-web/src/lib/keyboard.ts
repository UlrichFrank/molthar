/**
 * Keyboard shortcuts and accessibility utilities
 */

export const KEYBOARD_SHORTCUTS = {
  ENTER: 'Enter',
  ESCAPE: 'Escape',
  SPACE: ' ',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
} as const;

/**
 * Check if Enter key was pressed
 */
export function isEnterKey(event: React.KeyboardEvent<any> | globalThis.KeyboardEvent): boolean {
  return (event as any).key === KEYBOARD_SHORTCUTS.ENTER;
}

/**
 * Check if Escape key was pressed
 */
export function isEscapeKey(event: React.KeyboardEvent<any> | globalThis.KeyboardEvent): boolean {
  return (event as any).key === KEYBOARD_SHORTCUTS.ESCAPE;
}

/**
 * Check if Space key was pressed
 */
export function isSpaceKey(event: React.KeyboardEvent<any> | globalThis.KeyboardEvent): boolean {
  return (event as any).key === KEYBOARD_SHORTCUTS.SPACE;
}

/**
 * Check if arrow keys were pressed
 */
export function isArrowKey(event: React.KeyboardEvent<any> | globalThis.KeyboardEvent): boolean {
  const key = (event as any).key;
  return [
    KEYBOARD_SHORTCUTS.ARROW_UP,
    KEYBOARD_SHORTCUTS.ARROW_DOWN,
    KEYBOARD_SHORTCUTS.ARROW_LEFT,
    KEYBOARD_SHORTCUTS.ARROW_RIGHT,
  ].includes(key);
}

/**
 * Handle number key press (1-9)
 */
export function getNumberKey(event: React.KeyboardEvent<any> | globalThis.KeyboardEvent): number | null {
  const num = parseInt((event as any).key);
  if (!isNaN(num) && num >= 1 && num <= 9) {
    return num;
  }
  return null;
}

/**
 * Setup global keyboard shortcuts
 */
export function setupKeyboardShortcuts(callbacks: {
  onConfirm?: () => void;
  onCancel?: () => void;
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right') => void;
}) {
  const handleKeyDown = (event: globalThis.KeyboardEvent) => {
    // Don't interfere with input elements
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      if (isEscapeKey(event)) {
        target.blur();
      }
      return;
    }

    if (isEnterKey(event)) {
      callbacks.onConfirm?.();
    }

    if (isEscapeKey(event)) {
      callbacks.onCancel?.();
    }

    if (isArrowKey(event)) {
      const key = event.key as typeof KEYBOARD_SHORTCUTS.ARROW_UP | typeof KEYBOARD_SHORTCUTS.ARROW_DOWN | typeof KEYBOARD_SHORTCUTS.ARROW_LEFT | typeof KEYBOARD_SHORTCUTS.ARROW_RIGHT;
      const direction = {
        [KEYBOARD_SHORTCUTS.ARROW_UP]: 'up',
        [KEYBOARD_SHORTCUTS.ARROW_DOWN]: 'down',
        [KEYBOARD_SHORTCUTS.ARROW_LEFT]: 'left',
        [KEYBOARD_SHORTCUTS.ARROW_RIGHT]: 'right',
      }[key] as 'up' | 'down' | 'left' | 'right';
      callbacks.onNavigate?.(direction);
    }
  };

  document.addEventListener('keydown', handleKeyDown);

  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}
