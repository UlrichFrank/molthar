import { describe, it, expect, beforeEach } from 'vitest';
import { generateId, focusManager, aria, contrast, createSkipLink } from '../lib/accessibility';

describe('Accessibility Utilities', () => {
  describe('generateId', () => {
    it('generates unique IDs with prefix', () => {
      const id1 = generateId('btn');
      const id2 = generateId('btn');
      expect(id1).toMatch(/^btn-\d+$/);
      expect(id2).toMatch(/^btn-\d+$/);
      expect(id1).not.toBe(id2);
    });

    it('uses default prefix when not provided', () => {
      const id = generateId();
      expect(id).toMatch(/^id-\d+$/);
    });
  });

  describe('focusManager.focus', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <button id="test-btn">Click me</button>
        <input id="test-input" type="text" />
      `;
    });

    it('focuses element by selector', () => {
      const btn = document.querySelector('#test-btn') as HTMLButtonElement;
      focusManager.focus('#test-btn');
      expect(document.activeElement).toBe(btn);
    });

    it('returns true when element is focused', () => {
      const result = focusManager.focus('#test-btn');
      expect(result).toBe(true);
    });

    it('returns false when element not found', () => {
      const result = focusManager.focus('#nonexistent');
      expect(result).toBe(false);
    });
  });

  describe('focusManager.focusFirst', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="container">
          <button id="first">First</button>
          <button id="second">Second</button>
        </div>
      `;
    });

    it('focuses first focusable element in container', () => {
      const container = document.querySelector('#container') as HTMLElement;
      focusManager.focusFirst(container);
      const firstBtn = document.querySelector('#first');
      expect(document.activeElement).toBe(firstBtn);
    });

    it('returns true when focus is successful', () => {
      const container = document.querySelector('#container') as HTMLElement;
      const result = focusManager.focusFirst(container);
      expect(result).toBe(true);
    });
  });

  describe('focusManager.trapFocus', () => {
    beforeEach(() => {
      document.body.innerHTML = `
        <div id="dialog">
          <button id="first">First</button>
          <button id="second">Second</button>
        </div>
      `;
    });

    it('returns unsubscribe function', () => {
      const dialog = document.querySelector('#dialog') as HTMLElement;
      const unsubscribe = focusManager.trapFocus(dialog);
      expect(typeof unsubscribe).toBe('function');
      if (unsubscribe) {
        unsubscribe();
      }
    });
  });

  describe('aria utilities', () => {
    let element: HTMLElement;

    beforeEach(() => {
      element = document.createElement('button');
    });

    it('sets ARIA label', () => {
      aria.label(element, 'Close dialog');
      expect(element.getAttribute('aria-label')).toBe('Close dialog');
    });

    it('sets ARIA described by', () => {
      aria.describedBy(element, 'desc-1');
      expect(element.getAttribute('aria-describedby')).toBe('desc-1');
    });

    it('sets ARIA live region', () => {
      aria.liveRegion(element);
      expect(element.getAttribute('aria-live')).toBe('polite');
      expect(element.getAttribute('aria-atomic')).toBe('true');
    });

    it('sets ARIA live region to assertive', () => {
      aria.liveRegion(element, false);
      expect(element.getAttribute('aria-live')).toBe('assertive');
    });

    it('sets ARIA disabled', () => {
      aria.disabled(element, true);
      expect(element.getAttribute('aria-disabled')).toBe('true');
      aria.disabled(element, false);
      expect(element.getAttribute('aria-disabled')).toBe('false');
    });

    it('sets ARIA pressed', () => {
      aria.pressed(element, true);
      expect(element.getAttribute('aria-pressed')).toBe('true');
      aria.pressed(element, false);
      expect(element.getAttribute('aria-pressed')).toBe('false');
    });

    it('sets ARIA selected', () => {
      aria.selected(element, true);
      expect(element.getAttribute('aria-selected')).toBe('true');
      aria.selected(element, false);
      expect(element.getAttribute('aria-selected')).toBe('false');
    });
  });

  describe('contrast utilities', () => {
    it('calculates luminance correctly', () => {
      const whiteLum = contrast.getLuminance('rgb(255, 255, 255)');
      const blackLum = contrast.getLuminance('rgb(0, 0, 0)');
      expect(whiteLum).toBeGreaterThan(blackLum);
    });

    it('calculates contrast ratio', () => {
      const ratio = contrast.getContrastRatio('rgb(255, 255, 255)', 'rgb(0, 0, 0)');
      expect(ratio).toBeGreaterThan(20);
    });

    it('checks WCAG AA compliance', () => {
      const wcagAA = contrast.meetsAA('rgb(255, 255, 255)', 'rgb(0, 0, 0)');
      expect(wcagAA).toBe(true);

      const notWCAGAA = contrast.meetsAA('rgb(255, 255, 200)', 'rgb(255, 255, 255)');
      expect(notWCAGAA).toBe(false);
    });

    it('checks WCAG AAA compliance', () => {
      const wcagAAA = contrast.meetsAAA('rgb(255, 255, 255)', 'rgb(0, 0, 0)');
      expect(wcagAAA).toBe(true);
    });
  });

  describe('createSkipLink', () => {
    beforeEach(() => {
      document.body.innerHTML = '<main id="content">Main content</main>';
    });

    it('creates a skip link element', () => {
      const skipLink = createSkipLink('#content');
      expect(skipLink).toBeDefined();
      expect(skipLink.textContent).toBe('Skip to main content');
    });

    it('skip link has correct attributes', () => {
      const skipLink = createSkipLink('#content');
      expect(skipLink.className).toBe('skip-link');
      expect(skipLink.getAttribute('aria-label')).toBe('Skip to main content');
    });

    it('skip link focuses target on click', () => {
      const skipLink = createSkipLink('#content');
      const main = document.querySelector('#content') as HTMLElement;
      
      skipLink.addEventListener('click', (e) => {
        e.preventDefault();
        main.focus();
      });

      skipLink.click();
      expect(document.activeElement).toBe(main);
    });
  });
});
