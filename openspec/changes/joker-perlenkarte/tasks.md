## 1. Datenmodell & Typen

- [x] 1.1 `PearlCard` in `shared/src/game/types.ts` um optionales `isJoker?: boolean` erweitern
- [x] 1.2 `CharacterAbilityType` (oder PaymentSelection-Typen) um `'joker'` als gültigen `abilityType`-Wert ergänzen

## 2. Backend – Perlen-Deck Initialisierung

- [x] 2.1 In `shared/src/game/index.ts` Setup: 2 Joker-Perlenkarten (`isJoker: true`) in `pearlDeck` einfügen (mit eigenen IDs, Wert z. B. 1 als Platzhalter)

## 3. Backend – Aktivierungsvalidierung

- [x] 3.1 In `activatePortalCard`: Joker-Karte erkennen (`isJoker: true` auf der Handkarte) und `abilityType === 'joker'` verarbeiten — gewählten Wert übernehmen, `diamondsToSpend += 1`
- [x] 3.2 Validierung: Wert muss zwischen 1 und 8 liegen
- [x] 3.3 Validierung: Gesamtanzahl `diamondsToSpend` (Joker + `decreaseWithPearl` + Kartenkostenelement) darf `player.diamondCards.length` nicht übersteigen
- [x] 3.4 Dieselbe Logik in `activateSharedCharacter` ergänzen

## 4. Tests (shared)

- [x] 4.1 Test: Joker-Karte mit gültigem Wert und ausreichend Diamanten → Move gültig
- [x] 4.2 Test: Joker-Karte ohne freien Diamanten → `INVALID_MOVE`
- [x] 4.3 Test: Joker-Karte mit Wert 0 oder 9 → `INVALID_MOVE`
- [x] 4.4 Test: Joker + Kartenkostenelement `diamond` gemeinsam → korrekte Diamantanzahl abgezogen

## 5. Frontend – CharacterActivationDialog

- [x] 5.1 Joker-Karten in der Hand erkennen (`isJoker: true`) und separat von normalen Handkarten behandeln
- [x] 5.2 Wert-Picker (1–8) für jede Joker-Karte in der Handkartenauswahl anzeigen
- [x] 5.3 Hinweis „kostet 1 Diamant" neben dem Wert-Picker anzeigen
- [x] 5.4 Joker-Karte erst nach Wertauswahl in `handSelections` aufnehmen (`abilityType: 'joker'`, `diamondsUsed: 1`)
- [x] 5.5 Joker-Karte deselektierbar machen (Wert-Button erneut klicken entfernt Auswahl)
- [x] 5.6 Diamant-Verfügbarkeit prüfen: Joker-Picker deaktivieren wenn `diamonds - reservedDiamonds < 1`

## 6. Frontend – Kartendarstellung

- [x] 6.1 In `gameRender.ts` / Canvas-Rendering: Joker-Karte mit Bild `PerlenkarteJoker.png` anzeigen (Hand, Perlenauslage)
- [x] 6.2 Sicherstellen, dass `PerlenkarteJoker.png` in der Preload-Liste (`imageLoaderV2.ts`) enthalten ist
