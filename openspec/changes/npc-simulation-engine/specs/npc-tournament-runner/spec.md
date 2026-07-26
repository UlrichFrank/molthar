## ADDED Requirements

### Requirement: Alle Strategie-Kombinationen automatisch berechnen
Der Tournament-Runner SHALL für eine gegebene Spieleranzahl P automatisch alle Strategie-Kombinationen (mit Wiederholung) erzeugen und je N Spiele pro Kombination ausführen.

#### Scenario: 2-Spieler-Turnier erzeugt alle Paare
- **WHEN** `runTournament({ numPlayers: 2, gamesPerMatchup: 100 })` aufgerufen wird
- **THEN** werden Spiele für alle 15 Paare ausgeführt (10 verschiedene + 5 Spiegel-Matchups), insgesamt 1500 Spiele

#### Scenario: 3-Spieler-Turnier erzeugt Dreier-Kombinationen
- **WHEN** `runTournament({ numPlayers: 3, gamesPerMatchup: 50 })` aufgerufen wird
- **THEN** werden alle Strategie-Dreier-Kombinationen (mit Wiederholung) ausgeführt, je 50 Spiele

### Requirement: Per-Spiel-Seeding aus Master-Seed
Der Tournament-Runner SHALL jeden Spiel-Seed als `"${masterSeed}:${gameIndex}"` ableiten, damit das gesamte Turnier mit einem einzigen Master-Seed reproduzierbar ist.

#### Scenario: Turnier ist mit Master-Seed reproduzierbar
- **WHEN** `runTournament({ ..., seed: 'tournament-42' })` zweimal aufgerufen wird
- **THEN** sind beide `TournamentResult`-Objekte identisch

#### Scenario: Zufälliger Master-Seed wenn keiner angegeben
- **WHEN** `runTournament` ohne `seed` aufgerufen wird
- **THEN** wird ein zufälliger Master-Seed generiert und im `TournamentResult.meta.seed` gespeichert

### Requirement: Aggregat-Statistiken berechnen
Der Tournament-Runner SHALL nach allen Spielen Statistiken aggregieren: Win-Rate, Durchschnittspunkte, Durchschnittsrang und Durchschnitts-Rundenzahl pro Strategie sowie Head-to-Head-Matrix für 2-Spieler-Turniere.

#### Scenario: Win-Rate-Berechnung
- **WHEN** ein 2P-Turnier abgeschlossen ist
- **THEN** enthält `stats.perStrategy[strategy].winRate` die Gewinnrate als Zahl zwischen 0 und 1, summiert über alle Spiele dieser Strategie

#### Scenario: Head-to-Head nur für 2 Spieler
- **WHEN** `numPlayers === 2`
- **THEN** enthält `stats.headToHead` eine Matrix mit Einträgen für jedes Strategie-Paar: `{ wins, total, winRate }`

#### Scenario: Kein Head-to-Head für >2 Spieler
- **WHEN** `numPlayers > 2`
- **THEN** ist `stats.headToHead` nicht vorhanden; stattdessen enthält `stats.perStrategy[s].avgRank` den durchschnittlichen Endrang

### Requirement: Abgebrochene Spiele ausschließen
Der Tournament-Runner SHALL Spiele mit `aborted: true` aus allen Statistiken ausschließen und deren Anzahl im Report als `meta.abortedGames` aufführen.

#### Scenario: Abgebrochene Spiele zählen nicht zur Gewinnrate
- **WHEN** einzelne Spiele den Safeguard auslösen
- **THEN** beeinflussen diese Spiele `winRate`, `avgScore` und `avgRounds` nicht
