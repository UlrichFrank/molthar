## Why

Currently, the game only displays face-up cards from the draw piles with no visual indication of the deck structure. Adding visible, interactive draw piles (decks) makes the game feel more authentic, improves usability by letting players understand card availability, and enables blind card draws directly from the deck—a core game mechanic.

## What Changes

- **Visual deck display**: Add rendered card stacks (rotated 90°) for character and pearl decks positioned below their respective face-up card displays
- **Deck positioning**: Character deck positioned below the 2 face-up character cards (left-aligned with left card); pearl deck positioned below the 4 face-up pearl cards (right-aligned with right card)
- **Interactive deck drawing**: Players can click on either deck to draw a blind card, equivalent to clicking a face-up card
- **Hover feedback**: Deck cards light up and appear lifted when hovered, matching the visual feedback of face-up cards
- **Visual stacking**: Deck appearance diminishes as cards are drawn, creating a realistic "pile shrinking" effect

## Capabilities

### New Capabilities
- `deck-visualization`: Visual rendering and hover feedback for character and pearl draw piles
- `deck-interaction`: Click handling and blind card draw from deck piles, with game state updates
- `deck-state-tracking`: Track remaining cards in each deck and update visual representation on draw

### Modified Capabilities
- `card-auslage`: Update positioning logic to accommodate deck displays below face-up cards

## Impact

- **Game canvas rendering**: Add deck rendering layers in `gameRender.ts` with rotation, stacking effect, and card count
- **Hit testing**: Extend hit test logic in `gameHitTest.ts` to detect deck clicks
- **Game state**: Ensure deck card counts are tracked and synced (already in GameEngine, display only)
- **UI layout**: Adjust canvas layout and card positioning to fit deck displays without overlap
- **Styling**: Apply consistent hover and visual effects matching face-up card styling
