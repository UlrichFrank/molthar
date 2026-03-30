## Why

Die Ability `stealOpponentHandCard` stiehlt aktuell automatisch die erste Karte des ersten verfügbaren Gegners — ohne Spieler- oder Kartenauswahl (TODO TIER 1). Der Spieler soll selbst entscheiden, welchem Gegner er welche Karte stiehlt. Der zweigeteilte Dialog (erst Spieler wählen, dann Karte wählen) erzeugt dabei Spannung: die Handkarten anderer Spieler sind zunächst verdeckt.

## What Changes

- Beim Aktivieren einer Karte mit `stealOpponentHandCard`-Ability wird kein Gegner automatisch gewählt.
- Stattdessen wird das Flag `pendingStealOpponentHandCard: true` im Game-State gesetzt — aber nur wenn mindestens ein Gegner Handkarten hat.
- Das Frontend zeigt dem aktiven Spieler einen nicht-abbrechbaren zweistufigen Dialog:
  - **Stufe 1:** Alle Gegner mit ihren Handkarten **verdeckt** (nur Anzahl sichtbar). Spieler wählt einen Gegner per Klick.
  - **Stufe 2:** Die Handkarten des gewählten Gegners werden **aufgedeckt** (alle sichtbar). Spieler wählt eine Karte.
- Ein neuer Move `resolveStealOpponentHandCard(targetPlayerId, handCardIndex)` überträgt die gewählte Karte in die Hand des aktiven Spielers und löscht das Flag.
- Hat kein Gegner Handkarten: Ability wird ignoriert — kein Flag, kein Dialog.
- Der Dialog hat keinen Abbrechen-Button.

## Capabilities

### New Capabilities

- `steal-opponent-hand-card-selection`: Pending-Flag im Game-State + Resolve-Move für die interaktive Kartenauswahl.
- `steal-opponent-hand-card-dialog`: Zweistufiger Frontend-Dialog (Spielerauswahl → Kartenauswahl).

### Modified Capabilities

- `game-web-spec`: Board liest das neue Pending-Flag und öffnet den Dialog.

## Impact

- `shared/src/game/types.ts` — Neues Flag `pendingStealOpponentHandCard: boolean`
- `shared/src/game/abilityHandlers.ts` — Auto-Steal entfernen, nur Flag setzen
- `shared/src/game/index.ts` — Neuer Move `resolveStealOpponentHandCard`, Setup-Initialwert
- `game-web/src/contexts/DialogContext.tsx` — Neuer Dialog-Typ `steal-opponent-hand-card`
- `game-web/src/components/` — Neue Komponente `StealOpponentHandCardDialog`
- `game-web/src/components/CanvasGameBoard.tsx` — Dialog bei Flag triggern, Move aufrufen
