## Context

Der `TakeBackPlayedPearlDialog` zeigt alle in diesem Zug gespielten echten Perlenkarten (aus `G.playedRealPearlIds`, aufgelöst über `G.pearlDiscardPile`). Ein Klick ruft `onTakeBack(card.id)` auf, welches `moves.resolveReturnPearl(pearlId)` und `dialog.closeDialog()` aufruft.

Das Problem: `resolveReturnPearl` hat fünf Guard-Statements die mit `return;` (= `undefined`) abbrechen. In boardgame.io bedeutet ein Move der `undefined` zurückgibt und keine State-Mutationen vornimmt: der Move gilt als „no-op-valid". Der Server ändert den State nicht — `G.pendingTakeBackPlayedPearl` bleibt `true`. Das Client-seitige `dialog.closeDialog()` schließt den Dialog kurz, aber der `useEffect` in `CanvasGameBoard`, der `G.pendingTakeBackPlayedPearl` beobachtet, öffnet ihn sofort wieder. Der Nutzer erlebt das als „Klick hat keine Wirkung".

Durch `return INVALID_MOVE` signalisiert boardgame.io korrekt, dass der Move ungültig war — im Happy Path mutiert der Move `pendingTakeBackPlayedPearl = false`, der State bleibt so, und der Dialog bleibt geschlossen.

Die Klick-Verdrahtung im Dialog (`onClick={() => onTakeBack(card.id)}`) und in `CanvasGameBoard` (`moves.resolveReturnPearl(pearlId); dialog.closeDialog()`) ist bereits korrekt — kein UI-Code-Change nötig.

## Goals / Non-Goals

**Goals:**
- `resolveReturnPearl` gibt `INVALID_MOVE` zurück bei allen Guard-Failures
- Klick auf eine Karte schließt den Dialog dauerhaft und legt die Karte in die Hand

**Non-Goals:**
- UI-Redesign des Dialogs
- Änderungen an anderen Dialogen

## Decisions

**Nur `INVALID_MOVE` hinzufügen, kein weiterer Code-Change**
Die Klick-Logik ist bereits korrekt verdrahtet. Die einzige Ursache des Bugs ist das falsche Rückgabeverhalten der Move-Guards — dieselbe Ursache wie in `resolveStealOpponentHandCard`, der bereits gefixt wurde.

**`dialog.closeDialog()` bleibt unconditional**
Wenn der Move valid ist und Mutationen vornimmt, wird `pendingTakeBackPlayedPearl = false` gesetzt und der `useEffect` öffnet den Dialog nicht mehr. Das ist das korrekte Verhalten.

## Risks / Trade-offs

**Kein nennenswertes Risiko** — reine Semantik-Korrektur im Move-Rückgabewert, kein Einfluss auf State-Mutationen im Happy Path.
