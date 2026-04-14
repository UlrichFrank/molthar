## Why

Wenn ein Spieler eine offene Charakterkarte (Auslage) ins Portal holt und dabei die Aktion eine Abwerfen-Interaktion auslöst (z. B. Handkarten-Überschuss durch Handlimit-Regel, oder Verwerfen der Charakterkarte in der CharacterReplacementDialog), schließt sich der entsprechende Dialog nach der Bestätigung nicht. Der Spieler bleibt im Dialog hängen und kann nicht weiterspielen.

## What Changes

- Der `DiscardCardsDialog` (Handkarten-Abwerfen) und/oder `CharacterReplacementDialog` (Charakterkarte Verwerfen) schließen sich nach Bestätigung zuverlässig
- Root-Cause-Analyse als Teil der Implementierung: Prüfen ob `dialog.closeDialog()` korrekt aufgerufen wird, ob ein useEffect den Dialog nach dem Schließen sofort wieder öffnet, oder ob ein boardgame.io-State-Update den Dialog-Zustand überschreibt
- Nach dem Fix: nach Bestätigung des Abwerfens ist der Dialog geschlossen und der Spieler kann weiterklicken

## Capabilities

### New Capabilities

### Modified Capabilities
- `take-character-card-dialog`: Abwerfen-Interaktion im Kontext des Charakterkarten-Holens muss Dialog zuverlässig schließen

## Impact

- `game-web/src/components/CanvasGameBoard.tsx` — Dialog-Close-Logik in `onDiscard`- und `onSelect`-Callbacks, ggf. useEffect-Abhängigkeiten
- `game-web/src/contexts/DialogContext.tsx` — ggf. `closeDialog` korrekt eingesetzt
- `game-web/src/components/CharacterReplacementDialog.tsx` — ggf. Button-Handler anpassen
- `game-web/src/components/DiscardCardsDialog.tsx` — ggf. Close-Verhalten sicherstellen
