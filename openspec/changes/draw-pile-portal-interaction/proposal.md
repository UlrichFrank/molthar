## Why

The character deck in the display should provide complete visual feedback and interaction during gameplay. As cards are drawn, the deck should diminish visually to reflect the decreasing number of remaining cards. Additionally, clicking the deck should work seamlessly like clicking face-up cards, allowing players to draw blind cards directly into the Portal action flow.

## What Changes

- **Proportional visual mapping**: The character deck displays 1-7 overlapping card backs using proportional mapping: `visibleCards = Math.ceil(remaining / initialSize * 7)`. This ensures no display gap — as long as cards exist in the deck, at least one card is always visually shown
- **Guaranteed minimum visibility**: Even with only 1 card left, the deck renders 1 card (never 0). The visual count cannot drop below the actual card count through rounding
- **Deck remains interactive**: The deck is clickable during action phases when cards remain, becoming non-clickable only when empty
- **Unified card selection**: Clicking the deck draws a card and triggers the same Portal action flow as clicking face-up cards
- **State synchronization**: The visual deck always reflects the current game engine state without introducing new state variables

## Capabilities

### New Capabilities

- `deck-portal-integration`: Character deck cards drawn by clicking the deck are properly integrated into the Portal action system, triggering the same selection and placement mechanics as face-up cards

### Modified Capabilities

- `deck-visualization`: Ensure the character deck renders with proper visual diminishing as cards are drawn (displaying 1-7 cards proportionally until empty)
- `deck-interaction`: Ensure character deck clicks are fully wired to trigger card draw and Portal selection during takingActions phase
- `deck-state-tracking`: Ensure visual display accurately reflects engine state without introducing redundant state management

## Impact

- **Components**: Board display canvas rendering, deck interaction hit-testing, action flow handler
- **State**: Uses existing `characterDeck` array length; no new state variables
- **Phases**: Affects `takingActions` phase; deck becomes non-interactive in other phases
- **User experience**: Complete visual feedback loop for deck depletion and blind card selection
