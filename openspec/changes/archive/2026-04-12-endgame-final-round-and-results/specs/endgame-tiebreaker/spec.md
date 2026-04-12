## ADDED Requirements

### Requirement: Spielende gibt ein sortiertes Ranking zurück
`endIf` SHALL ein `{ ranking: Array<{ playerId: string; name: string; powerPoints: number; diamonds: number }> }`-Objekt zurückgeben. Das Array SHALL absteigend nach `powerPoints` sortiert sein. Bei Punktgleichstand SHALL nach `diamonds` absteigend sortiert werden. `ranking[0]` ist der Gewinner.

#### Scenario: Klarer Sieger
- **WHEN** Spieler A hat 15 Punkte, Spieler B hat 12 Punkte
- **THEN** gibt `endIf` ein Ranking zurück mit A an Position 0 und B an Position 1

#### Scenario: Tiebreaker — mehr Diamanten gewinnt
- **WHEN** Spieler A hat 14 Punkte und 3 Diamanten, Spieler B hat 14 Punkte und 5 Diamanten
- **THEN** gibt `endIf` ein Ranking zurück mit B an Position 0 (mehr Diamanten) und A an Position 1

#### Scenario: Echtes Unentschieden
- **WHEN** Spieler A und B haben gleiche Punkte UND gleiche Diamanten
- **THEN** stehen beide in `ranking` mit gleichen Werten (Reihenfolge stabil, aber kein eindeutiger Sieger)

#### Scenario: Ranking enthält alle Spieler
- **WHEN** das Spiel mit 4 Spielern endet
- **THEN** enthält `ranking` alle 4 Spieler in absteigender Reihenfolge

### Requirement: Endrundenauslösung bei ≥ 12 Punkten unverändert
Die bestehende Logik — `G.finalRound = true` sobald ein Spieler ≥ 12 Punkte durch Kartenaktivierung erreicht, danach wird die Runde zu Ende gespielt und eine letzte Runde durchgeführt — SHALL unverändert bleiben.

#### Scenario: Endrunde ausgelöst bei 12 Punkten
- **WHEN** ein Spieler durch eine Kartenaktivierung genau 12 Punkte erreicht
- **THEN** wird `G.finalRound = true` und `G.finalRoundStartingPlayer` gesetzt

#### Scenario: Spielende nach vollständiger letzter Runde
- **WHEN** `G.finalRound === true` und alle Spieler (inkl. `finalRoundStartingPlayer`) haben ihren letzten Zug gespielt
- **THEN** gibt `endIf` das Ranking zurück
