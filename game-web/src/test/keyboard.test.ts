import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  KEYBOARD_SHORTCUTS,
  isEnterKey,
  isEscapeKey,
  isSpaceKey,
  isArrowKey,
  getNumberKey,
  setupKeyboardShortcuts,
} from '../lib/keyboard';

describe('Keyboard Utilities', () => {
  describe('KEYBOARD_SHORTCUTS constants', () => {
    it('defines all keyboard shortcuts', () => {
      expect(KEYBOARD_SHORTCUTS.ENTER).toBe('Enter');
      expect(KEYBOARD_SHORTCUTS.ESCAPE).toBe('Escape');
      expect(KEYBOARD_SHORTCUTS.SPACE).toBe(' ');
      expect(KEYBOARD_SHORTCUTS.ARROW_UP).toBe('ArrowUp');
      expect(KEYBOARD_SHORTCUTS.ARROW_DOWN).toBe('ArrowDown');
      expect(KEYBOARD_SHORTCUTS.ARROW_LEFT).toBe('ArrowLeft');
      expect(KEYBOARD_SHORTCUTS.ARROW_RIGHT).toBe('ArrowRight');
      expect(KEYBOARD_SHORTCUTS.TAB).toBe('Tab');
    });
  });

  describe('isEnterKey', () => {
    it('returns true for Enter key', () => {
      const event = { key: 'Enter' } as any;
      expect(isEnterKey(event)).toBe(true);
    });

    it('returns false for other keys', () => {
      const event = { key: 'Escape' } as any;
      expect(isEnterKey(event)).toBe(false);
    });
  });

  describe('isEscapeKey', () => {
    it('returns true for Escape key', () => {
      const event = { key: 'Escape' } as any;
      expect(isEscapeKey(event)).toBe(true);
    });

    it('returns false for other keys', () => {
      const event = { key: 'Enter' } as any;
      expect(isEscapeKey(event)).toBe(false);
    });
  });

  describe('isSpaceKey', () => {
    it('returns true for Space key', () => {
      const event = { key: ' ' } as any;
      expect(isSpaceKey(event)).toBe(true);
    });

    it('returns false for other keys', () => {
      const event = { key: 'Enter' } as any;
      expect(isSpaceKey(event)).toBe(false);
    });
  });

  describe('isArrowKey', () => {
    it('returns true for arrow keys', () => {
      expect(isArrowKey({ key: 'ArrowUp' } as any)).toBe(true);
      expect(isArrowKey({ key: 'ArrowDown' } as any)).toBe(true);
      expect(isArrowKey({ key: 'ArrowLeft' } as any)).toBe(true);
      expect(isArrowKey({ key: 'ArrowRight' } as any)).toBe(true);
    });

    it('returns false for non-arrow keys', () => {
      expect(isArrowKey({ key: 'Enter' } as any)).toBe(false);
      expect(isArrowKey({ key: '1' } as any)).toBe(false);
    });
  });

  describe('getNumberKey', () => {
    it('returns number for valid keys 1-9', () => {
      expect(getNumberKey({ key: '1' } as any)).toBe(1);
      expect(getNumberKey({ key: '5' } as any)).toBe(5);
      expect(getNumberKey({ key: '9' } as any)).toBe(9);
    });

    it('returns null for 0', () => {
      expect(getNumberKey({ key: '0' } as any)).toBeNull();
    });

    it('returns null for non-number keys', () => {
      expect(getNumberKey({ key: 'a' } as any)).toBeNull();
      expect(getNumberKey({ key: 'Enter' } as any)).toBeNull();
    });

    it('returns null for numbers > 9', () => {
      expect(getNumberKey({ key: '10' } as any)).toBeNull();
    });
  });

  describe('setupKeyboardShortcuts', () => {
    let addEventListenerSpy: any;
    let removeEventListenerSpy: any;

    beforeEach(() => {
      addEventListenerSpy = vi.spyOn(document, 'addEventListener');
      removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
      document.body.innerHTML = '';
    });

    afterEach(() => {
      addEventListenerSpy.mockRestore();
      removeEventListenerSpy.mockRestore();
    });

    it('sets up keyboard event listener', () => {
      const callbacks = { onConfirm: vi.fn() };
      setupKeyboardShortcuts(callbacks);

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('returns unsubscribe function', () => {
      const callbacks = { onConfirm: vi.fn() };
      const unsubscribe = setupKeyboardShortcuts(callbacks);

      expect(typeof unsubscribe).toBe('function');
    });

    it('unsubscribes removes event listener', () => {
      const callbacks = { onConfirm: vi.fn() };
      const unsubscribe = setupKeyboardShortcuts(callbacks);
      unsubscribe();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });

    it('ignores events on input elements', () => {
      const callbacks = { onConfirm: vi.fn() };
      document.body.innerHTML = '<input type="text" id="input" />';
      
      const input = document.querySelector('#input') as HTMLInputElement;
      setupKeyboardShortcuts(callbacks);

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      Object.defineProperty(event, 'target', { value: input, enumerable: true });
      
      document.dispatchEvent(event);
      expect(callbacks.onConfirm).not.toHaveBeenCalled();
    });

    it('ignores events on textarea elements', () => {
      const callbacks = { onConfirm: vi.fn() };
      document.body.innerHTML = '<textarea id="textarea"></textarea>';
      
      const textarea = document.querySelector('#textarea') as HTMLTextAreaElement;
      setupKeyboardShortcuts(callbacks);

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      Object.defineProperty(event, 'target', { value: textarea, enumerable: true });
      
      document.dispatchEvent(event);
      expect(callbacks.onConfirm).not.toHaveBeenCalled();
    });
  });
});
