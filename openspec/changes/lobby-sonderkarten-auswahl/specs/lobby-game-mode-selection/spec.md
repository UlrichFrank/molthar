## ADDED Requirements

### Requirement: Karten haben ein optionales `isSpecial`-Flag
`CharacterCard` und `PearlCard` in `shared/src/game/types.ts` SHALL ein optionales Feld `isSpecial?: boolean` besitzen. Karten ohne dieses Feld oder mit `isSpecial: false` gehören zum Basisset.

#### Scenario: Sonderkarte ist markiert
- **WHEN** eine Karte mit `isSpecial: true` in `cards.json` eingetragen ist
- **THEN** hat das geparste `CharacterCard`- bzw. `PearlCard`-Objekt `isSpecial === true`

#### Scenario: Basiskarte ist nicht markiert
- **WHEN** eine Karte kein `isSpecial`-Feld hat
- **THEN** gilt sie als Basiskarte (`isSpecial` ist `undefined` oder `false`)

### Requirement: `setup()` filtert Karten anhand von `withSpecialCards`
Die `setup()`-Funktion SHALL `setupData.withSpecialCards` auswerten. Ist der Wert `false` oder nicht gesetzt, werden Karten mit `isSpecial: true` aus Charakter- und Perlendecks ausgeschlossen.

#### Scenario: Spiel ohne Sonderkarten
- **WHEN** ein Match mit `setupData: { withSpecialCards: false }` erstellt wird
- **THEN** enthält `G.characterDeck` keine Karte mit `isSpecial: true`
- **AND** enthält `G.pearlDeck` keine Karte mit `isSpecial: true`

#### Scenario: Spiel mit Sonderkarten
- **WHEN** ein Match mit `setupData: { withSpecialCards: true }` erstellt wird
- **THEN** enthält `G.characterDeck` auch Karten mit `isSpecial: true`

#### Scenario: Default ohne setupData
- **WHEN** ein Match ohne `setupData` erstellt wird
- **THEN** verhält sich das Spiel wie `withSpecialCards: false`

### Requirement: `G.withSpecialCards` speichert den gewählten Modus
`GameState` SHALL ein Feld `withSpecialCards: boolean` besitzen, das in `setup()` aus `setupData` übernommen wird und danach unveränderlich ist.

#### Scenario: Modus im State verfügbar
- **WHEN** `setup()` mit `setupData: { withSpecialCards: true }` aufgerufen wird
- **THEN** ist `G.withSpecialCards === true`

### Requirement: Lobby-Erstellmaske hat Toggle für Sonderkarten
Die `CreateMatch`-Komponente SHALL einen Toggle/Checkbox „Mit Sonderkarten" anzeigen. Der Standardwert ist `false`. Die Auswahl wird beim Erstellen eines Spiels als `setupData.withSpecialCards` übergeben.

#### Scenario: Toggle standardmäßig deaktiviert
- **WHEN** der Spieler die Erstellmaske öffnet
- **THEN** ist der Sonderkarten-Toggle nicht aktiv (Basisspiel)

#### Scenario: Toggle aktivieren
- **WHEN** der Spieler den Toggle aktiviert und das Spiel erstellt
- **THEN** wird `createMatch` mit `setupData: { withSpecialCards: true }` aufgerufen

#### Scenario: Toggle deaktiviert lassen
- **WHEN** der Spieler den Toggle nicht ändert und das Spiel erstellt
- **THEN** wird `createMatch` mit `setupData: { withSpecialCards: false }` aufgerufen

### Requirement: Wartezimmer zeigt den gewählten Spielmodus an
Das Wartezimmer SHALL den aktiven Spielmodus für alle Spieler anzeigen (z. B. „Basisspiel" oder „Mit Sonderkarten").

#### Scenario: Modus im Wartezimmer sichtbar
- **WHEN** ein Spieler im Wartezimmer eines Matches ist
- **THEN** ist sichtbar ob das Spiel mit oder ohne Sonderkarten gespielt wird

### Requirement: Spielliste zeigt Spielmodus je Match
Die `MatchList`-Komponente SHALL für jedes offene Match den Spielmodus anzeigen, sofern die Information verfügbar ist.

#### Scenario: Modus in der Spielliste sichtbar
- **WHEN** offene Matches aufgelistet werden
- **THEN** zeigt jedes Match-Element ob es mit oder ohne Sonderkarten läuft

#### Scenario: Modus nicht verfügbar (graceful degradation)
- **WHEN** `setupData` für ein Match nicht aus der API abrufbar ist
- **THEN** wird kein Modus-Label angezeigt (kein Fehler)
