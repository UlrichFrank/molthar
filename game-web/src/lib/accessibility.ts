/**
 * Accessibility utilities (WCAG 2.1 AA compliance)
 */

/**
 * Generate unique IDs for elements
 */
let idCounter = 0;

export function generateId(prefix = 'id'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Focus management utilities
 */
export const focusManager = {
  /**
   * Focus element by selector
   */
  focus(selector: string): boolean {
    const element = document.querySelector(selector) as HTMLElement;
    if (element && element.tabIndex !== -1) {
      element.focus();
      return true;
    }
    return false;
  },

  /**
   * Focus first focusable element in container
   */
  focusFirst(container: HTMLElement): boolean {
    const focusable = container.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    if (focusable) {
      focusable.focus();
      return true;
    }
    return false;
  },

  /**
   * Trap focus within container
   */
  trapFocus(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>;

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  },
};

/**
 * ARIA attributes helper
 */
export const aria = {
  /**
   * Set ARIA label
   */
  label(element: HTMLElement, label: string): void {
    element.setAttribute('aria-label', label);
  },

  /**
   * Set ARIA described by
   */
  describedBy(element: HTMLElement, descriptionId: string): void {
    element.setAttribute('aria-describedby', descriptionId);
  },

  /**
   * Set ARIA live region (for notifications)
   */
  liveRegion(element: HTMLElement, polite = true): void {
    element.setAttribute('aria-live', polite ? 'polite' : 'assertive');
    element.setAttribute('aria-atomic', 'true');
  },

  /**
   * Set ARIA disabled
   */
  disabled(element: HTMLElement, disabled = true): void {
    element.setAttribute('aria-disabled', disabled ? 'true' : 'false');
  },

  /**
   * Set ARIA pressed (for toggle buttons)
   */
  pressed(element: HTMLElement, pressed = false): void {
    element.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  },

  /**
   * Set ARIA selected
   */
  selected(element: HTMLElement, selected = false): void {
    element.setAttribute('aria-selected', selected ? 'true' : 'false');
  },
};

/**
 * Color contrast utilities
 */
export const contrast = {
  /**
   * Calculate luminance for WCAG contrast ratio
   */
  getLuminance(rgb: string): number {
    const [r, g, b] = rgb
      .match(/\d+/g)
      ?.map((x) => parseInt(x)) || [0, 0, 0];
    const [rs, gs, bs] = [r, g, b].map((x) => {
      x /= 255;
      return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  },

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio(color1: string, color2: string): number {
    const l1 = this.getLuminance(color1);
    const l2 = this.getLuminance(color2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  },

  /**
   * Check if contrast meets WCAG AA standard (4.5:1 for normal text)
   */
  meetsAA(color1: string, color2: string): boolean {
    return this.getContrastRatio(color1, color2) >= 4.5;
  },

  /**
   * Check if contrast meets WCAG AAA standard (7:1 for normal text)
   */
  meetsAAA(color1: string, color2: string): boolean {
    return this.getContrastRatio(color1, color2) >= 7;
  },
};

/**
 * Skip link for keyboard navigation
 */
export function createSkipLink(targetSelector: string): HTMLElement {
  const skipLink = document.createElement('a');
  skipLink.href = '#';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'skip-link';
  skipLink.setAttribute('aria-label', 'Skip to main content');

  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(targetSelector) as HTMLElement;
    if (target) {
      target.focus();
      if (target.scrollIntoView) {
        target.scrollIntoView();
      }
    }
  });

  return skipLink;
}
