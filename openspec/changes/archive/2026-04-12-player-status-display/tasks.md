## 1. Fähigkeits-Mapping definieren

- [x] 1.1 Mapping-Datei `game-web/src/lib/abilityDisplayMap.ts` erstellen mit deutschen Namen und Symbolen für alle blauen `CharacterAbilityType`-Werte (`handLimitPlusOne`, `oneExtraActionPerTurn`, `onesCanBeEights`, `threesCanBeAny`, `decreaseWithPearl`, `changeCharacterActions`, `changeHandActions`, `previewCharacter`, `tradeTwoForDiamond`, `numberAdditionalCardActions`, `anyAdditionalCardActions`, `irrlicht`)
- [x] 1.2 Fallback-Eintrag für unbekannte Typen (`★` + technischer Name) in der Mapping-Datei ergänzen

## 2. PlayerStatusBadge-Komponente

- [x] 2.1 `game-web/src/components/PlayerStatusBadge.tsx` erstellen: Props `playerState: PlayerState`, zeigt Kraftpunkte, Diamanten, Fähigkeits-Symbole (max. 5 + `+N`)
- [x] 2.2 Anklickbares Styling (Cursor-Pointer, hover-Effekt) mit Tailwind, konsistent mit `PlayerNameDisplay`-Stil
- [x] 2.3 Lokalen `isOpen`-State für Dialog-Steuerung im Badge verwalten (`useState`)

## 3. PlayerStatusDialog-Komponente

- [x] 3.1 `game-web/src/components/PlayerStatusDialog.tsx` erstellen: nutzt `GameDialog` + `GameDialogTitle`, Props `playerState: PlayerState`, `onClose: () => void`
- [x] 3.2 Dialog-Inhalt: Spieler-Name als Titel, Kraftpunkte, Diamanten als Werte-Zeilen
- [x] 3.3 Fähigkeits-Liste mit Symbol + vollem Namen aus `abilityDisplayMap`; Hinweistext „Keine aktiven Fähigkeiten" wenn leer
- [x] 3.4 Overlay-Klick schließt Dialog (`onOverlayClick` an `GameDialog` übergeben)

## 4. Integration in CanvasGameBoard

- [x] 4.1 `PlayerStatusBadge` für eigenen Spieler (`me`) unterhalb von `PlayerNameDisplay` im HTML-Overlay-Bereich von `CanvasGameBoard.tsx` einbinden
- [x] 4.2 Gegner-Badges für alle Einträge in `buildOpponentsArray` hinzufügen: je eine `PlayerStatusBadge`-Instanz absolut in der jeweiligen Gegner-Zone positionieren (links/oben-links/oben-rechts/rechts)
- [x] 4.3 Nicht-teilnehmende Spieler (null-Einträge in `buildOpponentsArray`) überspringen

## 5. Tests

- [x] 5.1 Unit-Test für `abilityDisplayMap`: alle bekannten Typen haben Namen und Symbol, Fallback für unbekannte Typen
- [x] 5.2 Render-Test für `PlayerStatusBadge`: zeigt korrekte Werte, zeigt Dialog bei Klick
- [x] 5.3 Render-Test für `PlayerStatusDialog`: zeigt alle Felder korrekt, schließt bei Overlay-Klick
