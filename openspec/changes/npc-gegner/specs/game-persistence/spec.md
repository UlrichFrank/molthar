## MODIFIED Requirements

### Requirement: Spielzustände werden persistent gespeichert
Der Server SHALL Spielzustände dauerhaft auf Disk speichern (FlatFile-Adapter), sodass aktive Spiele einen Server-Neustart überleben. `setupData` MUSS das optionale Feld `npcSlots` unterstützen, das pro NPC-Slot playerIndex und Strategie speichert. Beim Server-Neustart liest der BotRunner `npcSlots` aus dem persistierten setupData und startet die entsprechenden Bot-Clients neu.

#### Scenario: Spielzustand überlebt Server-Neustart
- **WHEN** ein Spiel läuft und der Server neu gestartet wird
- **THEN** ist das Spiel nach dem Neustart über die Lobby-API abrufbar mit unverändertem Spielzustand

#### Scenario: Neues Spiel wird sofort persistiert
- **WHEN** ein Spieler ein neues Match erstellt
- **THEN** wird das Match unmittelbar in der persistenten Storage angelegt

#### Scenario: Spielzüge werden persistiert
- **WHEN** ein Spieler einen Move ausführt
- **THEN** wird der aktualisierte Spielzustand in der Storage gesichert bevor die Antwort zurückgesendet wird

#### Scenario: NPC-Konfiguration überlebt Server-Neustart
- **WHEN** ein Match mit npcSlots in setupData existiert und der Server neu startet
- **THEN** liest der BotRunner npcSlots aus setupData und startet Bot-Clients für alle NPC-Slots neu
