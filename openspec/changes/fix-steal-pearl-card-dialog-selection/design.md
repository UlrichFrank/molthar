## Context

The "Perlenkarten Stehlen" dialog (`StealOpponentHandCardDialog`) is a two-step flow:
1. Pick an opponent (shows face-down card thumbnails + opponent name)
2. Pick a specific card from that opponent's hand (shows face-up cards)

Step 1 renders correctly but shows broken images because the face-down asset is referenced by the wrong filename. Step 2 renders the card buttons, but clicking them does not call the move or close the dialog in practice, leaving the player stuck. Additionally, the backend move `resolveStealOpponentHandCard` returns `undefined` on guard failures instead of `INVALID_MOVE`, which is semantically incorrect for boardgame.io.

The fix touches only two files:
- `game-web/src/components/StealOpponentHandCardDialog.tsx` — image path + click wiring
- `shared/src/game/index.ts` — move guard returns

## Goals / Non-Goals

**Goals:**
- Clicking a card in step 2 calls `onSteal(opponentId, cardIndex)` and closes the dialog
- Step 1 shows the correct face-down pearl card image (`Perlenkarte Hinten.png`)
- `resolveStealOpponentHandCard` returns `INVALID_MOVE` on all guard-check failures

**Non-Goals:**
- Redesigning the dialog UI or flow
- Masking opponent hand values from clients (no playerView change)
- Fixing any other dialog (retrieve-pearl, discard, etc.)

## Decisions

**Fix image path directly in the JSX (not via a constant)**
The face-down image filename is a one-off string used only in this component. Introducing a shared constant or moving it to a config would be premature. The correct filename is `Perlenkarte Hinten.png` (with space, matching the asset loader in `imageLoaderV2.ts` and `gameRender.ts`).

**Add `return INVALID_MOVE` on all guard failures in the move**
boardgame.io distinguishes between a move that makes no mutations (returns `undefined`) and one that is explicitly invalid (returns `INVALID_MOVE`). Only `INVALID_MOVE` prevents the framework from logging the move as successful and ensures correct undo/redo and optimistic-update behaviour. All existing early-return guards in `resolveStealOpponentHandCard` must be changed to `return INVALID_MOVE`.

**Keep `dialog.closeDialog()` unconditional in the `onSteal` callback**
The dialog should close as soon as the user picks a card, regardless of server-side validation. boardgame.io's optimistic updates handle the case where the move is ultimately rejected — the game state reverts, and the pending flag stays set, which will re-open the dialog automatically.

## Risks / Trade-offs

**Step 2 shows face-up opponent cards** — Intentional for this ability. There is no playerView masking, so hand values are accessible. This is a game-design decision already in place.

**`dialog.closeDialog()` before server confirmation** → Low risk. If the move is invalid, the pending flag (`G.pendingStealOpponentHandCard`) remains true and the auto-open `useEffect` in `CanvasGameBoard` will re-open the dialog on the next render.
