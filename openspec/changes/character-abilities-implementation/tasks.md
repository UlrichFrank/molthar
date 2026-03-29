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

## TIER 2: Virtuelle Bezahlkarten (Frontend-Auswahl & Backend-Validierung)

- [x] 2.1 Neues `PaymentSelection`-Interface in `types.ts` definieren (`source`, `value`, `handCardIndex`, `abilityType`, `diamondsUsed`)
- [x] 2.2 `activatePortalCard`-Move so umbauen, dass er Parameter `selections: PaymentSelection[]` statt `selectedCardIndices` akzeptiert
- [x] 2.3 Backend-Verifizierung: Prüfen, ob für jede `PaymentSelection` die echten Voraussetzungen (Handkarten existieren, Diamanten vorhanden, Fähigkeiten aktiv) erfüllt sind
- [x] 2.4 Backend-Mapping: Die validierten `PaymentSelection`s in virtuelle `PearlCard`-Strukturen umwandeln und an die *unveränderte* `validateCostPayment` weiterleiten
- [x] 2.5 Die Entfernungs-Logik aktualisieren, sodass die tatsächlich konsumierten originären Handkarten und Diamanten sicher entfernt werden
- [x] 2.6 Unit Tests: Testen der Backend-Validierung (Missbrauchsprävention) von illegalen `selections` (z.B. Diamant eingesetzt ohne Diamant-Besitz)
- [x] 2.7 Frontend (CharacterActivationDialog): Spieler listet seine echten Handkarten + einsetzbare aktivierte Perlen-Fähigkeiten auf und formt daraus die `PaymentSelection`s
- [x] 2.8 Integrationstest: Erfolgreiche `activatePortalCard`-Ausführung mit modifizierten/virtuellen Perlen

## TIER 3: Blaue Aktions-Modulation (oneExtraActionPerTurn)

- [x] 3.1 `applyBlueAbility` für `oneExtraActionPerTurn` implementieren: zu `player.activeAbilities` hinzufügen
- [x] 3.2 `turn.onEnd` erweitern: `G.maxActions`-Basis berechnen = 3 + Anzahl(`oneExtraActionPerTurn` in `activeAbilities`)
- [x] 3.3 Test: `oneExtraActionPerTurn` aktivieren, `turn.onEnd` setzt `G.maxActions` = 4 für Folgeturniere
- [x] 3.4 Test: Zwei `oneExtraActionPerTurn`-Fähigkeiten stapeln sich → `G.maxActions` = 5
- [x] 3.5 Prüfen, dass `handLimitPlusOne` weiterhin funktioniert — verwendet bereits `handLimitModifier` in `PlayerState`

## TIER 4: Blaue Hand-/Portal-Aktionen (changeCharacterActions, changeHandActions)

- [x] 4.1 Move `swapPortalCharacter` zur `PortaleVonMolthar.moves` hinzufügen (neuer boardgame.io-Move)
- [x] 4.2 Guard: `swapPortalCharacter` gibt `INVALID_MOVE` zurück, wenn `G.actionCount > 0` (nicht vor der ersten Aktion)
- [x] 4.3 Guard: `swapPortalCharacter` gibt `INVALID_MOVE` zurück, wenn Spieler keine `changeCharacterActions`-Fähigkeit hat
- [x] 4.4 Test: `swapPortalCharacter` funktioniert mit `actionCount === 0`, wird bei `actionCount > 0` abgelehnt
- [x] 4.5 Move `rehandCards` zur `PortaleVonMolthar.moves` hinzufügen (neuer boardgame.io-Move)
- [x] 4.6 Guard: `rehandCards` gibt `INVALID_MOVE` zurück, wenn `G.actionCount < G.maxActions` (nicht nach der letzten Aktion)
- [x] 4.7 Guard: `rehandCards` gibt `INVALID_MOVE` zurück, wenn Spieler keine `changeHandActions`-Fähigkeit hat
- [x] 4.8 Test: `rehandCards` funktioniert nur nach der letzten Aktion, zieht gleich viele Karten wie abgelegt

## TIER 5: Blaue Information & Ressourcen (previewCharacter, tradeTwoForDiamond)

