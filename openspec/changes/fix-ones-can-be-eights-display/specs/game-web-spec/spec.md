## ADDED Requirements

### Requirement: onesCanBeEights startet inaktiv beim Auswählen einer 1-Perlenkarte
Das System SHALL beim Auswählen einer 1-Perlenkarte im Aktivierungsdialog die `onesCanBeEights`-Fähigkeit NICHT automatisch anwenden. Die Karte SHALL mit ihrem echten Wert (1) und ohne `abilityType` zur Auswahl hinzugefügt werden. Der `1→8`-Badge SHALL im inaktiven (gedimmten) Zustand erscheinen.

#### Scenario: 1-Perlenkarte auswählen — Badge inaktiv
- **WHEN** der Spieler eine 1-Perlenkarte auswählt und `onesCanBeEights` in `activeAbilities` ist
- **THEN** wird die Karte mit `value=1` und ohne `abilityType` gespeichert; der `1→8`-Badge erscheint gedimmt (nicht blau)

#### Scenario: Badge-Klick aktiviert onesCanBeEights manuell
- **WHEN** der Spieler auf den gedimmten `1→8`-Badge klickt
- **THEN** wird `value=8` und `abilityType='onesCanBeEights'` gesetzt; der Badge erscheint blau (aktiv)

#### Scenario: Erneuter Badge-Klick deaktiviert onesCanBeEights
- **WHEN** der Spieler auf den aktiven (blauen) `1→8`-Badge klickt
- **THEN** wird die Karte auf `value=1` und kein `abilityType` zurückgesetzt; der Badge erscheint wieder gedimmt
