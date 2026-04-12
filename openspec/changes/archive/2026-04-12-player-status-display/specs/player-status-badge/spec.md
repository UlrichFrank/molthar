## ADDED Requirements

### Requirement: Status-Badge je Spieler anzeigen
Das System SHALL für den lokalen Spieler und alle aktiven Mitspieler (d.h. alle Spieler in `G.playerOrder`, unabhängig von Online-Status) ein kompaktes Status-Badge anzeigen. Nicht-teilnehmende Spieler (nicht in `G.playerOrder`) SHALL kein Badge erhalten.

#### Scenario: Badge für eigenen Spieler
- **WHEN** eine Spielpartie läuft und der lokale Spieler in `G.playerOrder` ist
- **THEN** wird ein Badge unterhalb des `PlayerNameDisplay` angezeigt mit: Kraftpunkten, Diamanten-Anzahl und Symbolen für aktive Fähigkeiten

#### Scenario: Badge für Gegner
- **WHEN** eine Spielpartie läuft und ein Mitspieler in `G.playerOrder` ist
- **THEN** wird ein Badge in der jeweiligen Gegner-Zone des Canvas angezeigt mit: Kraftpunkten, Diamanten-Anzahl und Symbolen für aktive Fähigkeiten

#### Scenario: Kein Badge für nicht-teilnehmende Spieler
- **WHEN** ein Spieler nicht in `G.playerOrder` ist (z.B. ausgeschiedener oder nicht verbundener Spieler)
- **THEN** wird für diesen Spieler kein Status-Badge angezeigt

### Requirement: Badge-Inhalt
Das Badge SHALL folgende Informationen kompakt anzeigen:
- Kraftpunkte (`powerPoints`) mit einem Stern- oder Punkt-Symbol
- Diamanten (`diamonds`) mit einem Diamant-Symbol (💎)
- Aktive blaue Fähigkeiten als Icons/Symbole (max. 5, Rest als `+N`)

#### Scenario: Badge ohne Fähigkeiten
- **WHEN** ein Spieler keine aktiven blauen Fähigkeiten hat (`activeAbilities` ist leer)
- **THEN** werden im Badge keine Fähigkeits-Symbole angezeigt

#### Scenario: Badge mit vielen Fähigkeiten
- **WHEN** ein Spieler mehr als 5 aktive Fähigkeiten hat
- **THEN** werden die ersten 5 Fähigkeits-Symbole angezeigt, gefolgt von `+N` für die restlichen N Fähigkeiten

### Requirement: Badge ist anklickbar
Das Badge SHALL als interaktives Element erkennbar sein (Cursor-Änderung) und einen Klick registrieren.

#### Scenario: Klick öffnet Detail-Dialog
- **WHEN** der Benutzer auf ein Status-Badge klickt
- **THEN** öffnet sich der `PlayerStatusDialog` für den jeweiligen Spieler
