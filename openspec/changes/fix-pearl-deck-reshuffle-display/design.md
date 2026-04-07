## Context

The pearl deck reshuffle has two bugs:

**Bug 1 — Reshuffle not triggered after deck-click empties the deck:**
`takePearlCard(-1)` pops the last card from `G.pearlDeck`, then calls `refillSlots`. Because `pearlSlots` is already at max capacity (4 cards), the `while (slots.length < maxSlots)` loop never executes, so `drawCard` is never called, so the discard pile is never shuffled into the deck and `isReshufflingPearlDeck` is never set. The animation doesn't appear; the deck stays empty until the next slot-take triggers `drawCard`.

**Bug 2 — Reshuffle animation never auto-dismisses:**
`DeckReshuffleAnimation` fires `onDone` (= `moves.acknowledgeReshuffle(...)`) after 1500 ms for every connected client. boardgame.io only accepts moves from the active player. Non-active clients receive an optimistic-update (flag briefly clears, component unmounts, timer cancelled), then a server rejection (flag restored, component remounts, new timer starts). This creates an infinite reset cycle. If the active player ends their turn before the 1500 ms window, they also become a non-active client and fall into the same cycle.

## Goals / Non-Goals

**Goals:**
- Reshuffle is triggered immediately when the pearl deck empties, even when display slots are full.
- Reshuffle animation reliably auto-dismisses — within 1500 ms for the active player, at the latest on the next turn start.
- No infinite optimistic-update cycle for non-active players.

**Non-Goals:**
- Character deck has the same structural code; fix is parallel but not part of this change (character deck slots only have 2 slots and the scenario is less common).
- Animated transition of individual cards from discard to deck.

## Decisions

**Decision 1 — Proactive reshuffle in `takePearlCard(-1)` (Bug 1)**

After `G.pearlDeck.pop()`, if `G.pearlDeck.length === 0 && G.pearlDiscardPile.length > 0`, immediately: splice discard pile into deck, shuffle, set `isReshufflingPearlDeck = true`. Then call `refillSlots` as before (it now draws from the freshly populated deck).

Alternative considered: modify `refillSlots` to also check whether a reshuffle should happen even when slots are full. Rejected — `refillSlots` has a clear contract (fill slots, don't touch state beyond that), changing it would add unexpected side effects.

**Decision 2 — `turn.onBegin` clears reshuffle flags (Bug 2 backend)**

Add `G.isReshufflingPearlDeck = false; G.isReshufflingCharacterDeck = false;` to `turn.onBegin`. This is a reliable, server-side, always-executed hook that doesn't depend on any player calling a move. It acts as a hard fallback: if `acknowledgeReshuffle` never succeeds, the flags are cleared at the start of the next turn.

Alternative considered: Use `turn.onEnd` instead of `turn.onBegin`. Functionally equivalent; `onBegin` is chosen because the new turn's state should start clean.

**Decision 3 — Non-active players get no-op `onDone` (Bug 2 frontend)**

Change `CanvasGameBoard` so that `DeckReshuffleAnimation.onDone` is `() => moves.acknowledgeReshuffle?.('pearl')` only when `isActive`, and a no-op `() => {}` otherwise. Non-active players still see the animation (good UX) but don't fire the move (no cycle). The animation disappears for them when either the active player dismisses it, or `turn.onBegin` clears the flag.

Alternative considered: Hide the animation entirely for non-active players. Rejected — seeing the reshuffle notification is useful for all players.

## Risks / Trade-offs

- [Risk] Both players are non-active simultaneously → This is impossible in boardgame.io's turn-based model; one player is always active.
- [Risk] Active player's 1500 ms timer fires after their turn ends → `turn.onBegin` on the next turn clears the flag, so the animation disappears at most one turn late. Acceptable.
- [Trade-off] Reshuffle flags always reset on `turn.onBegin`, even if a reshuffle happened in the last millisecond of the previous turn and the animation hasn't shown yet → The window is extremely narrow and the animation is informational, not blocking.
