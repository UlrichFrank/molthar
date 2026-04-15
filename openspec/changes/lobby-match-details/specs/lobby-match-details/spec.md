## ADDED Requirements

### Requirement: `Match`-Interface enthält Zeitstempel und vollständige Spieler-Daten
Das `Match`-Interface in `useLobbyClient.ts` SHALL `createdAt?: number` und `MatchPlayer.isConnected?: boolean` enthalten, damit die Komponenten auf diese Felder typsicher zugreifen können.

#### Scenario: createdAt im Interface
- **WHEN** die API ein Match mit `createdAt`-Wert zurückgibt
- **THEN** ist der Wert über `match.createdAt` ohne TypeScript-Fehler abrufbar

### Requirement: Spielliste zeigt Erstellungszeitpunkt
Jeder Match-Eintrag in der `MatchList` SHALL den Erstellungszeitpunkt anzeigen. Das Format ist `HH:MM` wenn das Match heute erstellt wurde, sonst `DD.MM. HH:MM` (Locale des Browsers).

#### Scenario: Match von heute
- **WHEN** `createdAt` auf das heutige Datum fällt
- **THEN** wird die Uhrzeit im Format `HH:MM` angezeigt

#### Scenario: Match von einem anderen Tag
- **WHEN** `createdAt` auf einen anderen Tag fällt
- **THEN** wird Datum und Uhrzeit im Format `DD.MM. HH:MM` angezeigt

#### Scenario: createdAt fehlt
- **WHEN** `createdAt` nicht vorhanden ist
- **THEN** wird kein Zeitstempel angezeigt (kein Fehler, kein Platzhalter)

### Requirement: Spielliste zeigt den Namen des Erstellers
Jeder Match-Eintrag SHALL den Namen des Erstellers anzeigen. Der Ersteller ist `players[0]`.

#### Scenario: Ersteller beigetreten
- **WHEN** `players[0].name` gesetzt ist
- **THEN** wird der Name des Erstellers sichtbar angezeigt

#### Scenario: Ersteller-Name fehlt
- **WHEN** `players[0].name` nicht gesetzt ist
- **THEN** wird kein Erstellername angezeigt (kein Fehler)

### Requirement: Spielliste zeigt alle beigetretenen Teilnehmer
Jeder Match-Eintrag SHALL die Namen aller Spieler anzeigen, die bereits beigetreten sind (`name !== undefined`), kommagetrennt.

#### Scenario: Mehrere Teilnehmer beigetreten
- **WHEN** zwei oder mehr Spieler einem Match beigetreten sind
- **THEN** werden alle ihre Namen kommagetrennt angezeigt

#### Scenario: Nur Ersteller beigetreten
- **WHEN** nur `players[0]` einen Namen hat
- **THEN** wird nur dieser Name angezeigt

#### Scenario: Keine Teilnehmer mit Namen
- **WHEN** kein Spieler einen Namen hat
- **THEN** wird keine Teilnehmerliste angezeigt
