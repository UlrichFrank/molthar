## TIER 0: Foundation

- [x] 0.1 CharacterAbility-Typsystem in `shared/src/game/types.ts` auf alle 18 Fähigkeitstypen erweitern
- [x] 0.2 Feld `PlayerState.activeAbilities: CharacterAbility[]` hinzufügen (Standard: `[]`)
- [x] 0.3 Feld `GameState.nextPlayerExtraAction: boolean` hinzufügen (Standard: `false`)
- [x] 0.4 Feld `GameState.lastPlayedPearlId: string | null` hinzufügen (Standard: `null`)
- [x] 0.5 `turn.onBegin`-Hook in der PortaleVonMolthar-Spielspezifikation hinzufügen: wenn `nextPlayerExtraAction` → `G.maxActions += 1`, Flag löschen
- [x] 0.6 `turn.onEnd`-Hook hinzufügen: `G.maxActions` auf berechnete Basis zurücksetzen (3 + Anzahl `oneExtraActionPerTurn` in `activeAbilities`)
- [x] 0.7 Hilfsfunktion `applyRedAbility(G, ctx, ability)` hinzufügen – reine Funktion, die G via switch auf `ability.type` mutiert
- [x] 0.8 Hilfsfunktion `applyBlueAbility(player, ability)` hinzufügen – fügt zu `player.activeAbilities` hinzu
- [x] 0.9 Testsuite für Typen und State-Initialisierung anlegen (`abilities.test.ts`)
- [x] 0.10 TypeScript-Kompilierung prüfen (kein Fehler)

## TIER 1: Rote Fähigkeiten (threeExtraActions, nextPlayerOneExtraAction, discard, steal, takeBack)

- [x] 1.1 `threeExtraActions` in `applyRedAbility` implementieren: `G.maxActions += 3`
- [x] 1.2 Test: Nach Aktivierung einer `threeExtraActions`-Karte erhöht sich `G.maxActions` um 3 im selben Zug
- [x] 1.3 Test: `turn.onEnd` setzt `G.maxActions` nach einem Zug mit `threeExtraActions` auf Basis (3) zurück
- [x] 1.4 `nextPlayerOneExtraAction` in `applyRedAbility` implementieren: `G.nextPlayerExtraAction = true`
- [x] 1.5 Test: `turn.onBegin`-Hook erhöht `G.maxActions` um 1, wenn das `nextPlayerExtraAction`-Flag gesetzt ist
- [x] 1.6 Test: Flag wird nach `onBegin` gelöscht und nicht in Folgeturniere übertragen
- [x] 1.7 `discardOpponentCharacter` implementieren: eine Portal-Karte des Gegners entfernen (Move-Validierung enthalten)
- [x] 1.8 Test: `discardOpponentCharacter` entfernt genau eine Karte vom Portal des Gegners
- [x] 1.9 `stealOpponentHandCard` implementieren: zufällige Handkarte vom Gegner auf die eigene Hand übertragen
- [x] 1.10 Test: `stealOpponentHandCard` überträgt eine Karte korrekt zwischen den Spielern
- [x] 1.11 `takeBackPlayedPearl` implementieren: zuletzt gespielte Perlenkarte vom Ablagestapel auf die Hand des Spielers legen
- [x] 1.12 `lastPlayedPearlId` im Spielzustand verfolgen (aktualisieren, wenn eine Perlenkarte gespielt wird)
- [x] 1.13 Test: `takeBackPlayedPearl` holt die korrekte Perle zurück, oder kein Effekt wenn keine verfügbar
- [x] 1.14 Integrationstest: Charakter mit roter Fähigkeit aktivieren, G-State spiegelt Effekt wider (nicht Move-Rückgabewert)
- [x] 1.15 Integrationstest: Alle 5 roten Fähigkeiten werden via `applyRedAbility` ausgeführt und stören sich nicht gegenseitig

## TIER 2: Blaue Wildcards (onesCanBeEights, threesCanBeAny, decreaseWithPearl)

