## Why

Die Karte **„Tod"** hat die `changeHandActions`-Fähigkeit: nach der letzten Aktion des Zuges darf der Spieler seine gesamte Perlenkarten-Hand ablegen und die gleiche Anzahl neu ziehen. Der Backend-Move `rehandCards` ist vollständig implementiert und getestet — das Frontend bietet jedoch keinen Weg, ihn auszulösen. Der Button „Zug beenden" erscheint sofort nach der letzten Aktion, ohne die Möglichkeit zum Handtausch anzubieten.

## What Changes

- Nach der letzten Aktion des Zuges: wenn der aktive Spieler die `changeHandActions`-Fähigkeit hat, erscheint vor dem „Zug beenden"-Button ein zusätzlicher Button „Hand neu ziehen".
- Klick auf „Hand neu ziehen" ruft `moves.rehandCards()` auf. Danach verschwindet der Button (die Fähigkeit ist einmalig pro Zug nutzbar, da `rehandCards` die Hand ersetzt und kein erneutes Auslösen sinnvoll ist).
- „Zug beenden" bleibt weiterhin sichtbar und funktioniert unverändert — der Handtausch ist optional.

## Capabilities

### New Capabilities

- `change-hand-actions-trigger`: UI-Button der `rehandCards` auslöst, sichtbar nach der letzten Aktion wenn `changeHandActions`-Fähigkeit aktiv ist.

### Modified Capabilities

_(keine)_

## Impact

- `game-web/src/components/CanvasGameBoard.tsx`: Button-Rendering im Spieler-UI-Bereich, analog zum bestehenden `EndTurnButton`
- `game-web/src/components/EndTurnButton.tsx` oder neue Komponente: optionaler „Hand neu ziehen"-Button
- Kein Backend-Eingriff nötig — `rehandCards`-Move ist bereits fertig
