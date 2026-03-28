## ADDED Requirements

### Requirement: Aktionsanzeige wird auf dem Canvas gezeichnet
Das System SHALL die aktuelle Aktionsanzahl (verbrauchte / maximale Aktionen) und den Spielernamen direkt auf dem Canvas zeichnen, anstatt als React-Overlay.

#### Scenario: Aktionsanzeige für aktiven Spieler
- **WHEN** der lokale Spieler am Zug ist
- **THEN** zeigt die Canvas-Aktionsanzeige das Format "X / Y" (verbraucht / max)
- **AND** die Farbe signalisiert den Zustand: grün (≥2 Aktionen), gelb (1 Aktion), rot (0 Aktionen)

#### Scenario: Aktionsanzeige für nicht-aktiven Spieler
- **WHEN** der lokale Spieler nicht am Zug ist
- **THEN** zeigt die Canvas-Aktionsanzeige "Spielername X / Y" in blauer Farbe (read-only)

---

### Requirement: End-Turn-Button wird auf dem Canvas gezeichnet und ist interaktiv
Das System SHALL einen "End Turn"-Button auf dem Canvas zeichnen, der über das `CanvasRegion`-System anklickbar ist.

#### Scenario: End-Turn-Button erscheint wenn Aktionen aufgebraucht
- **WHEN** der aktive Spieler keine Aktionen mehr hat (actionCount >= maxActions)
- **THEN** zeigt der Canvas einen klickbaren "End Turn"-Button
- **AND** der Button hat Hover-Glow und Click-Flash wie alle anderen CanvasRegions

#### Scenario: End-Turn-Button ist deaktiviert wenn Aktionen verbleiben
- **WHEN** der aktive Spieler noch Aktionen übrig hat
- **THEN** ist der "End Turn"-Button visuell deaktiviert (kein Hover-Glow, kein Cursor-Wechsel)

#### Scenario: End-Turn-Button löst endTurn-Move aus
- **WHEN** der aktive Spieler den "End Turn"-Button klickt oder tippt
- **THEN** wird `moves.endTurn()` aufgerufen

---

### Requirement: Discard-Cards-Button wird auf dem Canvas gezeichnet und ist interaktiv
Das System SHALL einen "Discard Cards"-Button auf dem Canvas zeichnen, wenn der Spieler Karten abwerfen muss.

#### Scenario: Discard-Cards-Button erscheint bei überschrittenem Handlimit
- **WHEN** `G.requiresHandDiscard === true`
- **THEN** zeigt der Canvas einen klickbaren "Discard Cards"-Button (rot hervorgehoben)
- **AND** der Button hat Hover-Glow und Click-Flash

#### Scenario: Discard-Cards-Button öffnet Dialog
- **WHEN** der Spieler den "Discard Cards"-Button klickt oder tippt
- **THEN** öffnet sich der DiscardCardsDialog (bestehende Logik unverändert)

#### Scenario: Discard-Cards-Button ist nicht sichtbar wenn kein Discard nötig
- **WHEN** `G.requiresHandDiscard === false`
- **THEN** wird kein "Discard Cards"-Button auf dem Canvas gezeichnet und kein Hit-Test dafür durchgeführt
