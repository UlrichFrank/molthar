## ADDED Requirements

### Requirement: Karte „Tischlein deck dich" existiert in cards.json
Die Kartendatenbank SHALL einen Eintrag für „Tischlein deck dich" enthalten mit: Kosten `[{ type: 'number', value: 4 }]`, `powerPoints: 0`, `diamonds: 0`, Fähigkeit `{ type: 'replacePearlSlotsBeforeFirstAction', persistent: true }`, Bild `Charakterkarte41.png`.

#### Scenario: Karte ist ladbar
- **WHEN** `getAllCards()` aufgerufen wird
- **THEN** enthält das Ergebnis eine Karte mit `name: 'Tischlein deck dich'` und `abilities[0].type === 'replacePearlSlotsBeforeFirstAction'`

### Requirement: `replacePearlSlotsBeforeFirstAction` ist ein bekannter permanenter Fähigkeitstyp
Der Typ SHALL in `PERSISTENT_ABILITY_TYPES` enthalten sein und in `CharacterAbilityType` deklariert sein.

#### Scenario: Typ in persistenten Abilities
- **WHEN** `PERSISTENT_ABILITY_TYPES.has('replacePearlSlotsBeforeFirstAction')` aufgerufen wird
- **THEN** gibt es `true` zurück

### Requirement: Move `replacePearlSlotsAbility` tauscht alle Perlenkarten gratis
Das System SHALL einen Move `replacePearlSlotsAbility` bereitstellen, der alle 4 offenen Perlenkarten auf den Ablagestapel legt und durch 4 neue ersetzt — ohne `actionCount` zu erhöhen.

#### Scenario: Gratis-Tausch vor erster Aktion
- **WHEN** der aktive Spieler `replacePearlSlotsAbility` aufruft und `actionCount === 0`, Fähigkeit aktiv, Flag noch nicht gesetzt
- **THEN** werden alle `pearlSlots` durch neue Karten ersetzt
- **AND** `actionCount` bleibt unverändert (0)
- **AND** `G.replacePearlSlotsAbilityUsed` wird auf `true` gesetzt

#### Scenario: Move nach erster Aktion abgelehnt
- **WHEN** der Spieler `replacePearlSlotsAbility` aufruft und `actionCount > 0`
- **THEN** gibt das Backend `INVALID_MOVE` zurück

#### Scenario: Move nach bereits genutzter Fähigkeit abgelehnt
- **WHEN** `G.replacePearlSlotsAbilityUsed === true`
- **THEN** gibt das Backend `INVALID_MOVE` zurück

#### Scenario: Move ohne aktive Fähigkeit abgelehnt
- **WHEN** der Spieler die Fähigkeit `replacePearlSlotsBeforeFirstAction` nicht in `activeAbilities` hat
- **THEN** gibt das Backend `INVALID_MOVE` zurück

### Requirement: `G.replacePearlSlotsAbilityUsed` wird pro Zug zurückgesetzt
Das Flag SHALL in `turn.onBegin` auf `false` zurückgesetzt und im Setup auf `false` initialisiert werden.

#### Scenario: Reset zu Zugbeginn
- **WHEN** ein neuer Zug beginnt
- **THEN** ist `G.replacePearlSlotsAbilityUsed === false`

### Requirement: Gratis-Tausch-Button im Canvas vor erster Aktion
Das Frontend SHALL einen speziellen Button anzeigen, wenn der aktive Spieler die Fähigkeit hat, `actionCount === 0` und `G.replacePearlSlotsAbilityUsed === false`.

#### Scenario: Button sichtbar vor erster Aktion
- **WHEN** lokaler Spieler am Zug, `actionCount === 0`, Fähigkeit aktiv, noch nicht genutzt
- **THEN** ist ein Canvas-Button mit Label aus `t('canvas.freePearlReplace')` sichtbar

#### Scenario: Button nach Nutzung nicht mehr sichtbar
- **WHEN** `G.replacePearlSlotsAbilityUsed === true`
- **THEN** wird kein Gratis-Tausch-Button angezeigt

#### Scenario: Button nach erster Aktion nicht mehr sichtbar
- **WHEN** `actionCount > 0`
- **THEN** wird kein Gratis-Tausch-Button angezeigt (normaler Tausch-Button erscheint stattdessen)
