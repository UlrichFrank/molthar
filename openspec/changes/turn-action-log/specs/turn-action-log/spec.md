## ADDED Requirements

### Requirement: Aktionslog im Spielzustand
Der Spielzustand SHALL ein `actionLog: ActionLogEntry[]`-Feld führen, das die Aktionen des laufenden und des zuletzt abgeschlossenen Zuges enthält (max. 30 Einträge, FIFO).

#### Scenario: Move-Handler schreibt Log-Eintrag
- **WHEN** ein Spieler eine Aktion ausführt (Perle nehmen, Charakter aktivieren, etc.)
- **THEN** wird ein `ActionLogEntry` mit `playerId`, `type` und optionalen Zusatzfeldern (`cardName`, `cardValue`, `ppGained`) an `G.actionLog` angehängt

#### Scenario: Log-Größe ist begrenzt
- **WHEN** `G.actionLog` 30 Einträge erreicht und ein neuer Eintrag kommt
- **THEN** wird der älteste Eintrag entfernt (FIFO)

### Requirement: Aktionslog-Leiste im Frontend
Das Frontend SHALL eine horizontale Log-Leiste unterhalb des Canvas anzeigen, die die letzten Aktionen des aktuellen und des vorherigen Zuges zeigt (max. 10 Einträge sichtbar, ältere scrollbar).

#### Scenario: Eigene Aktionen erscheinen im Log
- **WHEN** der lokale Spieler eine Aktion ausführt
- **THEN** erscheint innerhalb einer Sekunde ein neuer Eintrag in der Log-Leiste

#### Scenario: Gegneraktionen erscheinen im Log
- **WHEN** ein Gegner seinen Zug abschließt und der lokale Spieler die aktualisierten State erhält
- **THEN** sind alle Aktionen des Gegnerzuges in der Log-Leiste sichtbar

#### Scenario: Log-Einträge sind übersetzt
- **WHEN** die UI-Sprache auf EN oder FR eingestellt ist
- **THEN** sind alle Log-Texte in der gewählten Sprache

#### Scenario: Zugwechsel-Trenner
- **WHEN** in der Log-Leiste Einträge aus zwei verschiedenen Zügen sichtbar sind
- **THEN** ist ein visueller Trenner zwischen den Zügen erkennbar (z.B. Spielername + Zugnummer)

### Requirement: Log-Leiste kollabierbar
Die Log-Leiste SHALL einen Toggle-Button haben, mit dem sie ein- und ausgeklappt werden kann. Der Zustand wird nicht persistiert.

#### Scenario: Log-Leiste ausblenden
- **WHEN** der Spieler den Toggle-Button klickt und die Leiste sichtbar ist
- **THEN** wird die Leiste ausgeblendet und der Canvas-Bereich vergrößert sich entsprechend

#### Scenario: Log-Leiste einblenden
- **WHEN** der Spieler den Toggle-Button klickt und die Leiste ausgeblendet ist
- **THEN** wird die Leiste wieder eingeblendet mit dem aktuellen Log-Inhalt
