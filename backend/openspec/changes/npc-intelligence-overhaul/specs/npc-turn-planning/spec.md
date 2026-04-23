## ADDED Requirements

### Requirement: BotClient speichert Turn-Plan
`BotClient` SHALL ein Feld `turnPlan: BotAction[]` haben, das zu Zugbeginn befüllt und dann Aktion für Aktion abgearbeitet wird.

#### Scenario: Plan wird zu Zugbeginn erstellt
- **WHEN** `G.actionCount === 0`
- **THEN** ruft der Bot-Runner `planTurn()` auf und speichert das Ergebnis in `bot.turnPlan`

#### Scenario: Plan wird Aktion für Aktion abgearbeitet
- **WHEN** `bot.turnPlan.length > 0`
- **THEN** wird die erste Aktion aus dem Plan entnommen und ausgeführt (shift)

#### Scenario: Plan wird neu berechnet bei Änderung
- **WHEN** `maxActions` sich erhöht hat (z.B. durch `threeExtraActions`) und der Plan erschöpft ist
- **THEN** wird `planTurn()` erneut aufgerufen um verbleibende Aktionen zu planen

#### Scenario: Ungültige Plan-Aktion wird übersprungen
- **WHEN** die nächste geplante Aktion ungültig ist (z.B. Karte wurde vom Gegner entfernt)
- **THEN** wird diese Aktion verworfen und `planTurn()` neu aufgerufen

### Requirement: planTurn berechnet optimale Aktionsreihenfolge
`planTurn(G, playerID, strategy)` SHALL eine geordnete Liste von `BotAction[]` zurückgeben, die `threeExtraActions` priorisiert und `changeHandActions` ans Ende stellt.

#### Scenario: threeExtraActions wird zuerst aktiviert
- **WHEN** eine `threeExtraActions`-Karte bezahlbar ist UND weitere Karten danach aktivierbar wären
- **THEN** erscheint die `threeExtraActions`-Aktivierung als erste Aktion im Plan

#### Scenario: changeHandActions als letzte Aktion
- **WHEN** eine `changeHandActions`-Karte im Portal ist und bezahlt werden kann
- **THEN** erscheint die Aktivierung als letzte geplante Aktion des Zuges

#### Scenario: Plan enthält keine Aktionen über maxActions hinaus
- **WHEN** `planTurn()` aufgerufen wird
- **THEN** enthält der Plan höchstens `G.maxActions - G.actionCount` Aktionen

#### Scenario: Plan für Endspiel priorisiert jede Aktivierung
- **WHEN** `G.finalRound === true`
- **THEN** enthält der Plan alle bezahlbaren Aktivierungen unabhängig von `effectiveCardValue`

### Requirement: Bestehende Smart Bots nutzen Turn-Plan
GierBot, WendelinBot, EdelsteinBot und RalfBot SHALL den Turn-Plan-Mechanismus verwenden statt der bisherigen stateless Entscheidungslogik.

#### Scenario: Bot folgt seinem Plan
- **WHEN** `bot.turnPlan` nicht leer ist
- **THEN** gibt der Bot die nächste Plan-Aktion zurück ohne erneute Evaluierung

#### Scenario: Bot plant neu wenn kein Plan vorhanden
- **WHEN** `bot.turnPlan` leer ist und keine pending Zustände vorliegen
- **THEN** ruft der Bot `planTurn()` auf
