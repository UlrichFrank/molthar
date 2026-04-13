## Why

Die `irrlicht`-Ability erlaubt es Nachbarn (dem Vorgänger und Nachfolger im Spielzug), eine Karte mit dieser Ability im Portal des Besitzers zu aktivieren und für sich zu übernehmen — vorausgesetzt, der Besitzer hat sie noch nicht selbst aktiviert. Derzeit werden gegnerische Portale nur als Hintergrundbilder gerendert, ohne spielbare Interaktion. Spieler können Irrlicht-Karten von Nachbarn weder sehen noch aktivieren.

## What Changes

- `drawOpponentPortals` in `gameRender.ts` wird erweitert: alle Charakterkarten (beide Slots) aller gegnerischen Portale werden für alle Spieler sichtbar gerendert
- Neue Canvas-Regionen `opponent-portal-slot` werden für die Irrlicht-Karten der Nachbarn (Vorgänger/Nachfolger im Spielzug) registriert
- Klick auf eine aktivierbare Irrlicht-Karte öffnet den bestehenden `CharacterActivationDialog` mit `moves.activateSharedCharacter` als Callback
- Alle Portale mit ihren Karten sind für alle Spieler sichtbar; nur Irrlicht-Karten der direkten Nachbarn sind klickbar (wenn Besitzer noch nicht aktiviert hat)
- Der Dialog ist identisch zum eigenen Aktivierungsdialog — gleiche Zahlungsmechanik, gleiche Fähigkeiten-Sektion

## Capabilities

### New Capabilities

- `opponent-portals-visible`: Alle Spieler sehen alle gegnerischen Portale inkl. ausgelegter Charakterkarten in beiden Slots
- `irrlicht-neighbor-activation`: Nachbarn (Vorgänger/Nachfolger) können eine Irrlicht-Karte im Portal des Besitzers per Klick aktivieren — über `CharacterActivationDialog` mit `activateSharedCharacter`

### Modified Capabilities

*(keine bestehenden Spec-Capabilities betroffen)*

## Impact

- `game-web/src/lib/gameRender.ts` — `drawOpponentPortals` mit echter Kartenrendering für alle Slots aller Gegner
- `game-web/src/lib/canvasRegions.ts` — neue `opponent-portal-slot`-Regionen mit Rotationsunterstützung für Nachbarn-Irrlicht-Karten
- `game-web/src/components/CanvasGameBoard.tsx` — Klick-Handler für `opponent-portal-slot`, öffnet `CharacterActivationDialog` mit `activateSharedCharacter`
- `game-web/src/contexts/DialogContext.tsx` — ggf. neues Dialog-State-Feld für `opponentPortalSlot`-Kontext (ownerId + slotIndex)
