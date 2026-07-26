## ADDED Requirements

### Requirement: JSON-Report schreiben
Der Reporter SHALL ein strukturiertes JSON-File mit Turnier-Metadaten, Spielergebnissen und Aggregat-Statistiken in das Output-Verzeichnis schreiben.

#### Scenario: JSON-Datei wird erzeugt
- **WHEN** `generateReport({ result, outputDir, verbose: false })` aufgerufen wird
- **THEN** existiert eine Datei `report_<P>p_<N>g_<DATUM>.json` im Output-Verzeichnis

#### Scenario: JSON-Struktur enthält alle Pflichtfelder
- **WHEN** der JSON-Report geöffnet wird
- **THEN** enthält er die Felder `meta` (date, seed, numPlayers, numGames, durationMs, abortedGames), `games[]` (je gameId, strategies, rounds, totalActions, ranking) und `stats` (perStrategy, avgGameLength, optional headToHead)

#### Scenario: Kein Spiellog ohne Verbose
- **WHEN** `verbose: false`
- **THEN** ist `games[i].log` entweder nicht vorhanden oder ein leeres Array

#### Scenario: Vollständiger Spiellog mit Verbose
- **WHEN** `verbose: true`
- **THEN** enthält jedes `games[i].log` alle Aktionen des Spiels als Einträge mit `turn`, `round`, `playerID`, `strategy`, `move`, `args`, `snapshot`

### Requirement: HTML-Dashboard generieren
Der Reporter SHALL eine selbst-enthaltene HTML-Datei generieren, die ohne Build-Tools im Browser geöffnet werden kann und das Turnier visuell auswertet.

#### Scenario: HTML-Datei ist selbst-enthaltend
- **WHEN** die HTML-Datei im Browser geöffnet wird (auch offline, ohne lokalen Server)
- **THEN** werden alle Charts und Tabellen korrekt dargestellt (Chart.js via CDN, Daten inline als JSON im Script-Tag)

#### Scenario: Dashboard enthält Gewinnrate-Tabelle
- **WHEN** das Dashboard geöffnet wird
- **THEN** zeigt eine sortierte Tabelle alle Strategien mit Gewinnrate, Durchschnittspunkten und Durchschnittsrang

#### Scenario: Head-to-Head-Matrix für 2-Spieler-Turniere
- **WHEN** `numPlayers === 2`
- **THEN** zeigt das Dashboard eine farbkodierte 5×5-Matrix mit den Win-Rates aller Strategie-Paare (Grün = >50%, Rot = <50%)

#### Scenario: Box-Plot-Daten für Punkteverteilung
- **WHEN** das Dashboard geöffnet wird
- **THEN** zeigt ein Chart die Punkteverteilung pro Strategie mit Min, Max, Median und Durchschnitt

#### Scenario: Spieldauer-Histogramm
- **WHEN** das Dashboard geöffnet wird
- **THEN** zeigt ein Chart die Verteilung der Spieldauer in Runden

### Requirement: CLI-Einstiegspunkt
Das Script `backend/src/simulation/run.ts` SHALL als CLI ausführbar sein und alle Turnier-Parameter über Flags entgegennehmen.

#### Scenario: Standard-Aufruf ohne Flags
- **WHEN** `pnpm tsx src/simulation/run.ts` ohne Flags ausgeführt wird
- **THEN** läuft ein 2-Spieler-Turnier mit 100 Spielen pro Matchup, zufälligem Seed und Output in `./simulation-results/`

#### Scenario: Spieleranzahl-Flag
- **WHEN** `--players 3` übergeben wird
- **THEN** werden 3-Spieler-Kombinationen simuliert

#### Scenario: Komma-separierte Spieleranzahlen
- **WHEN** `--players 2,3,5` übergeben wird
- **THEN** werden drei separate Turnier-Läufe ausgeführt und drei Report-Paare (JSON + HTML) erzeugt

#### Scenario: Seed-Flag für Reproduzierbarkeit
- **WHEN** `--seed abc123` übergeben wird
- **THEN** ist der Master-Seed `"abc123"` und das Turnier ist exakt reproduzierbar

#### Scenario: Strategies-Filter
- **WHEN** `--strategies greedy,diamond,efficient` übergeben wird
- **THEN** werden nur Matchups zwischen diesen drei Strategien simuliert
