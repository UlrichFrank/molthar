## Why

Die Ability `changeCharacterActions` erlaubt es dem Spieler, vor der ersten Aktion eine Portal-Karte mit einer der zwei ausliegenden Charakterkarten zu tauschen. Der Backend-Move `swapPortalCharacter(portalSlotIndex, tableSlotIndex)` existiert bereits und ist vollständig implementiert — aber im Frontend gibt es keinen Weg, ihn auszulösen.

## What Changes

- Wenn der Spieler die `changeCharacterActions`-Ability aktiv hat und noch keine Aktion durchgeführt hat (`actionCount === 0`), wird unterhalb jeder Portal-Karte ein "Austausch"-Button auf dem Canvas gerendert (⇄ Symbol).
- Ein Klick auf diesen Button öffnet einen `CharacterSwapDialog`: angelehnt an `CharacterReplacementDialog`, aber für bidirektionalen Tausch.
- Der Dialog zeigt die gewählte Portal-Karte oben und die zwei ausliegenden Charakterkarten (aus `characterSlots`) unten zur Auswahl.
- Wählt der Spieler eine Auslage-Karte aus, wird `swapPortalCharacter(portalSlotIndex, tableSlotIndex)` aufgerufen — beide Karten tauschen die Positionen.
- Der Dialog hat einen Cancel-Button (der Tausch ist optional).
- Kein Backend-Change nötig.

## Capabilities

### New Capabilities

- `swap-portal-character-btn`: Canvas-Austausch-Button unterhalb Portal-Karten, sichtbar bei aktiver Ability und `actionCount === 0`.
- `swap-portal-character-dialog`: Dialog zur Auswahl der Tauschkarte aus den Auslage-Slots.

### Modified Capabilities

- `game-web-spec`: Neues Klick-Verhalten und Dialog für Portal-Karten bei aktiver `changeCharacterActions`-Ability.

## Impact

- `game-web/src/lib/canvasRegions.ts` — Neue Region `portal-swap-btn` (eine pro belegtem Portal-Slot) bei aktiver Ability
- `game-web/src/lib/gameRender.ts` — Button-Symbol unterhalb Portal-Karten zeichnen
- `game-web/src/contexts/DialogContext.tsx` — Neuer Dialog-Typ `swap-portal-character`
- `game-web/src/components/CharacterSwapDialog.tsx` — Neue Komponente (an `CharacterReplacementDialog` angelehnt)
- `game-web/src/components/CanvasGameBoard.tsx` — Klick-Handler für `portal-swap-btn`, Dialog öffnen/auslösen
- Kein Shared/Backend-Change
