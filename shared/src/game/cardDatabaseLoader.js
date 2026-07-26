/**
 * Card Database Loader - Node.js only
 * Handles loading cards.json in backend environments
 * 
 * In browser/Vite environments, cards are loaded via vitest.setup.js
 * In Node.js (backend), we load them here at module import time
 */

if (typeof window === 'undefined' && typeof require !== 'undefined') {
  try {
    const fs = require('fs');
    const path = require('path');

    // Resolve cards.json across layouts. The relative walk assumes the source
    // tree layout (shared/dist/game → project root); once the shared package is
    // bundled into node_modules (e.g. `pnpm deploy` in Docker) that walk lands
    // in the wrong place, so we also try an env override and a cwd-relative path.
    const candidates = [
      process.env.CARDS_JSON_PATH,
      path.resolve(process.cwd(), 'assets/cards.json'),
      path.resolve(__dirname, '../../../assets/cards.json'),
    ].filter(Boolean);

    const cardsPath = candidates.find((p) => fs.existsSync(p));
    if (!cardsPath) {
      throw new Error(`cards.json not found. Tried: ${candidates.join(', ')}`);
    }

    // Load and parse cards.json
    const cardsData = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));

    // Import and call __setRawCards dynamically (after module is loaded)
    const { __setRawCards } = require('./cardDatabase');
    __setRawCards(cardsData);

    console.log(`✓ Loaded ${cardsData.length} character cards from ${cardsPath}`);
  } catch (error) {
    console.error('Failed to load cards.json:', error.message);
    console.error('Set CARDS_JSON_PATH or place cards.json at <cwd>/assets/cards.json');
  }
}