- [ ] 2.1 `costCalculation.validateCostPayment` auf optionalen `abilityModifiers`-Parameter refaktorieren
- [ ] 2.2 Wildcard-Substitutionslogik hinzufügen: `onesCanBeEights` (1 wird bei Validierung als 8 behandelt)
- [ ] 2.3 Wildcard-Substitutionslogik hinzufügen: `threesCanBeAny` (3 wird als beliebiger Wert 1–8 behandelt)
- [ ] 2.4 Test: Kostenvalidierung mit `onesCanBeEights`: eine einzelne 1 erfüllt eine 8er-Anforderung
- [ ] 2.5 Test: Kostenvalidierung mit `threesCanBeAny`: eine einzelne 3 erfüllt eine beliebige Einzelwert-Anforderung
- [ ] 2.6 Test: Kostenvalidierung mit beiden Wildcards: kombinierte Permutationen funktionieren korrekt
- [ ] 2.7 `decreaseWithPearl`-Logik hinzufügen: Diamant kann den Perlenwert um 1 reduzieren
- [ ] 2.8 Einschränkungen erzwingen: nur 1 Diamant pro Perlenkarte, Mindestwert ist 1
- [ ] 2.9 Test: `decreaseWithPearl`: 7 + Diamant = 6 gilt, 1 + Diamant wird abgelehnt
- [ ] 2.10 Test: `decreaseWithPearl` in Kombination mit Wildcard: Modifier-Stapelung in einer Kostenprüfung
- [ ] 2.11 Prüfen, dass bestehende `costCalculation`-Tests weiterhin bestehen (keine Regression durch neue Parameter)
- [ ] 2.12 `activateCharacter`-Move aktualisieren: `activeAbilities` sammeln und an `validateCostPayment` übergeben
- [ ] 2.13 Integrationstest: Charakter mit Wildcard-Fähigkeit aktivieren, Kostenvalidierung nutzt Modifier

## TIER 3: Blaue Aktions-Modulation (oneExtraActionPerTurn)

- [x] 3.1 `applyBlueAbility` für `oneExtraActionPerTurn` implementieren: zu `player.activeAbilities` hinzufügen
- [x] 3.2 `turn.onEnd` erweitern: `G.maxActions`-Basis berechnen = 3 + Anzahl(`oneExtraActionPerTurn` in `activeAbilities`)
- [x] 3.3 Test: `oneExtraActionPerTurn` aktivieren, `turn.onEnd` setzt `G.maxActions` = 4 für Folgeturniere
- [x] 3.4 Test: Zwei `oneExtraActionPerTurn`-Fähigkeiten stapeln sich → `G.maxActions` = 5
- [x] 3.5 Prüfen, dass `handLimitPlusOne` weiterhin funktioniert — verwendet bereits `handLimitModifier` in `PlayerState`

## TIER 4: Blaue Hand-/Portal-Aktionen (changeCharacterActions, changeHandActions)

- [ ] 4.1 Move `swapPortalCharacter` zur `PortaleVonMolthar.moves` hinzufügen (neuer boardgame.io-Move)
- [ ] 4.2 Guard: `swapPortalCharacter` gibt `INVALID_MOVE` zurück, wenn `G.actionCount > 0` (nicht vor der ersten Aktion)
- [ ] 4.3 Guard: `swapPortalCharacter` gibt `INVALID_MOVE` zurück, wenn Spieler keine `changeCharacterActions`-Fähigkeit hat
- [ ] 4.4 Test: `swapPortalCharacter` funktioniert mit `actionCount === 0`, wird bei `actionCount > 0` abgelehnt
- [ ] 4.5 Move `rehandCards` zur `PortaleVonMolthar.moves` hinzufügen (neuer boardgame.io-Move)
- [ ] 4.6 Guard: `rehandCards` gibt `INVALID_MOVE` zurück, wenn `G.actionCount < G.maxActions` (nicht nach der letzten Aktion)
- [ ] 4.7 Guard: `rehandCards` gibt `INVALID_MOVE` zurück, wenn Spieler keine `changeHandActions`-Fähigkeit hat
- [ ] 4.8 Test: `rehandCards` funktioniert nur nach der letzten Aktion, zieht gleich viele Karten wie abgelegt

## TIER 5: Blaue Information & Ressourcen (previewCharacter, tradeTwoForDiamond)

- [ ] 5.1 Move `peekCharacterDeck` zur `PortaleVonMolthar.moves` hinzufügen
- [ ] 5.2 Guard: `peekCharacterDeck` gibt `INVALID_MOVE` zurück, wenn `G.actionCount > 0` oder Spieler keine `previewCharacter`-Fähigkeit hat
- [ ] 5.3 boardgame.io Secret State: eingesehene Karte in `G.players[id].peekedCard` speichern (geheim für Gegner via `playerView`)
- [ ] 5.4 Test: `peekCharacterDeck` zeigt die oberste Karte dem Spieler, nicht sichtbar in der Gegner-Ansicht
- [ ] 5.5 Move `tradeForDiamond` zur `PortaleVonMolthar.moves` hinzufügen
- [ ] 5.6 Guard: `tradeForDiamond` gibt `INVALID_MOVE` zurück, wenn Spieler keine 2-Perle oder keine `tradeTwoForDiamond`-Fähigkeit hat
- [ ] 5.7 Test: `tradeForDiamond` entfernt eine 2-Perle aus der Hand, fügt 1 Diamant zu `G.players[id].diamonds` hinzu
- [ ] 5.8 Test: Tausch kann mehrfach ausgeführt werden, wenn mehrere 2-Perlen auf der Hand sind

