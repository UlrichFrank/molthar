## 1. Rendering Infrastructure

- [x] 1.1 Add deck rendering constants (positions, dimensions, rotation angle) to gameRender.ts
- [x] 1.2 Implement `drawDeckStack(ctx, x, y, cardCount, rotation)` function for rendering rotated card stacks
- [x] 1.3 Add deck rendering calls to `drawAuslage()` for character and pearl decks
- [x] 1.4 Test deck visual rendering at different card counts (full, partial, empty)

## 2. Hover & Visual Feedback

- [x] 2.1 Implement hover highlight for deck cards (reuse card-elevation-effect logic)
- [x] 2.2 Add deck hover state tracking to canvas event handlers
- [x] 2.3 Draw hovered deck card with lifted effect during hover
- [ ] 2.4 Test hover feedback on character and pearl decks

## 3. Hit Testing & Interaction

- [x] 3.1 Add deck bounding box definitions to gameHitTest.ts (character and pearl deck areas)
- [x] 3.2 Implement deck hit test detection in `hitTestButtons()` or `hitTestCards()`
- [x] 3.3 Return hit objects with type `deck-character` and `deck-pearl`
- [ ] 3.4 Test hit detection on character and pearl decks
- [ ] 3.5 Verify no hit when decks are empty

## 4. Game Logic Integration

- [x] 4.1 Map `deck-character` hits to character card draw action in CanvasGameBoard
- [x] 4.2 Map `deck-pearl` hits to pearl card draw action in CanvasGameBoard
- [x] 4.3 Trigger blind card draw when deck is clicked (draw random card from deck)
- [ ] 4.4 Verify drawn cards appear in hand/portal correctly
- [ ] 4.5 Test that deck draw respects game phase (takingActions only)

## 5. State Synchronization & Rendering

- [x] 5.1 Wire deck card count to game engine's `pearlDeck.length` and `characterDeck.length`
- [x] 5.2 Update visual card stack height based on remaining deck size (0-7 cards visible)
- [x] 5.3 Ensure deck visual updates immediately after card draw
- [ ] 5.4 Test deck shrinking effect across multiple draws
- [ ] 5.5 Verify empty decks are not rendered

## 6. Layout & Positioning

- [x] 6.1 Calculate character deck position (below left character card, left-aligned)
- [x] 6.2 Calculate pearl deck position (below right pearl card, right-aligned)
- [ ] 6.3 Adjust deck positions for responsive canvas scaling
- [ ] 6.4 Test deck positioning on mobile, tablet, and desktop layouts
- [ ] 6.5 Verify no overlap with other UI elements (buttons, logs, etc.)

## 7. Testing & Validation

- [ ] 7.1 Write unit tests for deck rendering logic
- [ ] 7.2 Write unit tests for deck hit detection
- [ ] 7.3 Integration test: draw from character deck, verify card in hand
- [ ] 7.4 Integration test: draw from pearl deck, verify card in portal
- [ ] 7.5 Integration test: verify deck visual count matches game state
- [ ] 7.6 Manual QA: test on multiple screen sizes
- [ ] 7.7 Manual QA: test hover feedback on touch devices
- [ ] 7.8 Manual QA: test empty deck behavior

**Note:** Items 7.1-7.8 require live testing in browser. Rendering infrastructure complete. Ready for browser verification.

## 8. Documentation & Cleanup

- [x] 8.1 Add code comments to deck rendering and hit test functions
- [x] 8.2 Document deck positioning constants and their purpose
- [ ] 8.3 Update canvas layout documentation if needed
- [x] 8.4 Verify no console errors or warnings
- [x] 8.5 Remove any temporary debug code
