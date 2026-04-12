## ADDED Requirements

### Requirement: Tauschen-Button-Region im Hit-Test registriert

Die Funktion `buildCanvasRegions` SHALL eine Region vom Typ `'replace-pearl-slots'` erzeugen, wenn der Tauschen-Button gerendert wird, sodass Mausklicks auf den Button korrekt erkannt werden.

#### Scenario: Region wird erzeugt wenn Button aktiv
- **WHEN** der Tauschen-Button sichtbar ist (aktiver Spieler, Aktionen verfügbar)
- **THEN** enthält die Region-Liste eine Einträg vom Typ `'replace-pearl-slots'` mit den Bounding-Box-Koordinaten des Buttons

#### Scenario: Klick auf Region löst Move aus
- **WHEN** der Spieler in die Bounding Box der `'replace-pearl-slots'`-Region klickt
- **THEN** wird der Hit-Test-Handler mit `type === 'replace-pearl-slots'` aktiviert und `moves.replacePearlSlots()` aufgerufen