- [x] 5.1 Move `peekCharacterDeck` zur `PortaleVonMolthar.moves` hinzufügen
- [x] 5.2 Guard: `peekCharacterDeck` gibt `INVALID_MOVE` zurück, wenn `G.actionCount > 0` oder Spieler keine `previewCharacter`-Fähigkeit hat
- [x] 5.3 boardgame.io Secret State: eingesehene Karte in `G.players[id].peekedCard` speichern (geheim für Gegner via `playerView`)
- [x] 5.4 Test: `peekCharacterDeck` zeigt die oberste Karte dem Spieler, nicht sichtbar in der Gegner-Ansicht
- [x] 5.5 Move `tradeForDiamond` zur `PortaleVonMolthar.moves` hinzufügen
- [x] 5.6 Guard: `tradeForDiamond` gibt `INVALID_MOVE` zurück, wenn Spieler keine 2-Perle oder keine `tradeTwoForDiamond`-Fähigkeit hat
- [x] 5.7 Test: `tradeForDiamond` entfernt eine 2-Perle aus der Hand, fügt 1 Diamant zu `G.players[id].diamonds` hinzu
- [x] 5.8 Test: Tausch kann mehrfach ausgeführt werden, wenn mehrere 2-Perlen auf der Hand sind

## TIER 6: Kartenspezifisch – Aufgedruckte Perlenwerte mit manueller Auswahl (numberAdditionalCardActions, anyAdditionalCardActions)

- [x] 6.1 Backend: Validierungslogik für `PaymentSelection` (`source === 'ability'`) in `activatePortalCard` hinzufügen, die prüft, ob der Spieler eine aktive Charakterkarte mit `numberAdditionalCardActions` oder `anyAdditionalCardActions` besitzt.
- [x] 6.2 Backend: Sicherstellen, dass diese virtuellen Bonuskarten nicht vom Handkartenstapel entfernt werden, sondern nur als einmalige temporäre Zahlhilfen bei `consumeCosts` dienen.
- [x] 6.3 Test: Backend erlaubt Kostenvalidierung durch Kombination aus z.B. Handwert 4 + `PaymentSelection` für gedruckten Wert 5 aus Charakterfähigkeit.
- [x] 6.4 Test: Backend erlaubt Kostenvalidierung mit `PaymentSelection` (source: 'ability') für gedruckte `?`-Wildcards, sofern die Fähigkeit `anyAdditionalCardActions` aktiv ist.
- [x] 6.5 Test: Backend blockiert illegale `PaymentSelection`s (z.B. beanspruchte Bonuskarte, obwohl der Charakter nicht aktiv ist).
- [x] 6.6 Frontend (CharacterActivationDialog): Das Dialog-UI listet neben den Handkarten auch die aufgedruckten Perlen der aktivierten Charaktere auf und erlaubt ihre Aufnahme in die Bezahl-Selektion.

## TIER 7: Sonder-/Komplex (irrlicht)

- [x] 7.1 irrlicht-Karte(n) in der Kartendatenbank identifizieren
- [x] 7.2 Flag „geteilte Aktivierung" zu `CharacterCard`-Typ hinzufügen
- [x] 7.3 Geteilte Aktivierungslogik implementieren: Nachbarn des irrlicht-Besitzers können es aktivieren
- [x] 7.4 Verfolgen, welcher Spieler irrlicht aktiviert hat (für Siegpunkte-Zuweisung)
- [x] 7.5 Move `activateSharedCharacter` zur `PortaleVonMolthar.moves` hinzufügen (aufrufbar von nicht aktiven Spielern via boardgame.io)
- [x] 7.6 Test: Drei-Spieler-Spiel – alle drei können irrlicht aktivieren, wenn es auf dem Portal eines Spielers liegt
- [x] 7.7 Test: Siegpunkte gehen an den richtigen Spieler (denjenigen, der aktiviert hat)

## TIER 8: Integration & Validierung

- [x] 8.1 Vollständige Spielsimulation: 5-Zug-Spiel mit mehreren aktiven Fähigkeiten spielen
- [x] 8.2 Prüfen, dass keine Fähigkeits-Nebeneffekte zwischen Spielern durchsickern
- [x] 8.3 Prüfen, dass Fähigkeitseffekte korrekt über mehrere Züge persistieren
- [x] 8.4 TypeScript-Prüfung: `cd shared && pnpm run type-check` schlägt nicht fehl
- [x] 8.5 Testsuite: `cd shared && pnpm test -- --run` alle Tests bestehen
- [ ] 8.6 Manueller Test: boardgame.io-Spiel mit allen Fähigkeitstypen starten und UI-Feedback prüfen
- [x] 8.7 Code-Review: Fähigkeitslogik ist in `costCalculation.ts` und Move-Handlern isoliert
- [x] 8.8 Dokumentation: Fähigkeits-Referenz zu `CLAUDE.md` hinzufügen mit Beispiel für jedes Tier

