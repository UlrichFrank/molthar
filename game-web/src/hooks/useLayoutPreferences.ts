/**
 * React hook for managing layout preferences in localStorage.
 * Handles saving, loading, and resetting layout presets.
 */

import { useEffect, useState, useCallback } from 'react';
import { LayoutPreset } from '../lib/layoutTypes';

const LAYOUT_STORAGE_KEY = 'molthar-layout-preferences';
const SAVED_LAYOUTS_KEY = 'molthar-saved-layouts';
const LAYOUT_VERSION = 1;

export interface LayoutPreferencesData {
  version: number;
  currentLayout: LayoutPreset;
  savedLayouts: Record<string, LayoutPreset>;
  lastModified: number;
}

/**
 * Hook for managing layout preferences with localStorage persistence.
 */
export function useLayoutPreferences(defaultLayout: LayoutPreset) {
  const [currentLayout, setCurrentLayout] = useState<LayoutPreset>(defaultLayout);
  const [savedLayouts, setSavedLayouts] = useState<Record<string, LayoutPreset>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LAYOUT_STORAGE_KEY);
      const savedStored = localStorage.getItem(SAVED_LAYOUTS_KEY);

      if (stored) {
        const data = JSON.parse(stored) as Partial<LayoutPreferencesData>;
        if (data.version === LAYOUT_VERSION && data.currentLayout) {
          setCurrentLayout(data.currentLayout);
        }
      }

      if (savedStored) {
        const saved = JSON.parse(savedStored) as Record<string, LayoutPreset>;
        setSavedLayouts(saved);
      }
    } catch (error) {
      console.error('Failed to load layout preferences from localStorage:', error);
      // Fall back to defaults
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Saves current layout to localStorage.
   */
  const saveCurrentLayout = useCallback(() => {
    try {
      const data: LayoutPreferencesData = {
        version: LAYOUT_VERSION,
        currentLayout,
        savedLayouts,
        lastModified: Date.now(),
      };
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save layout to localStorage:', error);
    }
  }, [currentLayout, savedLayouts]);

  /**
   * Saves current layout with a custom name.
   */
  const saveLayoutAs = useCallback(
    (name: string) => {
      try {
        const newPreset: LayoutPreset = {
          ...currentLayout,
          id: `custom-${name}-${Date.now()}`,
          name,
          isDefault: false,
        };

        const updated = { ...savedLayouts, [name]: newPreset };
        setSavedLayouts(updated);

        const data: LayoutPreferencesData = {
          version: LAYOUT_VERSION,
          currentLayout,
          savedLayouts: updated,
          lastModified: Date.now(),
        };
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(SAVED_LAYOUTS_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save layout as:', error);
      }
    },
    [currentLayout, savedLayouts]
  );

  /**
   * Loads a previously saved layout by name.
   */
  const loadSavedLayout = useCallback((name: string) => {
    const layout = savedLayouts[name];
    if (layout) {
      setCurrentLayout(layout);
      try {
        const data: LayoutPreferencesData = {
          version: LAYOUT_VERSION,
          currentLayout: layout,
          savedLayouts,
          lastModified: Date.now(),
        };
        localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Failed to load saved layout:', error);
      }
    }
  }, [savedLayouts]);

  /**
   * Deletes a saved layout by name.
   */
  const deleteSavedLayout = useCallback((name: string) => {
    const updated = { ...savedLayouts };
    delete updated[name];
    setSavedLayouts(updated);
    try {
      localStorage.setItem(SAVED_LAYOUTS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to delete saved layout:', error);
    }
  }, [savedLayouts]);

  /**
   * Resets current layout to the provided default.
   */
  const resetToDefault = useCallback((newDefault: LayoutPreset) => {
    setCurrentLayout(newDefault);
    try {
      const data: LayoutPreferencesData = {
        version: LAYOUT_VERSION,
        currentLayout: newDefault,
        savedLayouts,
        lastModified: Date.now(),
      };
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to reset layout:', error);
    }
  }, [savedLayouts]);

  /**
   * Clears all saved layouts and preferences.
   */
  const clearAllPreferences = useCallback(() => {
    setSavedLayouts({});
    setCurrentLayout(defaultLayout);
    try {
      localStorage.removeItem(LAYOUT_STORAGE_KEY);
      localStorage.removeItem(SAVED_LAYOUTS_KEY);
    } catch (error) {
      console.error('Failed to clear preferences:', error);
    }
  }, [defaultLayout]);

  return {
    currentLayout,
    setCurrentLayout,
    savedLayouts,
    saveCurrentLayout,
    saveLayoutAs,
    loadSavedLayout,
    deleteSavedLayout,
    resetToDefault,
    clearAllPreferences,
    isLoading,
  };
}
