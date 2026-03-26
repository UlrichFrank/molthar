/**
 * Hook for detecting viewport size and orientation changes.
 * Provides current dimensions and layout breakpoint.
 */

import { useEffect, useState, useCallback } from 'react';

export type LayoutBreakpoint = 'mobile' | 'tablet' | 'desktop';

export interface ViewportSize {
  width: number;
  height: number;
  breakpoint: LayoutBreakpoint;
  isPortrait: boolean;
  isLandscape: boolean;
}

/**
 * Determines the layout breakpoint based on viewport width.
 */
function getBreakpoint(width: number): LayoutBreakpoint {
  if (width > 1024) return 'desktop';
  if (width >= 768) return 'tablet';
  return 'mobile';
}

/**
 * Hook for tracking viewport size and orientation changes.
 * Uses ResizeObserver on the document element for accurate measurements.
 */
export function useViewportSize(): ViewportSize {
  const [viewportSize, setViewportSize] = useState<ViewportSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    breakpoint: 'desktop',
    isPortrait: false,
    isLandscape: true,
  });

  const updateSize = useCallback(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const breakpoint = getBreakpoint(width);
      const isPortrait = height > width;

      setViewportSize({
        width,
        height,
        breakpoint,
        isPortrait,
        isLandscape: !isPortrait,
      });
    }
  }, []);

  useEffect(() => {
    // Initial size
    updateSize();

    // Listen to resize events
    window.addEventListener('resize', updateSize);
    window.addEventListener('orientationchange', updateSize);

    // Use ResizeObserver if available for more accurate measurements
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        updateSize();
      });
      resizeObserver.observe(document.documentElement);
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      window.removeEventListener('orientationchange', updateSize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [updateSize]);

  return viewportSize;
}
