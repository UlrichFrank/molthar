# show-player-names Specification

## Purpose
TBD - created by archiving change show-player-names. Update Purpose after archive.
## Requirements
### Requirement: Gegner-Namen auf dem Canvas
Die Gegner-Zonen auf dem Canvas SHALL den Spielernamen des jeweiligen Gegners anzeigen. Der Name wird aus `matchData` bezogen; Fallback ist `G.players[id].name`, dann `Spieler ${id + 1}`.

#### Scenario: Name in Gegner-Zone sichtbar
- **WHEN** das Spielfeld gerendert wird und ein Gegner vorhanden ist
- **THEN** zeigt die Gegner-Zone den Spielernamen des Gegners als lesbares Label

#### Scenario: Fallback bei fehlendem matchData
- **WHEN** `matchData` nicht verfügbar ist
- **THEN** wird der Name aus dem Game-State (`G.players[id].name`) verwendet oder `Spieler ${id + 1}` als letzter Fallback

---

### Requirement: Spielername in der Lobby-Wiedereinstieg-Anzeige
Die Wiedereinstieg-Anzeige in der Lobby SHALL den gespeicherten Spielernamen statt der Spielernummer anzeigen.

#### Scenario: Wiedereinstieg mit gespeichertem Namen
- **WHEN** ein Spieler die Seite neu lädt und eine laufende Session im localStorage vorhanden ist
- **THEN** zeigt die Lobby den Spielernamen (z. B. „Weiter als Alice") statt „als Spieler 2"

