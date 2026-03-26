/**
 * Default layout presets for different viewports and device types.
 * Mobile-first approach: start with mobile, add media queries for larger screens.
 */

import { LayoutPreset, LayoutArea } from '../lib/layoutTypes';

/**
 * Helper function to create a layout area with sensible defaults.
 */
function createArea(
  id: string,
  name: string,
  overrides: Partial<LayoutArea> = {}
): LayoutArea {
  return {
    id,
    name,
    widthPercent: undefined,
    heightPercent: undefined,
    width: undefined,
    height: undefined,
    constraints: {
      minWidth: overrides.constraints?.minWidth,
      maxWidth: overrides.constraints?.maxWidth,
      minHeight: overrides.constraints?.minHeight,
      maxHeight: overrides.constraints?.maxHeight,
      aspectRatio: overrides.constraints?.aspectRatio,
    },
    verticalPosition: 'center',
    horizontalPosition: 'center',
    contentMode: 'contain',
    ...overrides,
  };
}

/**
 * Mobile portrait layout (≤ 640px width, height > width).
 * Player hand at bottom, face-up cards at top, deck and opponents in middle.
 */
export const mobilePortraitLayout: LayoutPreset = {
  id: 'default-mobile-portrait',
  name: 'Mobile Portrait',
  orientation: 'portrait',
  breakpoint: 'mobile',
  isDefault: true,
  createdAt: Date.now(),
  areas: {
    playerHand: createArea('playerHand', 'Player Hand', {
      widthPercent: 100,
      heightPercent: 50,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      constraints: {
        minHeight: 100,
        maxHeight: 300,
      },
    }),
    faceUpCards: createArea('faceUpCards', 'Face-Up Cards', {
      widthPercent: 100,
      heightPercent: 30,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      constraints: {
        minHeight: 80,
        maxHeight: 200,
      },
    }),
    deck: createArea('deck', 'Deck', {
      width: 80,
      height: 120,
      verticalPosition: 'center',
      horizontalPosition: 'left',
      constraints: {
        minWidth: 60,
        maxWidth: 120,
        minHeight: 80,
        maxHeight: 150,
      },
    }),
    opponents: createArea('opponents', 'Opponents', {
      widthPercent: 100,
      heightPercent: 12,
      verticalPosition: 'center',
      horizontalPosition: 'center',
      constraints: {
        minHeight: 40,
        maxHeight: 80,
      },
    }),
    actions: createArea('actions', 'Actions', {
      widthPercent: 80,
      height: 50,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      constraints: {
        minHeight: 44,
        maxHeight: 70,
      },
    }),
  },
};

/**
 * Mobile landscape layout (640-1024px width, width > height).
 * Player hand on right side, face-up cards center, deck on left.
 */
export const mobileLandscapeLayout: LayoutPreset = {
  id: 'default-mobile-landscape',
  name: 'Mobile Landscape',
  orientation: 'landscape',
  breakpoint: 'mobile',
  isDefault: true,
  createdAt: Date.now(),
  areas: {
    playerHand: createArea('playerHand', 'Player Hand', {
      widthPercent: 30,
      heightPercent: 100,
      verticalPosition: 'center',
      horizontalPosition: 'right',
      constraints: {
        minWidth: 100,
        maxWidth: 250,
      },
    }),
    faceUpCards: createArea('faceUpCards', 'Face-Up Cards', {
      widthPercent: 50,
      heightPercent: 70,
      verticalPosition: 'center',
      horizontalPosition: 'center',
      constraints: {
        minHeight: 100,
        maxHeight: 350,
      },
    }),
    deck: createArea('deck', 'Deck', {
      widthPercent: 15,
      heightPercent: 60,
      verticalPosition: 'center',
      horizontalPosition: 'left',
      constraints: {
        minWidth: 60,
        maxWidth: 120,
        minHeight: 80,
        maxHeight: 300,
      },
    }),
    opponents: createArea('opponents', 'Opponents', {
      widthPercent: 100,
      heightPercent: 15,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      constraints: {
        minHeight: 40,
        maxHeight: 80,
      },
    }),
    actions: createArea('actions', 'Actions', {
      widthPercent: 50,
      height: 50,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      constraints: {
        minHeight: 44,
        maxHeight: 70,
      },
    }),
  },
};