## TIER 6: Kartenspezifisch – Aufgedruckte Perlenwerte mit manueller Auswahl (numberAdditionalCardActions, anyAdditionalCardActions)

- [ ] 6.1 Feld `printedPearls: PrintedPearlValue[]` zu `CharacterCard` hinzufügen (Wert oder Wildcard `?`)
- [ ] 6.2 `cardDatabase.ts` aktualisieren: aufgedruckte Perlenwerte aus Kartendaten parsen
- [ ] 6.3 Typdefinition `PrintedPearlValue` anlegen: `{ value: number } | { wildcard: true }`
- [ ] 6.4 `activateCharacter`-Move erweitern: optionalen Parameter `selectedPrintedPearls: PrintedPearlValue[]` aufnehmen
- [ ] 6.5 Validierung im Move: gegebene `selectedPrintedPearls` müssen eine Teilmenge der gedruckten Perlen der aktivierten Karte sein
- [ ] 6.6 `validateCostPayment` erweitern: `selectedPrintedPearls` in `abilityModifiers` übergeben und bei der Kostenerfüllung berücksichtigen
- [ ] 6.7 Logik: Handkarten + gewählte gedruckte Perlen = kombinierter Pool für Kostenvalidierung; gedruckte Perlen verbrauchen keine Handkarte
- [ ] 6.8 Wildcard-Belegung (`?`) für gedruckte Wildcards serverseitig automatisch ermitteln, sofern eine gültige Kombination existiert
- [ ] 6.9 Test: Kostenvalidierung mit aufgedruckter Perle: Handwert 4 + gedruckter Wert 5 erfüllt eine 9er-Anforderung
- [ ] 6.10 Test: Kostenvalidierung mit aufgedruckter Wildcard: `?`-Perle kann jeden fehlenden Wert ersetzen
- [ ] 6.11 Test: Aufgedruckte Perlen verbrauchen keine Handkarte (nur tatsächlich gespielte Handkarten kommen auf Ablagestapel)
- [ ] 6.12 Test: Spieler sendet leeres `selectedPrintedPearls` → kein Fehler, Validierung ignoriert gedruckte Perlen
- [ ] 6.13 Test: Spieler sendet ungültige Auswahl (Wert nicht auf Karte vorhanden) → `INVALID_MOVE`
- [ ] 6.14 Integrationstest: Charakter mit aufgedruckter Perle aktivieren, Kostenvalidierung berücksichtigt manuelle Auswahl

## TIER 7: Sonder-/Komplex (irrlicht)

- [ ] 7.1 irrlicht-Karte(n) in der Kartendatenbank identifizieren
- [ ] 7.2 Flag „geteilte Aktivierung" zu `CharacterCard`-Typ hinzufügen
- [ ] 7.3 Geteilte Aktivierungslogik implementieren: Nachbarn des irrlicht-Besitzers können es aktivieren
- [ ] 7.4 Verfolgen, welcher Spieler irrlicht aktiviert hat (für Siegpunkte-Zuweisung)
- [ ] 7.5 Move `activateSharedCharacter` zur `PortaleVonMolthar.moves` hinzufügen (aufrufbar von nicht aktiven Spielern via boardgame.io)
- [ ] 7.6 Test: Drei-Spieler-Spiel – alle drei können irrlicht aktivieren, wenn es auf dem Portal eines Spielers liegt
- [ ] 7.7 Test: Siegpunkte gehen an den richtigen Spieler (denjenigen, der aktiviert hat)

## TIER 8: Integration & Validierung

- [ ] 8.1 Vollständige Spielsimulation: 5-Zug-Spiel mit mehreren aktiven Fähigkeiten spielen
- [ ] 8.2 Prüfen, dass keine Fähigkeits-Nebeneffekte zwischen Spielern durchsickern
- [ ] 8.3 Prüfen, dass Fähigkeitseffekte korrekt über mehrere Züge persistieren
- [ ] 8.4 TypeScript-Prüfung: `cd shared && pnpm run type-check` schlägt nicht fehl
- [ ] 8.5 Testsuite: `cd shared && pnpm test -- --run` alle Tests bestehen
- [ ] 8.6 Manueller Test: boardgame.io-Spiel mit allen Fähigkeitstypen starten und UI-Feedback prüfen
- [ ] 8.7 Code-Review: Fähigkeitslogik ist in `costCalculation.ts` und Move-Handlern isoliert
- [ ] 8.8 Dokumentation: Fähigkeits-Referenz zu `CLAUDE.md` hinzufügen mit Beispiel für jedes Tier
