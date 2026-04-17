## ADDED Requirements

### Requirement: Aktivierte Charakterkarten werden paginiert dargestellt

Das System SHALL aktivierte Charakterkarten in einem 3×2-Grid (6 Karten pro Seite) anzeigen. Sind mehr als 6 Karten vorhanden, MUSS eine zweite Seite verfügbar sein.

#### Scenario: Bis zu 6 Karten — keine Paginierung sichtbar
- **WHEN** ein Spieler 1–6 aktivierte Charakterkarten hat
- **THEN** werden alle Karten auf Seite 0 angezeigt und kein Seitenumbruch ist nötig

#### Scenario: Mehr als 6 Karten — Seite 1 verfügbar
- **WHEN** ein Spieler 7 oder mehr aktivierte Charakterkarten hat
- **THEN** zeigt Seite 0 die Karten 0–5 und Seite 1 die Karten 6–11

### Requirement: Canvas-native Paginierungspfeile

Das System SHALL links (◄) und rechts (►) neben dem aktivierten Charakterkarten-Grid Pfeile auf dem Canvas zeichnen. Diese Pfeile MÜSSEN immer sichtbar sein — ausgegraut wenn nicht verwendbar.

#### Scenario: Rechter Pfeil aktiv wenn weitere Karten auf Seite 2
- **WHEN** Seite 0 aktiv und mehr als 6 aktivierte Karten vorhanden
- **THEN** ist der rechte Pfeil (►) hell und klickbar

#### Scenario: Rechter Pfeil inaktiv auf letzter Seite
- **WHEN** Seite 1 aktiv oder weniger als 7 Karten vorhanden
- **THEN** ist der rechte Pfeil (►) ausgegraut und nicht klickbar

#### Scenario: Linker Pfeil aktiv auf Seite 1
- **WHEN** Seite 1 aktiv
- **THEN** ist der linke Pfeil (◄) hell und klickbar

#### Scenario: Linker Pfeil inaktiv auf Seite 0
- **WHEN** Seite 0 aktiv
- **THEN** ist der linke Pfeil (◄) ausgegraut und nicht klickbar

#### Scenario: Hover-Effekt auf aktivem Pfeil
- **WHEN** der Mauszeiger über einem aktiven (nicht ausgegrauten) Pfeil schwebt
- **THEN** ändert sich die Pfeilfarbe auf den Hover-Zustand

### Requirement: Klick auf Pfeil wechselt die Seite

Das System SHALL beim Klick auf einen aktiven Paginierungspfeil die angezeigte Seite wechseln.

#### Scenario: Klick auf rechten Pfeil
- **WHEN** Seite 0 aktiv, rechter Pfeil aktiv, Spieler klickt darauf
- **THEN** wird Seite 1 angezeigt

#### Scenario: Klick auf linken Pfeil
- **WHEN** Seite 1 aktiv, Spieler klickt auf linken Pfeil
- **THEN** wird Seite 0 angezeigt

#### Scenario: Karten auf Seite 2 sind anklickbar
- **WHEN** Seite 1 aktiv und Spieler klickt auf eine Karte
- **THEN** wird das Karten-Detail-Overlay geöffnet (identisches Verhalten wie auf Seite 0)

### Requirement: Auto-advance auf Seite 1 bei neuer Karte

Das System SHALL automatisch auf Seite 1 wechseln, wenn eine neue Karte aktiviert wird und Seite 0 bereits voll ist.

#### Scenario: 7. Karte aktiviert während Seite 0 angezeigt wird
- **WHEN** Spieler hat 6 aktivierte Karten (Seite 0), aktiviert eine weitere Karte
- **THEN** wird automatisch auf Seite 1 umgeschaltet und die neue Karte ist sichtbar

#### Scenario: Kein Auto-advance wenn bereits auf Seite 1
- **WHEN** Spieler ist bereits auf Seite 1 und aktiviert eine weitere Karte
- **THEN** bleibt Seite 1 aktiv, keine Änderung

### Requirement: Paginierung in Gegner-Bereichen

Das System SHALL für jeden Mitspieler ebenfalls eine Paginierung der aktivierten Charakterkarten anzeigen, korrekt skaliert und entsprechend der Zone rotiert.

#### Scenario: Gegner-Pfeil sichtbar wenn Überlauf
- **WHEN** ein Mitspieler mehr als 6 aktivierte Karten hat
- **THEN** werden Paginierungspfeile in der Gegner-Zone angezeigt (skaliert mit OPP_SCALE)

#### Scenario: Gegner-Pfeil klickbar
- **WHEN** Spieler klickt auf aktiven Pfeil in einer Gegner-Zone
- **THEN** wechselt die Seite für diesen Gegner unabhängig von anderen Gegnern
