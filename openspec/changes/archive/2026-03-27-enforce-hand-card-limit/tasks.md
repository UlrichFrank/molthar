# Implementation Tasks: Hand Card Limit Enforcement

## 1. Backend - Game State Schema Update

- [x] 1.1 Add `handLimitModifier: number` field to PlayerState type definition
- [x] 1.2 Initialize `handLimitModifier = 0` for all players in game setup
- [x] 1.3 Verify characters with `handLimitPlusOne` ability exist in card database
- [x] 1.4 Document that `handLimitPlusOne` property (in CharacterCard) grants +1 to hand limit

## 2. Backend - Hand Limit Calculation

- [x] 2.1 Add utility function `calculateHandLimit(handLimitModifier)` to calculate base limit (5) plus modifier
- [x] 2.2 Add utility function `validateHandSize(hand, handLimit)` to check if hand exceeds limit
- [x] 2.3 Add utility function `getExcessCardCount(hand, handLimit)` to calculate how many cards must be discarded

## 3. Backend - Character Activation Integration

- [x] 3.1 Modify character activation move to check if character has `handLimitPlusOne` property
- [x] 3.2 Increment player's `handLimitModifier` by 1 when character with `handLimitPlusOne` is activated

## 4. Backend - End-Turn Move Validation

- [x] 4.1 Modify `endTurn` game move to call hand limit validation before turn completion
- [x] 4.2 Add game state flag `requiresHandDiscard` (boolean) to indicate discard dialog should be shown
- [x] 4.3 When hand exceeds limit, set `requiresHandDiscard = true` instead of completing turn
- [x] 4.4 Update game state to include `excessCardCount` and `currentHandLimit` for UI display (derived from `handLimitModifier`)
- [x] 4.5 Add validation that prevents turn advance if `requiresHandDiscard` is true

## 5. Backend - Discard Move

- [x] 5.1 Create new game move `discardCardsForHandLimit(cardIndices)` to handle discard confirmation
- [x] 5.2 Validate that exactly the required number of cards are provided
- [x] 5.3 Remove selected cards from player hand
- [x] 5.4 Add selected cards to discard pile (Ablagestapel)
- [x] 5.5 Clear `requiresHandDiscard` flag and complete turn advance
- [x] 5.6 Handle case where move is rejected (card count mismatch)

## 6. Frontend - Discard Dialog Component

- [x] 6.1 Create new `DiscardCardsDialog.tsx` component (similar structure to CharacterActivationDialog)
- [x] 6.2 Accept props: `hand`, `excessCardCount`, `currentHandLimit`, `onDiscard`, `onCancel`
- [x] 6.3 Implement card selection with checkboxes/buttons for each pearl card in hand
- [x] 6.4 Display card values and swap symbols in selection UI
- [x] 6.5 Implement selection state management (selectedCards Set<number>)
- [x] 6.6 Disable confirm button when wrong number of cards selected
- [x] 6.7 Show error message for invalid selections
- [x] 6.8 Implement confirm button to call `onDiscard(selectedCardIndices)`
- [x] 6.9 Implement cancel button to call `onCancel()`

## 7. Frontend - Dialog Styling

- [x] 7.1 Create `discardCardsDialog.css` with styling for dialog overlay and content
- [x] 7.2 Style card selection buttons with hover/selected states
- [x] 7.3 Style confirm/cancel buttons with enabled/disabled states
- [x] 7.4 Add visual feedback for card value and swap symbol display
- [x] 7.5 Ensure dialog is modal and blocks board interaction

## 8. Frontend - Game Flow Integration

- [x] 8.1 Modify end-turn button handler to check `requiresHandDiscard` flag before showing dialog
- [x] 8.2 Show `DiscardCardsDialog` when `requiresHandDiscard` is true
- [x] 8.3 Pass game state data to dialog (hand, excess count, limit from `handLimitModifier`)
- [x] 8.4 Implement `onDiscard` callback to call `discardCardsForHandLimit` move
- [x] 8.5 Implement `onCancel` callback to close dialog (returning to board)
- [x] 8.6 Handle discard move result and update game state

## 9. UI Display - Hand Limit Indicator

- [ ] 9.1 Add hand limit indicator to player panel or hand display (optional, improves UX)
- [ ] 9.2 Show current hand size and limit in format "X/Y cards" (e.g., "7/5 cards" in red if over)
- [ ] 9.3 Update indicator when hand changes or `handLimitModifier` changes

## 10. Testing

- [x] 10.1 Unit test: `calculateHandLimit` with various `handLimitModifier` values
- [x] 10.2 Unit test: `validateHandSize` with hands at/under/over limit
- [x] 10.3 Unit test: `getExcessCardCount` calculation
- [x] 10.4 Integration test: Character with `handLimitPlusOne` activation updates `handLimitModifier`
- [x] 10.5 Integration test: End turn with hand over limit triggers discard flag
- [x] 10.6 Integration test: `discardCardsForHandLimit` move with valid selection succeeds
- [x] 10.7 Integration test: Move with invalid card count is rejected
- [x] 10.8 Integration test: Turn cannot complete without resolving hand discard
- [ ] 10.9 Component test: DiscardCardsDialog card selection works
- [ ] 10.10 Component test: Confirm button state matches selection count

## 11. Documentation & Polish

- [x] 11.1 Add JSDoc comments to hand limit utility functions
- [x] 11.2 Document that `handLimitPlusOne` property in CharacterCard grants +1 to player's `handLimitModifier`
- [x] 11.3 Test with various character combinations to ensure modifier tracking works
- [x] 11.4 Verify discard pile behavior (cards are actually moved)
- [x] 11.5 Playtest to ensure UX feels natural and intuitive
- [x] 11.6 Verify `handLimitModifier` persists correctly in game state saves/loads
