## ADDED Requirements

### Requirement: Ersteller kann Spiel aktiv beenden
Das System SHALL dem Ersteller (playerID `"0"`) jederzeit ermöglichen, das Spiel zu beenden; alle anderen Spieler MUST diesen Move abgelehnt bekommen.

#### Scenario: Ersteller beendet Spiel erfolgreich
- **WHEN** Spieler mit playerID `"0"` den `terminateGame`-Move ausführt
- **THEN** wird das Spiel mit `gameover`-Zustand `{ reason: 'terminated' }` beendet

#### Scenario: Nicht-Ersteller kann Spiel nicht beenden
- **WHEN** ein Spieler mit playerID ≠ `"0"` den `terminateGame`-Move ausführt
- **THEN** wird `INVALID_MOVE` zurückgegeben und das Spiel läuft weiter

### Requirement: Spielzustand wird nach Spielende gelöscht
Der Server SHALL das Match aus der Storage löschen nachdem das Spiel mit `reason: 'terminated'` endet.

#### Scenario: Match wird nach Termination aus Storage entfernt
- **WHEN** das Spiel mit `gameover.reason === 'terminated'` endet
- **THEN** ist das Match nicht mehr über die Lobby-API abrufbar

#### Scenario: Match bei normalem Spielende nicht sofort gelöscht
- **WHEN** das Spiel durch normale Siegbedingung endet (ohne `terminated`-Reason)
- **THEN** bleibt das Match in der Storage bis es manuell beendet wird (für spätere Einsichtnahme)

### Requirement: Ersteller-UI zeigt "Spiel beenden"-Button
Das Frontend SHALL in der Spielansicht für den Ersteller (playerID `"0"`) jederzeit einen "Spiel beenden"-Button anzeigen.

#### Scenario: Button nur für Ersteller sichtbar
- **WHEN** die Spielansicht gerendert wird
- **THEN** ist der "Spiel beenden"-Button nur für playerID `"0"` sichtbar, für alle anderen ausgeblendet

#### Scenario: Bestätigungsdialog vor Beenden
- **WHEN** der Ersteller auf "Spiel beenden" klickt
- **THEN** erscheint ein Bestätigungsdialog bevor der `terminateGame`-Move abgesendet wird
