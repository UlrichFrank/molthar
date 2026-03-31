## ADDED Requirements

### Requirement: Jeder Spieler hat einen colorIndex (1–5)
`PlayerState` SHALL ein Feld `colorIndex: number` (Wertebereich 1–5) enthalten. In `setup` SHALL `colorIndex` sequenziell zugewiesen werden: `playerIds[0]` bekommt `1`, `playerIds[1]` bekommt `2`, usw.

#### Scenario: Default-Zuweisung im Setup
- **WHEN** eine Partie mit 3 Spielern gestartet wird
- **THEN** hat Spieler 0 `colorIndex=1`, Spieler 1 `colorIndex=2`, Spieler 2 `colorIndex=3`

#### Scenario: colorIndex im gültigen Bereich
- **WHEN** das Spiel für bis zu 5 Spieler gestartet wird
- **THEN** haben alle Spieler `colorIndex` im Bereich 1–5, keine doppelten Werte

### Requirement: Startspieler wird zufällig gewählt
Der `startingPlayer` in `GameState` SHALL beim Setup zufällig aus `playerIds` gewählt werden (gleichverteilt). Er soll NICHT immer `playerIds[0]` sein.

#### Scenario: Zufälliger Startspieler
- **WHEN** eine Partie gestartet wird
- **THEN** ist `G.startingPlayer` einer der `playerIds` (zufällig, nicht deterministisch immer der erste)

### Requirement: Farbwahl in der colorSelection-Phase
Das Spiel SHALL mit einer `colorSelection`-Phase starten. In dieser Phase kann jeder Spieler simultan `selectColor(colorIndex: number)` aufrufen, um eine freie Farbe zu wählen. Bereits belegte Farben (von anderen Spielern gewählt) dürfen nicht gewählt werden → `INVALID_MOVE`. Wer keine Aktion macht, behält seinen Default-`colorIndex`. Ein `confirmColor()` Move schließt die Wahl ab.

#### Scenario: Farbwahl erfolgreich
- **WHEN** Spieler ruft `selectColor(3)` und Farbe 3 ist noch nicht belegt
- **THEN** wird `G.players[playerId].colorIndex = 3` gesetzt

#### Scenario: Belegte Farbe abgelehnt
- **WHEN** Spieler ruft `selectColor(2)` und ein anderer Spieler hat bereits `colorIndex=2`
- **THEN** gibt der Move `INVALID_MOVE` zurück

#### Scenario: Phase endet wenn alle confirmed
- **WHEN** alle Spieler `confirmColor()` aufgerufen haben
- **THEN** endet die `colorSelection`-Phase und das Spiel geht in die normale Spielphase über

#### Scenario: Default bleibt bei fehlender Bestätigung
- **WHEN** ein Spieler in der `colorSelection`-Phase keine Aktion ausführt und die Phase endet
- **THEN** behält der Spieler seinen Default-`colorIndex` aus dem Setup

### Requirement: Portal-Hintergrundbilder basieren auf colorIndex
Das Portal des lokalen Spielers SHALL `Portal{colorIndex}.jpeg` als Hintergrundbild verwenden. Der Startspieler (dessen `playerId === G.startingPlayer`) SHALL stattdessen `Portal-Startspieler{colorIndex}.jpeg` verwenden.

#### Scenario: Normaler Spieler — Portal-Bild
- **WHEN** der lokale Spieler `colorIndex=2` hat und kein Startspieler ist
- **THEN** wird `Portal2.jpeg` als Portal-Hintergrund gerendert

#### Scenario: Startspieler — Portal-Bild
- **WHEN** der lokale Spieler `colorIndex=3` ist und `G.startingPlayer === myPlayerID`
- **THEN** wird `Portal-Startspieler3.jpeg` als Portal-Hintergrund gerendert
