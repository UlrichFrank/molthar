## 1. computeNeededValues — Kernfunktion

- [ ] 1.1 `shared/src/game/botNeededValues.ts` anlegen mit Grundgerüst und Typsignatur
- [ ] 1.2 `number`-Kostentyp implementieren
- [ ] 1.3 `nTuple`-Kostentyp implementieren
- [ ] 1.4 `evenTuple`- und `oddTuple`-Kostentypen implementieren
- [ ] 1.5 `run`-Kostentyp implementieren (longest-overlap-Heuristik)
- [ ] 1.6 `sumAnyTuple`- und `sumTuple`-Kostentypen implementieren
- [ ] 1.7 `diamond`-Kostentyp: kein Beitrag (explizit überspringen)

## 2. Ability-Modifikationen

- [ ] 2.1 `onesCanBeEights`: 1 auf Hand → 8 aus needed entfernen; wenn 8 benötigt → auch 1 als nützlich markieren
- [ ] 2.2 `threesCanBeAny`: für jede 3 auf Hand einen Wert aus needed entfernen (Wildcard)
- [ ] 2.3 `decreaseWithPearl`: wenn Diamant vorhanden, für jeden Wert X in needed auch X+1 hinzufügen
- [ ] 2.4 `numberAdditionalCardActions` und `anyAdditionalCardActions`: virtuellen Wert bzw. Wildcard anrechnen

## 3. Export und Tests

- [ ] 3.1 `computeNeededValues` aus `shared/src/index.ts` exportieren
- [ ] 3.2 Unit-Tests für alle Kostentypen (number, nTuple, evenTuple, oddTuple, run, sum, diamond)
- [ ] 3.3 Unit-Tests für alle Ability-Modifikationen
- [ ] 3.4 Unit-Tests für Union über mehrere Portal-Karten

## 4. Neues Pearl-Entscheidungsmodell in Bots

- [ ] 4.1 Hilfsfunktion `pickPearlAction(G, playerID, strategy)` in `backend/src/bots/pearlDecision.ts` — kapselt die gesamte neue Logik
- [ ] 4.2 `GierBot` — Pearl-Entscheidung auf `pickPearlAction` umstellen
- [ ] 4.3 `EdelsteinBot` — Pearl-Entscheidung auf `pickPearlAction` umstellen
- [ ] 4.4 `WendelinBot` — Pearl-Entscheidung auf `pickPearlAction` umstellen
- [ ] 4.5 `RalfBot` — Pearl-Entscheidung auf `pickPearlAction` umstellen
- [ ] 4.6 `IrrnisBot` — Handlimit-Schutz integrieren (filtere nutzlose takePearlCard-Aktionen wenn Hand voll und alle Karten nützlich)

## 5. Integration Tests

- [ ] 5.1 Test für `pickPearlAction`: nützliche Perle vorhanden → wird gewählt
- [ ] 5.2 Test für `pickPearlAction`: keine nützliche Perle → replacePearlSlots
- [ ] 5.3 Test für `pickPearlAction`: Hand voll, alle nützlich → keine Perle nehmen
