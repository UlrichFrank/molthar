## Context

The game board already has deck rendering infrastructure (`drawDeckStack` in `gameRender.ts`) and hit-test detection (`gameHitTest.ts`). The character deck visually displays 0-7 overlapping card backs with proportional sizing based on remaining card count. Deck interaction detection distinguishes between character and pearl deck hits. The integration point is ensuring deck clicks flow seamlessly into the same card selection and Portal action system as clicking face-up cards.

## Goals / Non-Goals

**Goals:**
- Ensure character deck visual display accurately reflects `characterDeck.length` from game state
- Enable deck clicks to trigger card draw that feeds into the Portal action flow (matching face-up card behavior)
- Maintain consistent interaction patterns between face-up card selection and blind deck card selection
- Preserve non-interactive state during non-action phases (deck unclickable)

**Non-Goals:**
- Implement Pearl deck functionality (out of scope for character deck focus)
- Modify game state structure or core game engine logic
- Add new state variables or redundant deck tracking

## Decisions

### Decision 1: Proportional Visual Mapping with Guaranteed Minimum
**Approach:** Implement proportional mapping that calculates visible cards as `Math.ceil(currentCount / maxDeckSize * 7)`, where `maxDeckSize` is the initial deck size. Pass both current count and max size to `drawDeckStack()`.

**Rationale:** Prevents rounding issues where 0 cards display while cards still exist in deck. Formula guarantees: while `currentCount > 0`, always `visibleCards >= 1`. Leverages existing render function with minimal modification. No new state variables (maxDeckSize is a constant/derived from setup).

**Alternative Considered:** Simple `Math.min(deckCount, 7)` — rejected because it can create display gaps (e.g., 5 cards show 1, but 4 cards show 0).

---

### Decision 2: Hit Testing for Rectangular Deck Region
**Approach:** Use `hitTest()` with deck bounding boxes (`CHAR_DECK_X`, `CHAR_DECK_Y`, `DECK_CARD_W`, `DECK_CARD_H`) to detect clicks. Return `HitTarget` with `type: 'deck-character'`.

**Rationale:** Consistent with existing hit-test pattern for all board elements. Deck position is fixed, making rectangular hit-testing sufficient.

**Alternative Considered:** Per-card hit testing for rotated deck cards — rejected because overkill; single rectangular hit box simpler and sufficient.

---

### Decision 3: Unified Card Selection Flow
**Approach:** When `hitTarget.type === 'deck-character'`, call the same `handleCardClick()` handler as face-up cards, but pass a synthetic hit target that represents the top deck card.

**Rationale:** Reuses existing Portal action flow. No duplication of selection/placement logic. Deck draw behaves identically to clicking face-up cards.

**Alternative Considered:** Separate `handleDeckClick()` handler — rejected because it duplicates Portal integration logic.

---

### Decision 4: Phase-Aware Interactivity
**Approach:** In `handleCardClick()` or click handler, check `G.gamePhase === 'takingActions'` before allowing deck click. Return early if not in action phase.

**Rationale:** Matches existing behavior for face-up card selection. Deck only clickable when actions are available.

**Alternative Considered:** Disable hover state during non-action phases — less clear UX; better to prevent click entirely.

---

## Risks / Trade-offs

**[Risk] Deck visual count mismatch during rapid draws** → **Mitigation:** Game state is authoritative; visual updates on next render frame. No client-side caching. Acceptable lag since canvas redraws at 60fps.

**[Risk] Hit testing misses rotated card boundaries** → **Mitigation:** Rectangular hit box is intentionally larger than visual cards to account for rotation. Verified against existing hit test implementation.

**[Risk] Portal action flow expects specific card type markers** → **Mitigation:** Deck draw must return card ID from `characterDeck[0]` (top card). Verify that `handleCardClick()` doesn't make assumptions about face-up card indexing.

---

## Migration Plan

**Implementation order:**
1. Verify `drawDeckStack()` receives correct `characterDeckCount` from game state
2. Confirm hit-test detection for `'deck-character'` returns correct bounding box
3. Integrate deck hit into `handleCardClick()` flow: when `hitTarget.type === 'deck-character'`, extract top deck card and proceed with standard selection logic
4. Test end-to-end: deck click → card drawn → Portal updates → visual deck shrinks
5. Verify phase gating (no clicks outside `takingActions` phase)

---

## Open Questions

- Does `handleCardClick()` make assumptions about card indices that would break with deck draws?
- What is the exact structure of a card object returned from `characterDeck[0]`?
- Are there any Portal-specific constraints on how many cards can be selected at once from deck vs. face-up?
