## MODIFIED Requirements

### Requirement: Tauschen-Button neben Perlenstapel sichtbar für aktiven Spieler

Wenn der lokale Spieler am Zug ist und noch Aktionen verbleiben (`actionCount < maxActions`), SHALL das System einen „Tauschen"-Button auf dem Canvas neben dem Perlen-Nachziehstapel anzeigen. Hat der Spieler die Fähigkeit `replacePearlSlotsBeforeFirstAction` aktiv, ist `actionCount === 0` und das Flag `G.replacePearlSlotsAbilityUsed === false`, wird stattdessen der Gratis-Tausch-Button angezeigt (der normale Tausch-Button ist in diesem Fall nicht sichtbar).

#### Scenario: Button sichtbar wenn aktiver Spieler Aktionen hat
- **WHEN** der lokale Spieler `currentPlayer` ist und `G.actionCount < G.maxActions`
- **AND** nicht (`actionCount === 0` und Fähigkeit aktiv und `replacePearlSlotsAbilityUsed === false`)
- **THEN** wird der normale Tauschen-Button auf dem Canvas gerendert

#### Scenario: Gratis-Button ersetzt normalen Button vor erster Aktion
- **WHEN** der lokale Spieler `currentPlayer` ist, `actionCount === 0`, Fähigkeit `replacePearlSlotsBeforeFirstAction` aktiv, `replacePearlSlotsAbilityUsed === false`
- **THEN** wird der Gratis-Tausch-Button angezeigt und kein normaler Tauschen-Button

#### Scenario: Button nicht sichtbar für inaktiven Spieler
- **WHEN** der lokale Spieler nicht `currentPlayer` ist
- **THEN** wird kein Tauschen-Button (weder normal noch Gratis) gerendert

#### Scenario: Button nicht sichtbar wenn keine Aktionen mehr übrig
- **WHEN** der lokale Spieler `currentPlayer` ist und `G.actionCount >= G.maxActions`
- **THEN** wird kein Tauschen-Button gerendert

### Requirement: Klick auf Tauschen-Button löst replacePearlSlots aus

Ein Klick auf den normalen Tauschen-Button SHALL den Move `replacePearlSlots` aufrufen.

#### Scenario: Erfolgreicher Klick
- **WHEN** der aktive Spieler auf den Tauschen-Button klickt
- **THEN** wird `moves.replacePearlSlots()` aufgerufen und alle 4 Perlenslots werden durch neue Karten ersetzt

### Requirement: Button ist in der Canvas-Hit-Test-Region registriert

Der Tauschen-Button und der Gratis-Tausch-Button SHALL jeweils als eigene `CanvasRegion` registriert sein (`'replace-pearl-slots'` bzw. `'replace-pearl-slots-ability'`), damit Klicks korrekt erkannt werden.

#### Scenario: Region registriert wenn Button sichtbar
- **WHEN** ein Button gerendert wird
- **THEN** existiert eine `CanvasRegion` vom passenden Typ mit den korrekten Koordinaten
