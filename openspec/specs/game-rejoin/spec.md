## ADDED Requirements

### Requirement: Spieler-Session wird lokal gespeichert
Das Frontend SHALL matchID, playerID und playerCredentials nach erfolgreichem Join in `localStorage` (Key: `pvm_session`) speichern, damit ein Wiedereinsteigen ohne erneutes Beitreten möglich ist.

#### Scenario: Session wird nach Join gespeichert
- **WHEN** ein Spieler einem Match beitritt oder ein Match erstellt
- **THEN** werden matchID, playerID und credentials in localStorage unter `pvm_session` abgelegt

#### Scenario: Session wird beim Verlassen gelöscht
- **WHEN** der Spieler das Spiel regulär verlässt (Leave-Button) oder das Spiel endet
- **THEN** wird der `pvm_session`-Eintrag aus localStorage entfernt

### Requirement: Automatisches Wiederverbinden beim App-Start
Das Frontend SHALL beim Laden prüfen ob eine `pvm_session` im localStorage existiert und das zugehörige Match noch aktiv ist; wenn ja, direkt in die Spielansicht springen.

#### Scenario: Aktive Session beim App-Start gefunden
- **WHEN** der Nutzer die App öffnet und in localStorage eine Session mit aktivem Match existiert
- **THEN** wird die Spielansicht direkt geladen ohne Lobby-Interaktion

#### Scenario: Session verweist auf nicht mehr existierendes Match
- **WHEN** der Nutzer die App öffnet und die gespeicherte matchID nicht mehr existiert (Match wurde beendet)
- **THEN** wird die Session aus localStorage gelöscht und die Lobby angezeigt

### Requirement: Lobby zeigt Rejoin-Option für eigene Matches
Die Lobby SHALL laufende Matches, bei denen der Nutzer laut localStorage-Session Teilnehmer ist, mit einem "Wiedereinsteigen"-Button anzeigen.

#### Scenario: Eigenes laufendes Match in der Lobby sichtbar
- **WHEN** der Nutzer die Lobby öffnet und in localStorage eine Session für ein noch aktives Match existiert
- **THEN** wird dieses Match in einem eigenen Bereich "Meine laufenden Spiele" mit Rejoin-Button angezeigt

#### Scenario: Rejoin über Lobby-Button
- **WHEN** der Nutzer auf "Wiedereinsteigen" klickt
- **THEN** verbindet sich der Client mit dem Match unter Verwendung der gespeicherten Credentials und zeigt die Spielansicht
