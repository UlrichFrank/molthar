/**
 * Card Database Loader for Browser environments
 * Loads cards from assets/cards.json at runtime
 *
 * This is executed when the shared package is imported in the browser
 * Only runs in browser environments (not in Node.js backend)
 */

let cardsLoadedPromise: Promise<void> | null = null;

export function waitForCardsLoaded(): Promise<void> {
  if (!cardsLoadedPromise && typeof window !== 'undefined') {
    cardsLoadedPromise = loadCardsInBrowserImpl();
  }
  return cardsLoadedPromise || Promise.resolve();
}

async function loadCardsInBrowserImpl(): Promise<void> {
  try {
    const { __setRawCards } = await import('./cardDatabase');

    // In development (Vite), assets are served from /assets
    // In production, they're also at /assets
    const response = await fetch('/assets/cards.json');

    if (!response.ok) {
      throw new Error(`Failed to fetch cards.json: ${response.status}`);
    }

    const cardsData = await response.json();
    __setRawCards(cardsData);
    console.log(`✓ Loaded ${cardsData.length} character cards from browser`);
  } catch (error) {
    console.error('Failed to load cards.json in browser:', error);
    console.error('Expected: /assets/cards.json');
    // Don't throw - let the app continue, just with no cards
  }
}

// Only load in browser environments
if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
  // Start loading immediately
  cardsLoadedPromise = loadCardsInBrowserImpl();
}
