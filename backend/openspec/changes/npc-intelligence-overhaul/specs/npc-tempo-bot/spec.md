## ADDED Requirements

### Requirement: Flinker Fritz ist ein neuer NPC mit Tempo-Strategie
Das System SHALL einen neuen Bot „Flinker Fritz" mit der Strategie `'tempo'` bereitstellen, der auf schnelle Aktivierungsketten und Action-Fähigkeiten spezialisiert ist.

#### Scenario: Flinker Fritz bevorzugt günstige Karten
- **WHEN** zwei Karten zur Auswahl stehen mit ähnlichen Punkten aber unterschiedlichem Effort
- **THEN** wählt Flinker Fritz die Karte mit niedrigerem `estimateEffort`

#### Scenario: threeExtraActions und oneExtraActionPerTurn werden extrem hoch bewertet
- **WHEN** eine Karte `threeExtraActions` oder `oneExtraActionPerTurn` hat
- **THEN** ist der `effectiveCardValue`-Bonus mindestens +5 (höchster aller Strategien)

#### Scenario: Flinker Fritz plant Aktivierungsketten
- **WHEN** in einem Zug mehrere Karten aktivierbar sind
- **THEN** priorisiert der Turnplan `threeExtraActions` zuerst um weitere Ketten zu ermöglichen

#### Scenario: Flinker Fritz tauscht Portal aggressiv
- **WHEN** eine Display-Karte einen 1.2× höheren `effectiveCardValue` hat als die schlechteste Portal-Karte
- **THEN** tauscht Flinker Fritz sofort

#### Scenario: Flinker Fritz zieht häufiger blind
- **WHEN** `expectedBlindPearlScore() > 1.05 × bestVisibleSlotScore`
- **THEN** zieht Flinker Fritz blind (niedrigere Schwelle als andere Bots)

### Requirement: Flinker Fritz ist in der Bot-Registry registriert
Der Bot SHALL über `createBot('tempo')` instanziierbar sein und unter dem Namen „Flinker Fritz" in Spielen auftauchen.

#### Scenario: Bot-Factory erzeugt Tempo-Bot
- **WHEN** `createBot('tempo')` aufgerufen wird
- **THEN** wird eine `FlinkBot`-Instanz zurückgegeben
