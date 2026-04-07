## ADDED Requirements

### Requirement: Tauschen-Button wird per drawUIButton auf dem Canvas gezeichnet

Das Canvas-Rendering SHALL einen „Tauschen"-Button unterhalb (oder neben) des Perlen-Nachziehstapels zeichnen, wenn der lokale Spieler am Zug ist und Aktionen verfügbar sind.

#### Scenario: Button wird gezeichnet
- **WHEN** `isMyTurn === true` und `G.actionCount < G.maxActions`
- **THEN** wird `drawUIButton` mit Label „↺ Tauschen" an der definierten Position aufgerufen
