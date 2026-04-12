## ADDED Requirements

### Requirement: Spielzustände werden persistent gespeichert
Der Server SHALL Spielzustände dauerhaft auf Disk speichern (FlatFile-Adapter), sodass aktive Spiele einen Server-Neustart überleben.

#### Scenario: Spielzustand überlebt Server-Neustart
- **WHEN** ein Spiel läuft und der Server neu gestartet wird
- **THEN** ist das Spiel nach dem Neustart über die Lobby-API abrufbar mit unverändertem Spielzustand

#### Scenario: Neues Spiel wird sofort persistiert
- **WHEN** ein Spieler ein neues Match erstellt
- **THEN** wird das Match unmittelbar in der persistenten Storage angelegt

#### Scenario: Spielzüge werden persistiert
- **WHEN** ein Spieler einen Move ausführt
- **THEN** wird der aktualisierte Spielzustand in der Storage gesichert bevor die Antwort zurückgesendet wird
