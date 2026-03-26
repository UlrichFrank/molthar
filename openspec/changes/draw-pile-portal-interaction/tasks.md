## 1. Implement Proportional Deck Rendering

- [x] 1.1 Determine initial deck size (maxDeckSize) — store as constant or derive from initial game state setup
- [x] 1.2 Implement proportional mapping formula: `visibleCards = Math.ceil(currentCount / maxDeckSize * 7)`
- [x] 1.3 Ensure formula guarantees: while `currentCount > 0`, always `visibleCards >= 1` (no empty display gap)
- [x] 1.4 Integrate proportional calculation into `drawDeckStack()` call from `drawAuslage()`
- [ ] 1.5 Test with various deck sizes (small 10-card, medium 40-card, large 80-card decks)
- [ ] 1.6 Test edge cases: 1 card remaining, 2 cards remaining (verify visible count doesn't drop to 0)

## 2. Verify Deck Hit Testing

- [x] 2.1 Confirm `hitTest()` detects character deck clicks with bounding box (`CHAR_DECK_X`, `CHAR_DECK_Y`, `DECK_CARD_W`, `DECK_CARD_H`)
- [x] 2.2 Verify hit test returns `HitTarget` with `type: 'deck-character'` for deck region clicks
- [x] 2.3 Ensure hit test does NOT return deck hit for empty deck or clicks outside deck region
- [x] 2.4 Test hit detection at deck edges and center to verify bounding box accuracy

## 3. Integrate Deck Click to Portal Action Flow

- [x] 3.1 Locate `handleCardClick()` function and review how it processes `HitTarget` for face-up cards
- [x] 3.2 Add handling for `hitTarget.type === 'deck-character'` in click handler
- [x] 3.3 Extract top card from `characterDeck[0]` when deck is clicked
- [x] 3.4 Pass deck card to same Portal action flow as face-up cards (verify card object structure matches)
- [x] 3.5 Ensure drawn deck card correctly populates Portal slots identically to face-up selections

## 4. Implement Phase Gating for Deck Interaction

- [x] 4.1 Add phase check to deck click handler: only allow clicks when `G.gamePhase === 'takingActions'`
- [x] 4.2 Ensure deck is non-interactive (unclickable, no hover effect) during non-action phases
- [x] 4.3 Verify non-action phase check prevents card draw while deck click hit is still detected

## 5. Integration Testing

- [x] 5.1 Test end-to-end: click deck → card drawn → Portal updates → visual deck shrinks by one
- [x] 5.2 Test multiple consecutive deck draws in single action phase
- [x] 5.3 Test deck draw with empty deck (should be no-op)
- [x] 5.4 Test deck clicks during non-action phases (discard, game finished) - should not trigger draw
- [x] 5.5 Test Portal behavior when mix of face-up and deck cards are selected in same phase
- [x] 5.6 Test deck visual sync after game state updates from network/opponent actions

## 6. Code Quality & Documentation

- [x] 6.1 Add inline comments explaining deck click → Portal flow integration
- [x] 6.2 Verify no new state variables introduced; display logic remains pure (reads only from game state)
- [x] 6.3 Code review: ensure no assumptions about card indices that would break with deck draws
