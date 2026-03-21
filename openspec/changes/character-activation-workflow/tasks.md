## 1. Setup and Investigation

- [x] 1.1 Review current `activatePortalCard` move in shared/src/game/index.ts
- [x] 1.2 Verify ActivatedCharacter interface structure in shared/src/game/types.ts
- [x] 1.3 Verify player.portal array management in GameEngine
- [x] 1.4 Check how portal cards are currently rendered in game-web

## 2. Implement Card Removal from Portal

- [x] 2.1 Update `activatePortalCard` move to splice card from portal array
- [x] 2.2 Ensure removal happens AFTER cost validation succeeds
- [x] 2.3 Ensure removal happens BEFORE GameState is returned to client
- [x] 2.4 Verify the activated card object is captured before splicing
- [x] 2.5 Add safety check: validate portalSlotIndex is within bounds

## 3. Validate Portal Index and Slot Logic

- [x] 3.1 Add validation: reject activation if portalSlotIndex >= portal.length
- [x] 3.2 Add validation: reject activation if portalSlotIndex < 0
- [ ] 3.3 Test that portal indices are contiguous after removal (no null entries)
- [ ] 3.4 Test that remaining cards shift properly (indices 0, 1, 2...)

## 4. Update GameState Consistency

- [x] 4.1 Verify portal array has correct length after activation
- [x] 4.2 Verify activated card is accessible via activated characters grid
- [x] 4.3 Verify card properties (cost, power, diamonds) are preserved
- [x] 4.4 Verify card is NOT in both portal and activated simultaneously

## 5. Unit Tests for Card Removal

- [ ] 5.1 Test: card is removed from portal after activation
- [ ] 5.2 Test: portal array shrinks after removal (length decreases by 1)
- [ ] 5.3 Test: remaining cards in portal don't have null entries
- [ ] 5.4 Test: activated card is no longer accessible via portal array index
- [ ] 5.5 Test: cannot re-activate the same card twice

## 6. Unit Tests for Portal State

- [ ] 6.1 Test: portal with 2 cards, activate first → portal has 1 card
- [ ] 6.2 Test: portal with 2 cards, activate second → portal has 1 card
- [ ] 6.3 Test: player can take new card after activating (portal not full)
- [ ] 6.4 Test: out-of-bounds portal index is rejected

## 7. Unit Tests for Activation State

- [ ] 7.1 Test: activated card has activated = true
- [ ] 7.2 Test: activated card's properties are identical to original
- [ ] 7.3 Test: activated card appears in activated characters list
- [ ] 7.4 Test: multiple cards can be activated sequentially

## 8. Integration Tests

- [ ] 8.1 Test: full activation flow (take card → place in portal → activate → remove)
- [ ] 8.2 Test: portal fills and empties correctly across multiple turns
- [ ] 8.3 Test: game state is consistent after activation (no duplicate cards)
- [ ] 8.4 Test: cost validation still prevents invalid activations

## 9. Verify Frontend Compatibility

- [x] 9.1 Review game-web rendering to verify it handles portal correctly
- [x] 9.2 Verify activated characters grid still displays activated cards
- [x] 9.3 Verify portal rendering doesn't try to access removed cards
- [ ] 9.4 Manual test: activate card in running game and verify removal

## 10. Regression Testing

- [x] 10.1 Run full test suite for shared/src/game/
- [x] 10.2 Run full test suite for game-web
- [x] 10.3 Verify existing character activation logic still works
- [x] 10.4 Verify portal-related tests pass
- [x] 10.5 Verify no console errors or warnings

## 11. Documentation and Cleanup

- [x] 11.1 Add JSDoc comments to updated activatePortalCard move
- [x] 11.2 Update inline comments explaining card removal
- [x] 11.3 Document that cards are removed from portal on activation
- [x] 11.4 Ensure no debug logging or temporary code remains
- [x] 11.5 Verify TypeScript compilation with strict mode

## 12. Final Verification

- [x] 12.1 Create comprehensive game scenario test
- [ ] 12.2 Manual end-to-end test: multi-turn game with multiple activations
- [ ] 12.3 Verify game state consistency throughout
- [x] 12.4 Create git commit with clear description
- [ ] 12.5 Summary: all tasks complete and tested

