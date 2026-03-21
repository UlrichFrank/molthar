## Why

Activated character cards are not displaying with correct images in the game. While the activation logic works correctly (the `activated` flag is set), the drawing function tries to extract image filenames using regex pattern matching on card names, which is unreliable and inconsistent.

The card data in `game-web/public/cards.json` already contains the correct image filenames for each character. This data is successfully used for auslage and portal card rendering, but the activated grid drawing function ignores this and uses fragile regex extraction instead.

## What Changes

The activated character cards display will now use the image filenames directly from the card data structure, ensuring consistency with how other card types (auslage, portal) render their images.

- Update `drawActivatedCharactersGrid()` to use the proper image filename field from card data
- Ensure the CardData interface has a consistent imageFileName property across all card types
- Verify that card loading from cards.json preserves the imageFileName throughout the game state
- Test that activated cards render with correct images, matching the visual quality of auslage/portal cards

## Capabilities

### New Capabilities
- `use-card-image-data`: Use the imageFileName property from card data structures instead of regex extraction for activated card rendering

### Modified Capabilities
- `card-rendering`: Now all card rendering functions (auslage, portal, activated grid) use consistent image data from card data structures

## Impact

- **Files Modified**: 
  - `game-web/src/lib/gameRender.ts` (drawActivatedCharactersGrid function)
  - Potentially `shared/src/game/types.ts` (CardData interface if imageFileName property is missing)
  - Potentially `game-web/src/lib/cardLoader.ts` (if cards.json loading needs adjustment)

- **User Impact**: Activated character cards will display with correct artwork when activated, improving game visual feedback

- **Testing**: Activate several character cards and verify they display with correct images instead of gray placeholder boxes
