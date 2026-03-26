/**
 * React Context for responsive layout state.
 * Provides layout management to all components without prop drilling.
 */

import React, { createContext, useContext } from 'react';
import { useResponsiveLayout, ResponsiveLayoutState } from '../hooks/useResponsiveLayout';

type LayoutContextType = ResponsiveLayoutState | null;

const LayoutContext = createContext<LayoutContextType>(null);

/**
 * Provider component that wraps the app with responsive layout management.
 */
export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const layout = useResponsiveLayout();

  return <LayoutContext.Provider value={layout}>{children}</LayoutContext.Provider>;
}

/**
 * Hook to access responsive layout state from any component.
 * Must be used within a LayoutProvider.
 */
export function useLayout(): ResponsiveLayoutState {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
}
