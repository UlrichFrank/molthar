/**
 * Hook for managing responsive layout based on viewport size.
 * Automatically selects appropriate layout preset and provides layout state.
 */

import { useMemo } from 'react';
import { useViewportSize } from './useViewportSize';
import { useLayoutPreferences } from './useLayoutPreferences';
import { getDefaultLayout } from '../lib/layoutPresets';
import { LayoutPreset } from '../lib/layoutTypes';

export interface ResponsiveLayoutState {
  currentLayout: LayoutPreset;
  defaultLayout: LayoutPreset;
  viewportWidth: number;
  viewportHeight: number;
  breakpoint: 'mobile' | 'tablet' | 'desktop';
  isPortrait: boolean;
  isLandscape: boolean;
  savedLayouts: Record<string, LayoutPreset>;
  saveCurrentLayout: () => void;
  saveLayoutAs: (name: string) => void;
  loadSavedLayout: (name: string) => void;
  deleteSavedLayout: (name: string) => void;
  resetToDefault: (layout?: LayoutPreset) => void;
  clearAllPreferences: () => void;
  setCustomLayout: (layout: LayoutPreset) => void;
}

/**
 * Hook for comprehensive responsive layout management.
 * Combines viewport detection, layout selection, and persistence.
 */
export function useResponsiveLayout(): ResponsiveLayoutState {
  const viewport = useViewportSize();

  // Determine the appropriate default layout for current viewport
  const defaultLayout = useMemo(
    () => getDefaultLayout(viewport.width, viewport.height),
    [viewport.width, viewport.height]
  );

  // Initialize layout preferences with the default for current viewport
  const {
    currentLayout: savedLayout,
    setCurrentLayout,
    savedLayouts,
    saveCurrentLayout,
    saveLayoutAs,
    loadSavedLayout,
    deleteSavedLayout,
    resetToDefault: resetLayoutToDefault,
    clearAllPreferences,
    isLoading,
  } = useLayoutPreferences(defaultLayout);

  // Use saved layout if available and still valid, otherwise use current default
  const currentLayout = useMemo(() => {
    // If user has a saved layout for the current orientation, use it
    if (savedLayout && savedLayout.orientation === defaultLayout.orientation) {
      return savedLayout;
    }
    // Otherwise use the default for current viewport
    return defaultLayout;
  }, [savedLayout, defaultLayout]);

  // Update layout when viewport changes to match new orientation
  if (
    savedLayout &&
    savedLayout.orientation !== defaultLayout.orientation &&
    !isLoading
  ) {
    // Orientation changed - switch to appropriate default or saved layout
    resetLayoutToDefault(defaultLayout);
  }

  return {
    currentLayout,
    defaultLayout,
    viewportWidth: viewport.width,
    viewportHeight: viewport.height,
    breakpoint: viewport.breakpoint,
    isPortrait: viewport.isPortrait,
    isLandscape: viewport.isLandscape,
    savedLayouts,
    saveCurrentLayout,
    saveLayoutAs,
    loadSavedLayout,
    deleteSavedLayout,
    resetToDefault: resetLayoutToDefault,
    clearAllPreferences,
    setCustomLayout: setCurrentLayout,
  };
}
