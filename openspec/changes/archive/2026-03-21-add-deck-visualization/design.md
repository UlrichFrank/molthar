## Context

The game currently renders only face-up cards from the draw piles (auslage). Cards are drawn via click interaction, with hit testing to detect which card was clicked. The GameEngine tracks deck state (remaining cards in `pearlDeck` and `characterDeck`), but this information is not visualized on the canvas.

The canvas rendering pipeline uses:
- `gameRender.ts`: Draws all visual elements (background, cards, UI)
- `gameHitTest.ts`: Detects click targets (cards, buttons, UI elements)
- `CanvasGameBoard.tsx`: Manages canvas, input handling, and state sync

Deck visualization must integrate seamlessly with existing rendering and interaction patterns.

## Goals / Non-Goals

**Goals:**
- Render character and pearl decks as stacked card piles (rotated 90°) at specified positions below their face-up cards
- Enable blind card draws by clicking on a deck (same outcome as clicking a face-up card)
- Provide visual hover feedback (lift effect) matching face-up card styling
- Display diminishing stack effect as cards are drawn (visual card count)
- Support responsive layout across device sizes

**Non-Goals:**
- Animated card draw transitions (draw instantly, no animation)
- Shuffle animation or deck-specific sound effects
- Deck zoom or detail view
- Manual deck reordering or interactions beyond drawing

## Decisions

**1. Deck Positioning & Layout**
- **Decision**: Fixed positions relative to face-up cards, not centered on canvas
  - Character deck: x-offset from leftmost character card, y-offset below cards
  - Pearl deck: x-offset from rightmost pearl card, y-offset below cards
- **Rationale**: Keeps decks visually anchored to their card groups; easier to scan; aligns with game flow left-to-right
- **Alternative**: Center deck displays → would clutter center canvas area and reduce card visibility

**2. Deck Rendering (90° Rotation)**
- **Decision**: Render cards in `gameRender.ts` with canvas 2D rotation transform applied per-deck
- **Rationale**: Matches browser/canvas native rotation capability; keeps rendering code organized in one place; easy to adjust rotation angle
- **Alternative**: Pre-render rotated card images → adds asset pipeline complexity; inflexible for tweaks

**3. Stacking Effect**
- **Decision**: Draw multiple overlapping card backs (5-7 cards visible at a time) with slight offsets to create stack illusion
- **Rationale**: Realistic visual; conveys "pile remaining" without text labels; player can estimate card count
- **Alternative**: Draw single card + text label showing count → less intuitive; breaks immersion

**4. Hover & Interaction**
- **Decision**: Reuse existing hover highlight logic (draw card slightly lifted/brighter)
  - Deck acts as single clickable region in hit test
  - Click on deck reports hit type `deck-character` or `deck-pearl`, same as face-up cards
- **Rationale**: Consistent UX; minimal code duplication; seamless integration with existing event flow
- **Alternative**: Separate hover/click handlers for decks → duplicates logic; harder to maintain

**5. Hit Testing**
- **Decision**: Add deck bounding boxes to hit test grid
  - Character deck: ~60px wide (width of rotated card), positioned below left character
  - Pearl deck: ~60px wide, positioned below right pearl card
  - Heights adjusted for multi-card stack effect
- **Rationale**: Simple rectangular hit test matches existing pattern; no complex polygon logic needed
- **Alternative**: Pixel-perfect collision → overkill for rectangular decks; performance impact

**6. Game State Integration**
- **Decision**: No new game state tracking—decks already track `pearlDeck.length` and `characterDeck.length`
  - Display only uses these counts to render stack height
- **Rationale**: Minimizes state mutations; leverages existing engine data
- **Alternative**: Add new `deckState` object → introduces redundancy; harder to keep in sync

## Risks / Trade-offs

**[Risk] Deck positioning conflicts with other UI**
- **Mitigation**: Test layout on multiple screen sizes during implementation; adjust offsets if needed; ensure decks don't overlap buttons/logs

**[Risk] Stack effect not visible on small screens**
- **Mitigation**: Scale stack offset dynamically based on card size; ensure at least 2-3 cards visible at minimum resolution

**[Risk] Hit test area too small/hard to click**
- **Mitigation**: Make deck hit box slightly larger than visual stack; add hover feedback immediately on mouseover to signal clickability

**[Risk] Rotating cards impacts performance**
- **Mitigation**: Cache transform state; batch render calls; test FPS on target devices (Web, iOS, macOS)

**[Trade-off] No animation on draw**
- Simpler implementation and no jank on lower-end devices
- Slightly less satisfying feedback, but hover effect compensates

## Open Questions

1. **Exact card offset for stack effect**: How many pixels between cards in stack? (proposal suggests 5-10px per card)
2. **Deck position fine-tuning**: Exact pixel coordinates for character vs. pearl deck relative to auslage cards?
3. **Small-screen behavior**: If decks overlap buttons, should they be hidden or repositioned?