/**
 * Tablet layout (768-1024px).
 * Balanced layout with hand left, cards center, deck right.
 */
export const tabletLayout: LayoutPreset = {
  id: 'default-tablet',
  name: 'Tablet',
  orientation: 'landscape',
  breakpoint: 'tablet',
  isDefault: true,
  createdAt: Date.now(),
  areas: {
    playerHand: createArea('playerHand', 'Player Hand', {
      widthPercent: 25,
      heightPercent: 100,
      verticalPosition: 'center',
      horizontalPosition: 'left',
      constraints: {
        minWidth: 120,
        maxWidth: 300,
      },
    }),
    faceUpCards: createArea('faceUpCards', 'Face-Up Cards', {
      widthPercent: 50,
      heightPercent: 80,
      verticalPosition: 'center',
      horizontalPosition: 'center',
      constraints: {
        minHeight: 120,
        maxHeight: 400,
      },
    }),
    deck: createArea('deck', 'Deck', {
      widthPercent: 20,
      heightPercent: 80,
      verticalPosition: 'center',
      horizontalPosition: 'right',
      constraints: {
        minWidth: 70,
        maxWidth: 180,
        minHeight: 100,
        maxHeight: 350,
      },
    }),
    opponents: createArea('opponents', 'Opponents', {
      widthPercent: 100,
      heightPercent: 15,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      constraints: {
        minHeight: 50,
        maxHeight: 100,
      },
    }),
    actions: createArea('actions', 'Actions', {
      widthPercent: 50,
      height: 60,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      constraints: {
        minHeight: 44,
        maxHeight: 80,
      },
    }),
  },
};

/**
 * Desktop layout (> 1024px).
 * Maximum spacing and clarity with optimal positioning for all elements.
 */
export const desktopLayout: LayoutPreset = {
  id: 'default-desktop',
  name: 'Desktop',
  orientation: 'landscape',
  breakpoint: 'desktop',
  isDefault: true,
  createdAt: Date.now(),
  areas: {
    playerHand: createArea('playerHand', 'Player Hand', {
      widthPercent: 20,
      heightPercent: 100,
      verticalPosition: 'center',
      horizontalPosition: 'right',
      constraints: {
        minWidth: 140,
        maxWidth: 350,
      },
    }),
    faceUpCards: createArea('faceUpCards', 'Face-Up Cards', {
      widthPercent: 60,
      heightPercent: 85,
      verticalPosition: 'center',
      horizontalPosition: 'center',
      constraints: {
        minHeight: 150,
        maxHeight: 500,
      },
    }),
    deck: createArea('deck', 'Deck', {
      widthPercent: 15,
      heightPercent: 85,
      verticalPosition: 'center',
      horizontalPosition: 'left',
      constraints: {
        minWidth: 80,
        maxWidth: 200,
        minHeight: 120,
        maxHeight: 400,
      },
    }),
    opponents: createArea('opponents', 'Opponents', {
      widthPercent: 100,
      heightPercent: 12,
      verticalPosition: 'top',
      horizontalPosition: 'center',
      constraints: {
        minHeight: 60,
        maxHeight: 120,
      },
    }),
    actions: createArea('actions', 'Actions', {
      widthPercent: 40,
      height: 70,
      verticalPosition: 'bottom',
      horizontalPosition: 'center',
      constraints: {
        minHeight: 44,
        maxHeight: 90,
      },
    }),
  },
};

/**
 * Selects the appropriate default layout based on viewport dimensions.
 */
export function getDefaultLayout(
  width: number,
  height: number
): LayoutPreset {
  const isPortrait = height > width;
  const isDesktop = width > 1024;
  const isTablet = width >= 768 && width <= 1024;

  if (isDesktop) {
    return desktopLayout;
  } else if (isTablet) {
    return tabletLayout;
  } else if (isPortrait) {
    return mobilePortraitLayout;
  } else {
    return mobileLandscapeLayout;
  }
}
