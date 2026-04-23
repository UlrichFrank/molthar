## 1. Typen & Grundlagen

- [ ] 1.1 `NpcStrategy` in `shared/src/game/types.ts` um `'tempo'` und `'synergy'` erweitern
- [ ] 1.2 `BotAction`-Typ in `shared/src/game/types.ts` prüfen/ergänzen (für `turnPlan`)
- [ ] 1.3 `turnPlan: BotAction[]` Feld in `BotClient`-Interface/Klasse in `backend/src/bot-runner.ts` ergänzen

## 2. effectiveCardValue

- [ ] 2.1 Datei `shared/src/game/botCardValueEstimator.ts` anlegen mit `effectiveCardValue(card, G, playerID, strategy)` Funktion
- [ ] 2.2 `roundProgress = G.roundNumber / 10` berechnen und als Skalierungsfaktor für zeitabhängige Boni nutzen
- [ ] 2.3 Fähigkeitsboni implementieren gemäß Design-Tabelle (`threeExtraActions`, `oneExtraActionPerTurn`, `threesCanBeAny`, `anyAdditionalCardActions`, `numberAdditionalCardActions`, `changeHandActions`, `discardOpponentCharacter`, `onesCanBeEights`, `handLimitPlusOne`)
- [ ] 2.4 Synergiedetection für `synergy`-Strategie: Kombinationsbonus wenn passende Fähigkeiten bereits aktiv
- [ ] 2.5 Unit-Tests für `effectiveCardValue` in `shared/src/game/botCardValueEstimator.test.ts`
- [ ] 2.6 `effectiveCardValue` aus `shared/src/index.ts` exportieren

## 3. Turn-Planer

- [ ] 3.1 Datei `backend/src/bots/turnPlanner.ts` anlegen mit `planTurn(G, playerID, strategy): BotAction[]`
- [ ] 3.2 Aktivierbare Portal-Karten sammeln und nach `effectiveCardValue` sortieren (`threeExtraActions` immer zuerst)
- [ ] 3.3 Greedy-Simulation: Aktionen zählen, `threeExtraActions`-Effekt nach Aktivierung re-evaluieren
- [ ] 3.4 `changeHandActions` als letzte Aktion einplanen wenn Karte im Portal und bezahlbar
- [ ] 3.5 `finalRound`-Modus: alle bezahlbaren Aktivierungen ohne `effectiveCardValue`-Schwelle einplanen
- [ ] 3.6 Pearl- und Charakterkarten-Aktionen für verbleibende Aktionen hinzufügen
- [ ] 3.7 Plan-Validierung: vor Ausführung prüfen ob Karte noch im Portal (Gegner könnte `discardOpponentCharacter` genutzt haben)
- [ ] 3.8 Unit-Tests für `planTurn` mit mindestens: normaler Zug, `threeExtraActions`-Kette, Endspiel, ungültige Aktion

## 4. Turn-Plan-Integration in Bot-Runner

- [ ] 4.1 `bot-runner.ts`: bei `actionCount === 0` `planTurn()` aufrufen und in `bot.turnPlan` speichern
- [ ] 4.2 Nächste Aktion aus `bot.turnPlan` entnehmen (shift) statt stateless Entscheidung
- [ ] 4.3 Bei erschöpftem Plan und noch verfügbaren Aktionen `planTurn()` erneut aufrufen
- [ ] 4.4 Debug-Log: Plan zu Zugbeginn ausgeben (kurze Zusammenfassung der geplanten Aktionen)

## 5. Blind Draw & replacePearlSlots

- [ ] 5.1 `expectedBlindPearlScore(G, playerID, strategy)` in `botPearlScorer.ts` implementieren (Durchschnitt aller `scorePearlSlot(deck_card.value, ...)` über `pearlDeck`)
- [ ] 5.2 `expectedBlindCharValue(G, playerID, strategy)` implementieren: `effectiveCardValue(characterDeck.at(-1), ...)`; 0 wenn Deck leer
- [ ] 5.3 `bestPearlSlotByScore` erweitern: Blind-Draw (`-1`) als Option einbeziehen wenn `E[blind] > 1.1 × bestVisible`
- [ ] 5.4 `replacePearlSlots`-Aktion in Pearl-Entscheidung einbeziehen: wählen wenn alle Slots `< 0.3 × E[blind]`
- [ ] 5.5 `characterDeck.at(-1)` als Kandidat in Charakterkarten-Auswahl einbeziehen (blind vs. Display)
- [ ] 5.6 Unit-Tests für Blind-Draw-Logik: leeres Deck, günstiger Blind-Draw, keine Aktion bei guter sichtbarer Option

## 6. Portal-Tausch

