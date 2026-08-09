import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 767px)';

function supportsMatchMedia(): boolean {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function';
}

/**
 * Task 1.1: live viewport-width switch at the 768px breakpoint (design.md D2).
 * Tracks `matchMedia('(max-width: 767px)')` and updates on resize/orientation changes.
 * `matchMedia` is absent in the jsdom test environment, so this degrades to `false`.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    supportsMatchMedia() ? window.matchMedia(MOBILE_QUERY).matches : false
  );

  useEffect(() => {
    if (!supportsMatchMedia()) return;
    const mql = window.matchMedia(MOBILE_QUERY);
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, []);

  return isMobile;
}
