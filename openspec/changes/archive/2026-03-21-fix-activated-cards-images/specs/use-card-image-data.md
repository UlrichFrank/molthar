## Capability: use-card-image-data

Use the `imageFileName` property from card data structures instead of regex extraction for activated card rendering.

### Requirements

**Req 1**: Use imageFileName property directly
- The `drawActivatedCharactersGrid()` function must use the `imageFileName` property from the card data object
- No regex pattern matching on card names for filename construction
- Fallback to placeholder if imageFileName is missing or image fails to load

**Req 2**: Data consistency
- When a character card is placed in player portal, the `imageFileName` property must be preserved in the `ActivatedCharacter.card` object
- Card data must flow unchanged from cards.json loading through game state mutations

**Req 3**: Error handling
- If an image fails to load, a gray placeholder box is displayed (existing behavior)
- Console warning logged for missing images
- No errors or crashes if imageFileName is undefined

### Scenarios

#### Scenario 1: Activated card displays with correct image
- **GIVEN** a character card with imageFileName property
- **WHEN** the card is activated and rendered in the activated grid
- **THEN** the image file specified by imageFileName is loaded and displayed correctly

#### Scenario 2: Multiple activated cards show different images
- **GIVEN** three different character cards are activated
- **WHEN** they are all rendered in the activated grid
- **THEN** each displays with its correct unique artwork based on imageFileName

#### Scenario 3: Missing imageFileName falls back gracefully
- **GIVEN** a card object without an imageFileName property
- **WHEN** drawActivatedCharactersGrid attempts to render it
- **THEN** a placeholder box is shown and a console warning is logged

#### Scenario 4: Image loading failure shows placeholder
- **GIVEN** imageFileName points to a non-existent image file
- **WHEN** drawActivatedCharactersGrid attempts to load and render it
- **THEN** a gray placeholder box with border is displayed instead
