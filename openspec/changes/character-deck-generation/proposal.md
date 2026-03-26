## Why

The game initialization needs to create a complete character card deck with the correct number of copies for each card based on the card definitions in cards.json. Currently, the deck creation uses placeholder data instead of the actual card database, which means the deck may not match the game's card balance (45 unique cards expanded to 50 total with 5 duplicates). This change ensures the deck is built correctly from the authoritative card source.

## What Changes

- Implement `createCharacterDeck()` function that loads cards from the card database (not placeholders)
- Respect `cardCount` property from cards.json to create correct number of copies (40 cards with count=1, 5 cards with count=2)
- Generate 50 total character cards: 45 unique + 5 duplicates (Kerberus, Zauberin, Riese, Hänsel und Gretel, Phoenix)
- Ensure deck is returned in consistent order (ready for shuffling)
- Update GameEngine setup to use the new deck creation function
- Verify no breaking changes to game flow or card properties

## Capabilities

### New Capabilities
- `character-deck-creation`: Function that generates a complete character card deck from the card database, respecting card count multiplicity and returning a properly-sized deck ready for play.

### Modified Capabilities
- None (internal implementation detail, no requirement changes to existing APIs)

## Impact

- **Code**: Modifies `shared/src/game/index.ts` (already using createCharacterDeck, just needs proper implementation)
- **Data**: Uses cards.json via cardDatabase.ts as single source of truth for deck composition
- **Dependencies**: Depends on cardDatabase.ts (already exists and tested)
- **Testing**: All card cost tests already validate with real card data, so deck creation validates indirectly
- **Game Flow**: No breaking changes - deck is still shuffled and used the same way
