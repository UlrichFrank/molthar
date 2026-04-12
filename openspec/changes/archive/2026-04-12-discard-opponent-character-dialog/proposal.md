## Why

Die Ability `discardOpponentCharacter` entfernt aktuell automatisch die erste verfügbare Portal-Karte des ersten Gegners — ohne Spielerauswahl. Das ist ein Platzhalter (TODO TIER 1). Der Spieler muss selbst entscheiden, welche Karte er entfernt; dafür braucht er einen Dialog mit allen Optionen.

## What Changes

- Beim Aktivieren einer Karte mit `discardOpponentCharacter`-Ability wird kein Gegner automatisch gewählt.
- Stattdessen wird ein Flag `pendingDiscardOpponentCharacter: true` im Game-State gesetzt — aber nur wenn mindestens ein Gegner eine Karte im Portal hat.
- Das Frontend erkennt das Flag und zeigt dem aktiven Spieler einen nicht-abbrechbaren Dialog.
- Im Dialog sieht der Spieler alle Portale der Gegner, geordnet nach Spielerreihenfolge beginnend beim nächsten Spieler, mit den zugehörigen Charakterkarten.
- Der Spieler wählt eine Karte aus; der Dialog schließt sich sofort.
- Ein neuer Move `resolveDiscardOpponentCharacter(targetPlayerId, portalEntryId)` entfernt die gewählte Karte und löscht das Flag.
- Hat kein Gegner eine Karte im Portal, wird die Ability ignoriert — kein Flag, kein Dialog.

## Capabilities

### New Capabilities

- `discard-opponent-character-selection`: Interaktive Spielerauswahl für die `discardOpponentCharacter`-Ability — Pending-Flag im Game-State + Resolve-Move.
- `discard-opponent-character-dialog`: Frontend-Dialog zur Anzeige aller Gegner-Portal-Karten mit Auswahl.

### Modified Capabilities

- `game-web-spec`: Das Board muss das neue Pending-Flag aus dem Game-State lesen und den Dialog auslösen.

## Impact

- `shared/src/game/types.ts` — Neues Flag `pendingDiscardOpponentCharacter: boolean` im `GameState`
- `shared/src/game/abilityHandlers.ts` — `discardOpponentCharacter`-Case: statt auto-remove nur Flag setzen
- `shared/src/game/index.ts` — Neuer Move `resolveDiscardOpponentCharacter`, Setup-Initialwert
- `game-web/src/contexts/DialogContext.tsx` — Neuer Dialog-Typ `discard-opponent-character`
- `game-web/src/components/` — Neue Komponente `DiscardOpponentCharacterDialog`
- `game-web/src/components/CanvasGameBoard.tsx` — Dialog bei Flag triggern, Move aufrufen
