## ADDED Requirements

### Requirement: Tauschen-Button neben Perlenstapel sichtbar für aktiven Spieler

Wenn der lokale Spieler am Zug ist und noch Aktionen verbleiben (`actionCount < maxActions`), SHALL das System einen „Tauschen"-Button auf dem Canvas neben dem Perlen-Nachziehstapel anzeigen.

#### Scenario: Button sichtbar wenn aktiver Spieler Aktionen hat
- **WHEN** der lokale Spieler `currentPlayer` ist und `G.actionCount < G.maxActions`
- **THEN** wird der Tauschen-Button auf dem Canvas gerendert

#### Scenario: Button nicht sichtbar für inaktiven Spieler
- **WHEN** der lokale Spieler nicht `currentPlayer` ist
- **THEN** wird kein Tauschen-Button gerendert

#### Scenario: Button nicht sichtbar wenn keine Aktionen mehr übrig
- **WHEN** der lokale Spieler `currentPlayer` ist und `G.actionCount >= G.maxActions`
- **THEN** wird kein Tauschen-Button gerendert

### Requirement: Klick auf Tauschen-Button löst replacePearlSlots aus

Ein Klick auf den Tauschen-Button SHALL den Move `replacePearlSlots` aufrufen.

#### Scenario: Erfolgreicher Klick
- **WHEN** der aktive Spieler auf den Tauschen-Button klickt
- **THEN** wird `moves.replacePearlSlots()` aufgerufen und alle 4 Perlenslots werden durch neue Karten ersetzt

### Requirement: Button ist in der Canvas-Hit-Test-Region registriert

Der Tauschen-Button SHALL als eigene `CanvasRegion` mit Typ `'replace-pearl-slots'` registriert sein, damit Klicks korrekt erkannt werden.

#### Scenario: Region registriert wenn Button sichtbar
- **WHEN** der Button gerendert wird
- **THEN** existiert eine `CanvasRegion` vom Typ `'replace-pearl-slots'` mit den korrekten Koordinaten
