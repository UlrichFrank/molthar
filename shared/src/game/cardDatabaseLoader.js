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

    // Resolve path to project root assets directory
    // From: shared/dist/game/cardDatabaseLoader.js
    // To: ../../../assets/cards.json (go up to dist, then shared, then root)
    const cardsPath = path.resolve(__dirname, '../../../assets/cards.json');
    
    // Load and parse cards.json
    const cardsData = JSON.parse(fs.readFileSync(cardsPath, 'utf-8'));
    
    // Import and call __setRawCards dynamically (after module is loaded)
    const { __setRawCards } = require('./cardDatabase');
    __setRawCards(cardsData);
    
    console.log(`✓ Loaded ${cardsData.length} character cards`);
  } catch (error) {
    console.error('Failed to load cards.json:', error.message);
    console.error('Expected path: <project-root>/assets/cards.json');
  }
}
