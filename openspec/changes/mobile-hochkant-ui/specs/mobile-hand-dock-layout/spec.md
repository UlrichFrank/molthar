## ADDED Requirements

### Requirement: Hand-Dock-Grundlayout

Die mobile Ansicht SHALL das Board vertikal gliedern: eine fixe Statusleiste oben, ein scrollbarer Mittelbereich (Markt + eigenes Portal), eine fixe aufgefächerte Perlen-Hand unten und eine fixe Aktionsleiste ganz unten. Statusleiste, Hand-Dock und Aktionsleiste SHALL beim Scrollen sichtbar bleiben.

#### Scenario: Fixe Bereiche bleiben beim Scrollen
- **WHEN** der Spieler den Mittelbereich scrollt
- **THEN** bleiben Statusleiste, Hand-Dock und Aktionsleiste ortsfest sichtbar

#### Scenario: Karten in lesbarer Größe
- **WHEN** die mobile Ansicht Karten darstellt
- **THEN** werden sie als real dimensionierte DOM-Elemente (`<img>`) ohne uniforme Herunterskalierung des gesamten Boards gerendert

### Requirement: Markt-Darstellung

Der Markt SHALL die 4 offenen Perlenkarten (Wert 1–8, inkl. Tausch-/Auffüll-Symbol und Joker-Kennzeichnung) und die 2 offenen Charakterkarten sowie beide Nachziehstapel zeigen. Ein Tipp auf eine Perlenkarte SHALL die Perle nehmen; ein Tipp auf eine Charakterkarte SHALL die Vorschau/Nahme auslösen.

#### Scenario: Perle nehmen
- **WHEN** der Spieler am Zug eine offene Perlenkarte antippt
- **THEN** wird der entsprechende `move` zum Nehmen der Perle aufgerufen

#### Scenario: Charakterkarte aus Auslage nehmen
- **WHEN** der Spieler eine offene Charakterkarte antippt
- **THEN** öffnet sich die Vorschau bzw. wird die Karte über den zugehörigen `move` genommen

### Requirement: Perlen-Hand im Dock

Das Hand-Dock SHALL die Perlenkarten des eigenen Spielers auffächern und bei Überlauf horizontal scrollbar sein. Jokerkarten SHALL erkennbar abgesetzt sein.

#### Scenario: Hand überläuft
- **WHEN** die Hand mehr Perlenkarten enthält als in einer Zeile Platz haben
- **THEN** bleibt die Hand horizontal scroll-/wischbar, ohne die Board-Höhe zu vergrößern

### Requirement: Fixe Aktionsleiste

Die Aktionsleiste SHALL „Zug beenden" und „Perlen tauschen" (`replacePearlSlots`) daumenerreichbar am unteren Rand anbieten und kontextabhängige Aktionen einblenden, wenn sie verfügbar sind.

#### Scenario: Zug beenden
- **WHEN** der Spieler „Zug beenden" antippt
- **THEN** wird der `endTurn`-`move` ausgelöst
