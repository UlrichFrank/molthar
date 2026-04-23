## ADDED Requirements

### Requirement: Softmax-Utility-Modul
Das System SHALL ein Utility-Modul `backend/src/bots/softmax.ts` bereitstellen mit:
- `softmaxPick<T>(items: Array<{item: T, score: number}>, temperature: number): T` — wählt ein Element per Boltzmann-Verteilung
- `STRATEGY_TEMPERATURES: Record<NpcStrategy, number>` — Temperaturen pro Strategie
- Temperaturen: `random = Infinity` (Gleichverteilung), `greedy = 1.5`, `aggressive = 1.2`, `efficient = 0.8`, `diamond = 0.6`
- Score-Normalisierung (Shift auf Minimum=0) vor Softmax-Berechnung

#### Scenario: Softmax mit hoher Temperatur wählt diverser
- **WHEN** `softmaxPick` mit Temperatur 2.0 und Scores [10, 9, 1] aufgerufen wird
- **THEN** wird nicht immer Item mit Score 10 gewählt; alle Items haben messbare Auswahlwahrscheinlichkeit

#### Scenario: Softmax mit niedriger Temperatur wählt fast deterministisch
- **WHEN** `softmaxPick` mit Temperatur 0.1 und Scores [10, 1, 1] aufgerufen wird
- **THEN** wird Item mit Score 10 in >95% der Fälle gewählt

#### Scenario: Softmax mit negativen Scores funktioniert korrekt
- **WHEN** `softmaxPick` mit Scores [-3, -1, 2] aufgerufen wird
- **THEN** wird nach Score-Shift (min=0 → [0, 2, 5]) korrekt gewichtet ausgewählt

### Requirement: Softmax-Perlenauswahl
Das System SHALL in allen Bots (außer IrrnisBot) die Perlenauswahl per Softmax treffen statt deterministisch den höchsten Score zu wählen.

Das `shared`-Paket SHALL eine neue Funktion `scoredPearlSlots(G, playerID, strategy): Array<{slot: number, score: number}>` exportieren, die alle nicht-leeren Slots mit ihrem Score zurückgibt.

#### Scenario: Bot wählt Perle mit Softmax
- **WHEN** ein Bot (nicht IrrnisBot) eine Perle nehmen will und mehrere Slots Scores > 0 haben
- **THEN** wird nicht immer der Slot mit dem höchsten Score genommen; der beste Slot hat aber die höchste Auswahlwahrscheinlichkeit

#### Scenario: Nur ein Slot verfügbar
- **WHEN** nur ein nicht-leerer Perlenslot vorhanden ist
- **THEN** wird dieser Slot immer gewählt (kein Zufall nötig)

### Requirement: Softmax-Charakterkartenauswahl
Das System SHALL in allen Bots (außer IrrnisBot) bei der Wahl der aufzunehmenden Charakterkarte Softmax verwenden, gewichtet nach dem strategie-spezifischen Score der Karte (Punkte, Diamonds, Effort-Ratio je nach Bot).

#### Scenario: Bot wählt Charakterkarte mit Softmax
- **WHEN** mehrere Charakterkarten in der Auslage verfügbar sind und ein Bot eine nehmen will
- **THEN** wird nicht immer die nach Strategie-Kriterium beste Karte genommen; die beste Karte hat aber die höchste Wahrscheinlichkeit

### Requirement: Softmax-Aktivierungsauswahl
Das System SHALL in allen Bots (außer IrrnisBot) bei mehreren aktivierbaren Portalslots die Auswahl per Softmax treffen, gewichtet nach Punkten (ggf. modifiziert durch Timing-Multiplikator).

#### Scenario: Bot wählt unter mehreren aktivierbaren Karten per Softmax
- **WHEN** ein Bot zwei oder mehr aktivierbare Portalslots hat
- **THEN** wird nicht immer der Slot mit den meisten Punkten aktiviert; der punktestärkste Slot hat aber die höchste Auswahlwahrscheinlichkeit
