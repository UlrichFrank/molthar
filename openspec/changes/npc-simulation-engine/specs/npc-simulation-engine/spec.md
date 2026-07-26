## ADDED Requirements

### Requirement: Einzelnes Spiel in-process simulieren
Die Engine SHALL ein vollständiges Spiel zwischen 2–5 NPC-Bots vollständig im Speicher ausführen, ohne Server, WebSocket oder Delays. Sie nutzt `CreateGameReducer` und `InitializeGame` aus `boardgame.io/core` sowie die bestehenden Bot-Strategie-Funktionen.

#### Scenario: Spiel mit zwei Strategien läuft durch
- **WHEN** `runGame({ strategies: ['greedy', 'diamond'], seed: 'test:0' })` aufgerufen wird
- **THEN** gibt die Funktion ein `GameResult` zurück mit `ranking` (nach Punkten sortiert), `rounds > 0`, `totalActions > 0` und `aborted: false`

#### Scenario: Spiel endet mit korrektem Gewinner
- **WHEN** ein Spiel simuliert wird und ein Spieler 12+ Punkte erreicht
- **THEN** enthält `GameResult.ranking[0]` den Spieler mit den höchsten Punkten

#### Scenario: Safeguard bricht Endlos-Spiele ab
- **WHEN** ein Spiel 10.000 Aktionen überschreitet ohne `gameover`
- **THEN** gibt `runGame` ein `GameResult` mit `aborted: true` zurück und wirft keinen Fehler

### Requirement: Deterministisches Seeding
Die Engine SHALL `Math.random` vor jedem Spiel mit `seedrandom` patchen, sodass identische Seed-Strings identische Spielverläufe produzieren.

#### Scenario: Gleicher Seed produziert identisches Ergebnis
- **WHEN** `runGame` zweimal mit identischer Konfiguration und identischem Seed aufgerufen wird
- **THEN** sind beide `GameResult`-Objekte identisch (gleiche Züge, gleicher Gewinner, gleiche Punkte)

#### Scenario: Verschiedene Seeds produzieren verschiedene Spiele
- **WHEN** `runGame` mit Seeds `"abc:0"` und `"abc:1"` aufgerufen wird
- **THEN** unterscheiden sich die Spielverläufe in mindestens einem Zug

### Requirement: Verbose-Spiellog
Im Verbose-Modus SHALL die Engine für jeden Zug einen Log-Eintrag aufzeichnen mit Spieler-ID, Strategie, Zugnamen, Argumenten und einem Snapshot des Spielerzustands.

#### Scenario: Log-Einträge im Verbose-Modus
- **WHEN** `runGame({ ..., verbose: true })` aufgerufen wird
- **THEN** enthält `GameResult.log` einen Eintrag pro ausgeführter Aktion mit den Feldern `turn`, `round`, `playerID`, `strategy`, `move`, `args` und `snapshot: { hand, powerPoints, diamonds }`

#### Scenario: Kein Log ohne Verbose
- **WHEN** `runGame({ ..., verbose: false })` aufgerufen wird
- **THEN** ist `GameResult.log` ein leeres Array
