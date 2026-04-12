## ADDED Requirements

### Requirement: Endgame-Ergebnis-Dialog bei Spielende anzeigen
Das System SHALL nach Spielende automatisch einen modalen Dialog öffnen, der die Ergebnisse aller Spieler in einer Rang-Tabelle zeigt. Der Dialog MUSS erscheinen sobald `ctx.gameover !== undefined` — unabhängig vom Grund (`terminated` oder reguläres Ende).

#### Scenario: Dialog öffnet sich automatisch bei normalem Spielende
- **WHEN** `ctx.gameover !== undefined` und `ctx.gameover.reason !== 'terminated'`
- **THEN** wird der Endgame-Dialog automatisch angezeigt mit einer Tabelle aller Spieler, sortiert nach Punktzahl absteigend

#### Scenario: Dialog öffnet sich auch bei Spielabbruch
- **WHEN** `ctx.gameover.reason === 'terminated'`
- **THEN** wird der Endgame-Dialog mit einer Tabelle aller Spieler angezeigt und einem Hinweis "Spiel wurde beendet"

#### Scenario: Rang-Tabelle zeigt korrekten Inhalt
- **WHEN** der Dialog angezeigt wird
- **THEN** enthält die Tabelle je Spieler: Rang (1., 2., …), Name, Punkte (`powerPoints`), Anzahl aktivierter Charaktere (`activatedCharacters.length`); Gewinner (höchste Punktzahl) sind hervorgehoben

#### Scenario: Bestätigung führt zur Lobby
- **WHEN** der Spieler den "Zurück zur Lobby"-Button klickt
- **THEN** wird `pvm:gameOver` gefeuert, die Session gelöscht und der Spieler landet in der Lobby

### Requirement: gameover-Payload enthält vollständige Spielergebnisse
Das System SHALL im `endIf`-Rückgabewert einen `players`-Array mitliefern, der für jeden Spieler `id`, `name`, `powerPoints` und `activatedCount` enthält — sortiert nach `powerPoints` absteigend.

#### Scenario: Payload korrekt befüllt bei regulärem Spielende
- **WHEN** `endIf` ein gameover zurückgibt
- **THEN** enthält `ctx.gameover.players` für jeden Spieler in `G.playerOrder` die Felder `id`, `name`, `powerPoints`, `activatedCount` (= `activatedCharacters.length`)

#### Scenario: Payload korrekt bei Gleichstand
- **WHEN** mehrere Spieler die gleiche maximale Punktzahl haben
- **THEN** sind alle in `ctx.gameover.winner` als `true` markiert und im `players`-Array enthalten
