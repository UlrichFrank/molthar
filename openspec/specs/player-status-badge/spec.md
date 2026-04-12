## MODIFIED Requirements

### Requirement: Badge-Inhalt
Das Badge SHALL folgende Informationen kompakt anzeigen:
- Spielername (wenn `playerName`-Prop gesetzt, als erste kompakte Zeile; max-width mit ellipsis)
- Kraftpunkte (`powerPoints`) mit einem Stern-Symbol
- Diamanten (`diamonds`) mit einem Diamant-Symbol (💎)
- Aktionszähler `X/Y` mit Farbcodierung (wenn `actionCount` und `maxActions`-Props gesetzt)
- Aktive blaue Fähigkeiten als Icons/Symbole (max. 5, Rest als `+N`)

#### Scenario: Badge ohne Fähigkeiten
- **WHEN** ein Spieler keine aktiven blauen Fähigkeiten hat (`activeAbilities` ist leer)
- **THEN** werden im Badge keine Fähigkeits-Symbole angezeigt

#### Scenario: Badge mit vielen Fähigkeiten
- **WHEN** ein Spieler mehr als 5 aktive Fähigkeiten hat
- **THEN** werden die ersten 5 Fähigkeits-Symbole angezeigt, gefolgt von `+N` für die restlichen N Fähigkeiten

#### Scenario: Badge mit Spielername
- **WHEN** die `playerName`-Prop gesetzt ist
- **THEN** wird der Name als erste Zeile im Badge angezeigt, bei Überlänge mit Ellipsis abgeschnitten

#### Scenario: Badge ohne Spielername
- **WHEN** die `playerName`-Prop nicht gesetzt ist
- **THEN** wird kein Name im Badge angezeigt

#### Scenario: Gegner-Badge mit Spielername
- **WHEN** ein Gegner-Badge gerendert wird
- **THEN** wird der aufgelöste Spielername als erste Zeile im Badge angezeigt (gleiche Darstellung wie eigenes Badge)

#### Scenario: Aktionszähler — viele Aktionen übrig
- **WHEN** `actionCount` und `maxActions` gesetzt sind und `maxActions - actionCount > 1`
- **THEN** wird `X/Y` in grün (`#22c55e`) angezeigt

#### Scenario: Aktionszähler — letzte Aktion
- **WHEN** `maxActions - actionCount === 1`
- **THEN** wird `X/Y` in gelb (`#facc15`, dunkler Text) angezeigt

#### Scenario: Aktionszähler — Aktionen erschöpft
- **WHEN** `actionCount >= maxActions`
- **THEN** wird `X/Y` in rot (`#ef4444`) angezeigt

#### Scenario: Badge ohne Aktionszähler
- **WHEN** `actionCount` oder `maxActions`-Prop nicht gesetzt ist
- **THEN** wird kein Aktionszähler angezeigt (Gegner-Badges)