## TIER 9: CharacterActivationDialog – Datenladen & UI-Redesign

### 9.1 Datenladen: `printedPearls` in `mapRawCard` befüllen

- [ ] 9.1 `mapRawCard` in `cardDatabase.ts`: Wenn `ability.type === 'numberAdditionalCardActions'`, setze `card.printedPearls = [{ value: raw.ability.value }]`. Wenn `ability.type === 'anyAdditionalCardActions'`, setze `card.printedPearls = [{ wildcard: true }]`. Für alle anderen Typen: `printedPearls` weglassen.

### 9.2 Dialog-Grundstruktur: Zwei Sektionen

- [ ] 9.2 Dialog in zwei klare Sektionen aufteilen: „Handkarten" (bestehend, bereinigt) und „Fähigkeiten" (neu). Die Fähigkeiten-Sektion erscheint nur, wenn mindestens eine bezahl-relevante Fähigkeit aktiv ist (`onesCanBeEights`, `threesCanBeAny`, `decreaseWithPearl`, `numberAdditionalCardActions`, `anyAdditionalCardActions`). Jede Fähigkeitskarte zeigt ihr Kartenbild (`activatedCharacters[].card.imageName`) plus Typ-spezifische Interaktionselemente.

### 9.3 `onesCanBeEights` – Badge auf ausgewählter 1er-Handkarte

- [ ] 9.3 Wenn Peter Pan (`onesCanBeEights`) aktiv ist und eine Handkarte mit Wert `1` ausgewählt wird: Badge „1→8" direkt unterhalb der Karte anzeigen. Badge ist klickbar: an = Karte zählt als 8, aus = Karte zählt als 1. Standard: an (automatisch aktiviert bei Auswahl der 1).

### 9.4 `threesCanBeAny` – Wertauswahl unterhalb ausgewählter 3er-Handkarte

- [ ] 9.4 Wenn Feuerteufel (`threesCanBeAny`) aktiv ist und eine Handkarte mit Wert `3` ausgewählt wird: Kompakte Wertauswahl [1][2][3][4][5][6][7][8] direkt unterhalb der Karte einblenden. Standardwert: `3` (unverändert). Gewählter Wert hebt sich visuell hervor.

### 9.5 `decreaseWithPearl` – Badge unterhalb ausgewählter Handkarten

- [ ] 9.5 Wenn Red Sonja (`decreaseWithPearl`) aktiv ist: Unterhalb jeder ausgewählten Handkarte mit Wert > 1 einen Badge „−1 💎" anzeigen. Klick auf Badge reserviert 1 Diamant und reduziert den Kartenwert um 1. Zweiter Klick hebt die Reservierung auf. Badge ist ausgegraut, wenn keine Diamanten mehr verfügbar.

### 9.6 `numberAdditionalCardActions` – Kartenbild + „+N hinzufügen"-Button

- [ ] 9.6 In der Fähigkeiten-Sektion: Für jede aktivierte Karte mit `numberAdditionalCardActions`: Kartenbild anzeigen (klein, z. B. `max-h-[80px]`), darunter Button „+{N} hinzufügen" (N aus `printedPearls[0].value`). Klick fügt die Perle zur `abilitySelections` hinzu; Button wird zu „✕ Entfernen". Pro Karte maximal eine Nutzung.

### 9.7 `anyAdditionalCardActions` – Kartenbild + Wertauswahl [+1]…[+8]

- [ ] 9.7 In der Fähigkeiten-Sektion: Für jede aktivierte Karte mit `anyAdditionalCardActions` (Weißer Drache): Kartenbild anzeigen, darunter Wertauswahl [+1][+2]…[+8]. Klick wählt Wert und fügt ihn zu `abilitySelections` hinzu; ausgewählter Wert zeigt „✕". Pro Karte maximal eine Nutzung.

### 9.8 Tests & Qualität

- [ ] 9.8 `cd shared && pnpm run type-check` schlägt nicht fehl (inkl. geänderter `mapRawCard`)
- [ ] 9.9 `cd shared && pnpm test -- --run` alle Tests bestehen (insbesondere TIER 6 Tests, die `printedPearls` voraussetzen)
