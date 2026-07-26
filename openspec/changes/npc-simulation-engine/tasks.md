## 1. Setup & Abhängigkeiten

- [x] 1.1 `seedrandom` + `@types/seedrandom` zu `backend/package.json` hinzufügen und `pnpm install` ausführen
- [x] 1.2 Verzeichnis `backend/src/simulation/` anlegen
- [x] 1.3 boardgame.io `CreateGameReducer` + `InitializeGame` Action-Creator-Signaturen in `backend/node_modules/boardgame.io/dist/cjs/core.js` und `reducer-*.js` verifizieren und die korrekten Aktions-Typen für MAKE_MOVE + GAME_EVENT dokumentieren

## 2. Simulation Engine (engine.ts)

- [x] 2.1 `GameResult`-Interface definieren: `{ gameId, strategies, rounds, totalActions, ranking, aborted, log }`
- [x] 2.2 `SimGameConfig`-Interface definieren: `{ strategies, seed, verbose?, withSpecialCards? }`
- [x] 2.3 `seedGame(seed: string)` Hilfsfunktion implementieren: patcht `Math.random` via seedrandom
- [x] 2.4 `runGame(config: SimGameConfig): GameResult` implementieren: InitializeGame → Reducer-Loop → gameover-Erkennung
- [x] 2.5 Safeguard implementieren: Abbruch bei >10.000 Aktionen, `aborted: true` setzen
- [x] 2.6 Verbose-Log implementieren: Snapshot (hand[], powerPoints, diamonds) vor jedem Zug aufzeichnen
- [x] 2.7 Unit-Test: Zwei Spiele mit gleichem Seed liefern identisches Ergebnis (Determinismus-Test)

## 3. Tournament Runner (tournament.ts)

- [x] 3.1 `TournamentResult`-Interface definieren inkl. `meta`, `games[]`, `stats`
- [x] 3.2 `TournamentConfig`-Interface definieren: `{ numPlayers, gamesPerMatchup, seed?, strategies?, verbose?, withSpecialCards? }`
- [x] 3.3 Hilfsfunktion: alle Strategie-Kombinationen mit Wiederholung für P Spieler berechnen (inkl. Spiegel-Matchups für 2P)
- [x] 3.4 `runTournament(config: TournamentConfig): TournamentResult` implementieren: alle Matchups × N Spiele sequenziell ausführen
- [x] 3.5 Per-Spiel-Seed ableiten: `"${masterSeed}:${gameIndex}"`
- [x] 3.6 `perStrategy`-Statistiken berechnen: wins, winRate, avgScore, avgRank, avgRounds (abgebrochene Spiele ausschließen)
- [x] 3.7 `headToHead`-Matrix für 2P-Turniere berechnen
- [x] 3.8 `meta.abortedGames` zählen
- [x] 3.9 Fortschrittsanzeige: jede 10. Partie auf stdout loggen (`[50/100] greedy vs diamond...`)

## 4. Report-Generator (reporter.ts)

- [x] 4.1 `generateJsonReport(result, outputDir, verbose)`: JSON-Datei mit korrektem Dateinamen schreiben
- [x] 4.2 JSON-Struktur validieren: alle Pflichtfelder aus Spec vorhanden
- [x] 4.3 HTML-Template vorbereiten: Grundstruktur mit Chart.js CDN-Link und Inline-Data-Slot
- [x] 4.4 Gewinnrate-Tabelle im HTML (sortiert nach Win-Rate)
- [x] 4.5 Head-to-Head-Matrix im HTML (farbkodiert: Grün >50%, Rot <50%, Grau = Spiegel)
- [x] 4.6 Box-Plot-Daten für Punkteverteilung pro Strategie (Chart.js Bar-Chart mit Min/Max/Avg/Median)
- [x] 4.7 Spieldauer-Histogramm (Chart.js Bar-Chart, Runden-Verteilung)
- [x] 4.8 Turnier-Metadaten-Header im HTML (Datum, Seed, Spieleranzahl, Spielanzahl, Dauer)
- [x] 4.9 `generateHtmlReport(result, outputDir)`: HTML-Datei schreiben
- [x] 4.10 Sicherstellen, dass HTML-Datei ohne lokalen Server im Browser öffnet (alle Daten inline)

## 5. CLI-Einstiegspunkt (run.ts)

- [x] 5.1 Argument-Parsing implementieren: `--players`, `--games`, `--seed`, `--strategies`, `--output`, `--verbose`, `--special-cards`
- [x] 5.2 Komma-separierte `--players 2,3,5` verarbeiten: separate Turnier-Läufe pro Spieleranzahl
- [x] 5.3 Standard-Werte implementieren: 2P, 100 Spiele/Matchup, zufälliger Seed, `./simulation-results/`
- [x] 5.4 Output-Verzeichnis anlegen falls nicht vorhanden
- [x] 5.5 Gesamtdauer messen und im Terminal ausgeben
- [x] 5.6 Nach Abschluss: Dateipfade der generierten Reports ausgeben

## 6. Integration & Abnahme

- [x] 6.1 Smoke-Test: `pnpm tsx src/simulation/run.ts --players 2 --games 10` läuft ohne Fehler durch
- [x] 6.2 Determinismus-Test: gleicher Aufruf mit `--seed test123` zweimal → identische JSON-Reports
- [x] 6.3 Multi-Player-Test: `--players 3 --games 5` erzeugt validen Report ohne head-to-head
- [x] 6.4 HTML-Dashboard im Browser öffnen und alle Charts prüfen
- [x] 6.5 TypeScript-Kompilierung: `pnpm run type-check` im backend ohne Fehler
