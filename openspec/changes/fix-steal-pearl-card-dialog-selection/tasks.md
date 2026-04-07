## 1. Frontend: StealOpponentHandCardDialog

- [x] 1.1 Fix face-down image path in step 1: replace `/assets/Perlenkarte-Rückseite.png` with `/assets/Perlenkarte Hinten.png`
- [x] 1.2 Verify step 2 card buttons call `onSteal(selectedOpponent.id, idx)` on click and that `onSteal` closes the dialog — no code change needed if already wired correctly, otherwise fix the onClick handler

## 2. Backend: Move guard returns

- [x] 2.1 In `resolveStealOpponentHandCard` (shared/src/game/index.ts), change all guard `return;` statements to `return INVALID_MOVE`
