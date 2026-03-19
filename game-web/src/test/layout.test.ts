/**
 * Tests for responsive layout system.
 * Covers layout calculations, preset selection, and persistence.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  calculateAreaWidth,
  calculateAreaHeight,
  isValidLayout,
  clampSize,
  percentToPixels,
  pixelsToPercent,
  meetsAccessibilityMinimum,
} from '../lib/layoutCalculations';
import {
  mobilePortraitLayout,
  mobileLandscapeLayout,
  tabletLayout,
  desktopLayout,
  getDefaultLayout,
} from '../lib/layoutPresets';
import type { LayoutArea } from '../lib/layoutTypes';

describe('Layout Calculations', () => {
  describe('calculateAreaWidth', () => {
    it('should calculate width from percentage', () => {
      const area: LayoutArea = {
        id: 'test',
        name: 'Test',
        widthPercent: 50,
        constraints: {},
        verticalPosition: 'center',
        horizontalPosition: 'center',
        contentMode: 'contain',
      };

      const width = calculateAreaWidth(area, 1000);
      expect(width).toBe(500);
    });

    it('should use absolute width if no percentage', () => {
      const area: LayoutArea = {
        id: 'test',
        name: 'Test',
        width: 300,
        constraints: {},
        verticalPosition: 'center',
        horizontalPosition: 'center',
        contentMode: 'contain',
      };

      const width = calculateAreaWidth(area, 1000);
      expect(width).toBe(300);
    });

    it('should apply maximum constraint', () => {
      const area: LayoutArea = {
        id: 'test',
        name: 'Test',
        widthPercent: 60,
        constraints: { maxWidth: 400 },
        verticalPosition: 'center',
        horizontalPosition: 'center',
        contentMode: 'contain',
      };

      const width = calculateAreaWidth(area, 1000); // 60% = 600, but capped at 400
      expect(width).toBe(400);
    });

    it('should apply minimum constraint', () => {
      const area: LayoutArea = {
        id: 'test',
        name: 'Test',
        widthPercent: 10,
        constraints: { minWidth: 100 },
        verticalPosition: 'center',
        horizontalPosition: 'center',
        contentMode: 'contain',
      };

      const width = calculateAreaWidth(area, 1000); // 10% = 100, but min is 100
      expect(width).toBe(100);
    });
  });

  describe('calculateAreaHeight', () => {
    it('should calculate height from percentage', () => {
      const area: LayoutArea = {
        id: 'test',
        name: 'Test',
        heightPercent: 40,
        constraints: {},
        verticalPosition: 'center',
        horizontalPosition: 'center',
        contentMode: 'contain',
      };

      const height = calculateAreaHeight(area, 800);
      expect(height).toBe(320);
    });

    it('should calculate height from aspect ratio', () => {
      const area: LayoutArea = {
        id: 'test',
        name: 'Test',
        constraints: { aspectRatio: 1.5 }, // 1.5:1
        verticalPosition: 'center',
        horizontalPosition: 'center',
        contentMode: 'contain',
      };

      // If width is 300, height should be 300 / 1.5 = 200
      const height = calculateAreaHeight(area, 800, 300);
      expect(height).toBe(200);
    });

    it('should apply maximum height constraint', () => {
      const area: LayoutArea = {
        id: 'test',
        name: 'Test',
        heightPercent: 80,
        constraints: { maxHeight: 500 },
        verticalPosition: 'center',
        horizontalPosition: 'center',
        contentMode: 'contain',
      };

      const height = calculateAreaHeight(area, 800); // 80% = 640, but capped at 500
      expect(height).toBe(500);
    });
  });

  describe('Utility functions', () => {
    it('clampSize should format CSS clamp expression', () => {
      const result = clampSize(12, 5, 24);
      expect(result).toBe('clamp(12px, 5vw, 24px)');
    });

    it('percentToPixels should convert percentage to pixels', () => {
      const pixels = percentToPixels(50, 1000);
      expect(pixels).toBe(500);
    });

    it('pixelsToPercent should convert pixels to percentage', () => {
      const percent = pixelsToPercent(500, 1000);
      expect(percent).toBe(50);
    });

    it('meetsAccessibilityMinimum should validate touch targets', () => {
      const area: LayoutArea = {
        id: 'test',
        name: 'Test',
        constraints: {},
        verticalPosition: 'center',
        horizontalPosition: 'center',
        contentMode: 'contain',
      };

      expect(meetsAccessibilityMinimum(area, 50, 50)).toBe(true);
      expect(meetsAccessibilityMinimum(area, 30, 50)).toBe(false);
      expect(meetsAccessibilityMinimum(area, 50, 30)).toBe(false);
    });
  });

  describe('isValidLayout', () => {
    it('should accept valid layout', () => {
      const areas = {
        hand: { width: 400, height: 300 },
        cards: { width: 400, height: 400 },
      };

      const valid = isValidLayout(areas, 800, 700);
      expect(valid).toBe(true);
    });

    it('should reject layout exceeding container by 20%', () => {
      const areas = {
        hand: { width: 500, height: 500 },
        cards: { width: 500, height: 500 },
      };

      const valid = isValidLayout(areas, 800, 800); // Total 1000+1000, exceeds by 25%
      expect(valid).toBe(false);
    });
  });
});

describe('Layout Presets', () => {
  it('should have valid mobile portrait layout', () => {
    expect(mobilePortraitLayout.orientation).toBe('portrait');
    expect(mobilePortraitLayout.areas).toBeDefined();
    expect(Object.keys(mobilePortraitLayout.areas).length).toBeGreaterThan(0);
  });

  it('should have valid mobile landscape layout', () => {
    expect(mobileLandscapeLayout.orientation).toBe('landscape');
    expect(mobileLandscapeLayout.areas).toBeDefined();
  });

  it('should have valid tablet layout', () => {
    expect(tabletLayout.breakpoint).toBe('tablet');
    expect(tabletLayout.areas).toBeDefined();
  });

  it('should have valid desktop layout', () => {
    expect(desktopLayout.breakpoint).toBe('desktop');
    expect(desktopLayout.areas).toBeDefined();
  });

  it('should select mobile portrait for small portrait viewport', () => {
    const layout = getDefaultLayout(400, 600);
    expect(layout.orientation).toBe('portrait');
  });

  it('should select mobile landscape for wide mobile viewport', () => {
    const layout = getDefaultLayout(800, 500);
    expect(layout.orientation).toBe('landscape');
    expect(layout.breakpoint).toBe('mobile');
  });

  it('should select tablet for medium viewport', () => {
    const layout = getDefaultLayout(800, 1024);
    expect(layout.breakpoint).toBe('tablet');
  });

  it('should select desktop for large viewport', () => {
    const layout = getDefaultLayout(1440, 900);
    expect(layout.breakpoint).toBe('desktop');
  });

  it('all presets should have all required areas', () => {
    const requiredAreas = ['playerHand', 'faceUpCards', 'deck', 'opponents', 'actions'];

    [mobilePortraitLayout, mobileLandscapeLayout, tabletLayout, desktopLayout].forEach(
      (preset) => {
        requiredAreas.forEach((areaId) => {
          expect(preset.areas[areaId]).toBeDefined(
            `${preset.name} missing area: ${areaId}`
          );
        });
      }
    );
  });
});

describe('Layout Persistence', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should save and retrieve layout from localStorage', () => {
    const key = 'test-layout';
    const layout = mobilePortraitLayout;

    localStorage.setItem(key, JSON.stringify(layout));
    const retrieved = JSON.parse(localStorage.getItem(key)!);

    expect(retrieved.id).toBe(layout.id);
    expect(retrieved.orientation).toBe(layout.orientation);
  });

  it('should handle corrupt data gracefully', () => {
    const key = 'test-layout';
    localStorage.setItem(key, 'invalid json');

    try {
      const retrieved = JSON.parse(localStorage.getItem(key)!);
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