- [ ] 6.1 Portal-Tausch-Logik in `turnPlanner.ts` oder eigenem Helper: `effectiveCardValue` der besten Display-Karte vs. schlechtester Portal-Karte vergleichen
- [ ] 6.2 Schwellwerte je Strategie: default 1.4×, tempo 1.2×, efficient 1.6×, synergy 1.8×
- [ ] 6.3 `characterDeck.at(-1)` als Blind-Tausch-Kandidat berücksichtigen (`takeCharacterCard(-1, portalSlot)`)
- [ ] 6.4 Endspiel-Modus: Schwelle auf 1.0× senken (tauscht immer wenn Display besser)
- [ ] 6.5 Portal-Tausch in bestehende Bots integrieren (GierBot, WendelinBot, EdelsteinBot, RalfBot)

## 7. Endspiel-Reaktion

- [ ] 7.1 `isEndgame(G, playerID)` Helper: `G.finalRound === true || max(opponent.powerPoints) >= 8`
- [ ] 7.2 Endspiel-Flags in `planTurn()` und Pearl-Scoring übergeben
- [ ] 7.3 Pearl-Urgency in Endspiel verdoppeln (Faktor im Scorer)

## 8. Flinker Fritz (Tempo-Bot)

- [ ] 8.1 Datei `backend/src/bots/FlinkBot.ts` anlegen mit `strategy: 'tempo'`
- [ ] 8.2 `effectiveCardValue` mit erhöhten Boni: `threeExtraActions` +6, `oneExtraActionPerTurn` +5
- [ ] 8.3 Karten mit `estimateEffort ≤ 1` bevorzugen (Scoring-Bonus in Kartenauswahl)
- [ ] 8.4 Blind-Draw-Schwelle auf 1.05× (aggressiver als Standard-1.1×)
- [ ] 8.5 Portal-Tausch-Schwelle 1.2×
- [ ] 8.6 `turnPlan`-Integration: `threeExtraActions` explizit als erste Aktion priorisieren
- [ ] 8.7 FlinkBot in Bot-Factory registrieren: `createBot('tempo')` → `FlinkBot`-Instanz

## 9. Kluge Karla (Synergy-Bot)

- [ ] 9.1 Datei `backend/src/bots/KarlaBot.ts` anlegen mit `strategy: 'synergy'`
- [ ] 9.2 Synergie-Detection: `threesCanBeAny + anyAdditionalCardActions` = +4 Bonus auf zweite Karte
- [ ] 9.3 Synergie-Detection: `handLimitPlusOne + changeHandActions` = +3 Bonus
- [ ] 9.4 Frühphasen-Präferenz: blaue (persistente) Fähigkeitskarten früh im Spiel bevorzugen (Bonus bei `roundProgress < 0.4`)
- [ ] 9.5 Portal-Tausch-Schwelle 1.8× (konservativ)
- [ ] 9.6 KarlaBot in Bot-Factory registrieren: `createBot('synergy')` → `KarlaBot`-Instanz

## 10. Bestehende Bots aktualisieren

- [ ] 10.1 GierBot: `effectiveCardValue` statt `card.powerPoints` für Charakterkartenauswahl und Portal-Tausch
- [ ] 10.2 WendelinBot: `effectiveCardValue` integrieren, `turnPlan` nutzen
- [ ] 10.3 EdelsteinBot: `effectiveCardValue` integrieren, `turnPlan` nutzen
- [ ] 10.4 RalfBot: `effectiveCardValue` integrieren, `turnPlan` nutzen
- [ ] 10.5 Alle Smart-Bots: `expectedBlindCharValue` in Charakterkartenentscheidung einbeziehen

## 11. Exports & Integration

- [ ] 11.1 `expectedBlindPearlScore`, `expectedBlindCharValue` aus `shared/src/index.ts` exportieren
- [ ] 11.2 `isEndgame` Helper exportieren oder lokal im bot-runner verwenden
- [ ] 11.3 Bot-Registry in `backend/src/bot-runner.ts` um `'tempo'` und `'synergy'` erweitern
- [ ] 11.4 Bot-Namen in Spielerkonfiguration ergänzen: „Flinker Fritz" und „Kluge Karla"

## 12. Tests & Qualitätssicherung

- [ ] 12.1 `pnpm test --run` im shared-Package: alle bestehenden Tests grün
- [ ] 12.2 Integrations-Smoke-Test: Spiel mit allen 6 Bot-Typen simulieren (kein Absturz, alle Züge gültig)
- [ ] 12.3 TypeScript type-check: `cd shared && pnpm run type-check` fehlerfrei
- [ ] 12.4 TypeScript type-check: `cd backend && pnpm lint` fehlerfrei
