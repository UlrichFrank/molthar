## Why

Die Ability `takeBackPlayedPearl` erlaubt das Zurückholen einer ausgespielten Perlenkarte. Der aktuelle Code nutzt `lastPlayedPearlId` — dieses Feld wird jedoch nirgends gesetzt, die Ability ist funktionslos. Gleichzeitig soll die Ability auf ALLE echten (nicht-virtuellen) Perlenkarten des Zuges ausgeweitet werden und dem Spieler die Auswahl überlassen.

## What Changes

- `lastPlayedPearlId: string | null` wird durch `playedRealPearlIds: string[]` ersetzt: ein laufendes Log aller echten Perlenkarten-IDs, die in diesem Zug auf den Ablagestapel gelegt wurden.
- Dieses Log wird bei jeder Aktivierung (in `activatePortalCard` und `activateSharedCharacter`) befüllt, wenn echte Handkarten konsumiert werden.
- Das Log wird am Zugende geleert.
- Die `takeBackPlayedPearl`-Ability setzt `pendingTakeBackPlayedPearl: true` — immer, unabhängig davon ob echte Karten im Log sind.
- Das Frontend zeigt einen Dialog:
  - **Mit echten Karten:** Alle Karten aus `playedRealPearlIds` werden angezeigt. Klick auf eine → zurück auf die Hand, Dialog schließt sich.
  - **Ohne echte Karten (nur virtuelle gespielt):** Informationstext "Nur virtuelle Perlenkarten wurden gespielt." Klick auf den Text → Dialog schließt sich.
- Neuer Move `resolveReturnPearl(pearlId)` holt die Karte vom Ablagestapel zurück.
- Neuer Move `dismissReturnPearlDialog()` schließt den Dialog ohne Effekt (für den Keine-Karten-Fall).

## Capabilities

### New Capabilities

- `played-real-pearl-tracking`: Log `playedRealPearlIds` verfolgt alle echten Perlenkarten, die in diesem Zug konsumiert wurden.
- `take-back-played-pearl-dialog`: Frontend-Dialog zur Auswahl einer zurückzuholenden Perlenkarte, mit Leerstate-Anzeige für virtuelle Karten.

### Modified Capabilities

- `game-web-spec`: Board triggert den neuen Dialog bei gesetztem `pendingTakeBackPlayedPearl`-Flag.

## Impact

- `shared/src/game/types.ts` — `lastPlayedPearlId` entfernen, `playedRealPearlIds: string[]` und `pendingTakeBackPlayedPearl: boolean` hinzufügen
- `shared/src/game/abilityHandlers.ts` — `takeBackPlayedPearl`-Case: nur Flag setzen, kein direktes Zurückholen mehr
- `shared/src/game/index.ts` — `consumedCards` beim Push auf `pearlDiscardPile` in `playedRealPearlIds` eintragen; zwei neue Moves; Setup und Turn-End aktualisieren
- `game-web/src/contexts/DialogContext.tsx` — Neuer Dialog-Typ `take-back-played-pearl`
- `game-web/src/components/` — Neue Komponente `TakeBackPlayedPearlDialog`
- `game-web/src/components/CanvasGameBoard.tsx` — Dialog bei Flag triggern
