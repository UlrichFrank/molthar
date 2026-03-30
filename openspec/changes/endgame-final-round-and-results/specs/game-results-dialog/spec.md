## ADDED Requirements

### Requirement: Abschluss-Dialog erscheint bei Spielende
Sobald `ctx.gameover` gesetzt ist, SHALL der `GameResultsDialog` über dem Spielfeld angezeigt werden. Der Dialog SHALL nicht schließbar sein (kein Escape, kein X-Button).

#### Scenario: Dialog erscheint nach Spielende
- **WHEN** `ctx.gameover` ist gesetzt (d.h. `endIf` hat einen Wert zurückgegeben)
- **THEN** wird der `GameResultsDialog` angezeigt

#### Scenario: Spielfeld bleibt im Hintergrund sichtbar
- **WHEN** der Dialog offen ist
- **THEN** ist das Canvas-Spielfeld im Hintergrund sichtbar (kein komplett schwarzer Hintergrund), aber nicht interagierbar

### Requirement: Dialog zeigt vollständiges Ranking
Der Dialog SHALL alle Spieler in absteigender Reihenfolge (Position 1 = Gewinner) mit Name, Punktzahl und Diamanten anzeigen. Der Gewinner (Position 1) SHALL visuell hervorgehoben sein.

#### Scenario: Gewinner-Hervorhebung
- **WHEN** `ranking[0]` ist eindeutiger Gewinner (höchste Punkte oder meiste Diamanten beim Tiebreaker)
- **THEN** wird `ranking[0]` mit einem Gewinner-Label (z.B. "🏆 Gewinner") und visueller Hervorhebung dargestellt

#### Scenario: Echtes Unentschieden — beide hervorgehoben
- **WHEN** `ranking[0]` und `ranking[1]` haben gleiche Punkte und Diamanten
- **THEN** werden beide gleichrangig hervorgehoben (z.B. "🤝 Unentschieden")

#### Scenario: Vollständige Ranking-Tabelle
- **WHEN** der Dialog angezeigt wird
- **THEN** sind alle Spieler mit Rang, Name, Punkte-Icon/Wert und Diamanten-Icon/Wert aufgelistet

### Requirement: Automatische Lobby-Rückkehr nach Countdown
Der Dialog SHALL einen sichtbaren Countdown (in Sekunden) anzeigen. Nach Ablauf von 30 Sekunden SHALL `onLeaveGame()` aufgerufen werden, was den Spieler zur Lobby zurückbringt. Ein Button "Zurück zur Lobby" erlaubt vorzeitiges Beenden.

#### Scenario: Countdown läuft ab
- **WHEN** der Dialog angezeigt wird und 30 Sekunden vergehen ohne Interaktion
- **THEN** wird `onLeaveGame()` aufgerufen

#### Scenario: Vorzeitige Rückkehr per Button
- **WHEN** der Spieler auf "Zurück zur Lobby" klickt
- **THEN** wird sofort `onLeaveGame()` aufgerufen (unabhängig vom Countdown-Stand)

#### Scenario: Countdown sichtbar
- **WHEN** der Dialog angezeigt wird
- **THEN** ist der aktuelle Countdown-Wert (Sekunden) für den Spieler sichtbar

### Requirement: Eigener Spieler im Ranking erkennbar
Der Dialog SHALL den eigenen Spieler (via `playerID`) im Ranking visuell kennzeichnen (z.B. fett oder mit "(Du)"-Label).

#### Scenario: Eigener Spieler markiert
- **WHEN** der Dialog angezeigt wird
- **THEN** ist der Eintrag des eigenen Spielers im Ranking mit "(Du)" oder ähnlich gekennzeichnet
