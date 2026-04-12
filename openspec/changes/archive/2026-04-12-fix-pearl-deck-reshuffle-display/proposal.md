## Why

Two linked bugs cause the pearl deck reshuffle to either not appear at all or to appear and then never dismiss. This breaks player feedback: players don't know the deck was reshuffled, and the animation may block the UI indefinitely.

## What Changes

- In `takePearlCard` (slotIndex = -1): after popping the last card from the pearl deck, proactively reshuffle the discard pile into the deck immediately, even when the display slots are already full.
- In `turn.onBegin`: clear `isReshufflingPearlDeck` and `isReshufflingCharacterDeck` flags so any leftover reshuffle animation is reliably dismissed at the start of every new turn.
- In `CanvasGameBoard`: the `DeckReshuffleAnimation` `onDone` callback only calls `acknowledgeReshuffle` for the active player. Non-active players render the animation with a no-op `onDone` to avoid the optimistic-update / rollback cycle that causes infinite flickering.

## Capabilities

### New Capabilities
- `pearl-deck-proactive-reshuffle`: When a player takes the last pearl card directly from the deck (deck click, slotIndex=-1), and the deck becomes empty but the display slots are already full, the discard pile is immediately reshuffled into the deck and the reshuffle flag is set.

### Modified Capabilities
- `reshuffle-flag-lifecycle`: Reshuffle flags (`isReshufflingPearlDeck`, `isReshufflingCharacterDeck`) are now cleared in `turn.onBegin` as a reliable fallback. Frontend dismissal via `acknowledgeReshuffle` is restricted to the active player only.

## Impact

- `shared/src/game/index.ts` — `takePearlCard` move, `turn.onBegin`
- `game-web/src/components/CanvasGameBoard.tsx` — `DeckReshuffleAnimation` `onDone` prop
