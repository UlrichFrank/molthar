## ADDED Requirements

### Requirement: PaymentSelection unterstützt source 'trade'
`PaymentSelection.source` SHALL den Wert `'trade'` annehmen können. Eine Trade-Selection SHALL `characterId` (Charakter mit `tradeTwoForDiamond`) und `handCardIndex` (die 2-Perle) enthalten.

#### Scenario: Trade-Selection im Typ definiert
- **WHEN** eine `PaymentSelection` mit `source: 'trade'` erstellt wird
- **THEN** sind `characterId` und `handCardIndex` die relevanten Felder; `value` ist `2`

### Requirement: activatePortalCard verarbeitet Trade-Selections korrekt
`activatePortalCard` SHALL `source: 'trade'`-Selections verarbeiten: die 2-Perle konsumieren und die effektiven Diamanten für Validierung um 1 erhöhen.

#### Scenario: 2-Perle wird konsumiert und Diamant virtuell gutgeschrieben
- **WHEN** `activatePortalCard` mit einer `source: 'trade'`-Selection aufgerufen wird, und der Charakter hat `tradeTwoForDiamond`, und `hand[handCardIndex].value === 2`
- **THEN** wird die 2-Perle zu den konsumierten Karten gezählt (nicht zur virtualHand), und `remainingDiamonds` für die Kostenvalidierung erhöht sich um 1

#### Scenario: No-op bei ungültigem Trade (kein 2-Wert)
- **WHEN** `activatePortalCard` mit `source: 'trade'` aufgerufen wird, aber `hand[handCardIndex].value !== 2`
- **THEN** gibt der Move `INVALID_MOVE` zurück

#### Scenario: No-op wenn Charakter die Ability nicht hat
- **WHEN** `activatePortalCard` mit `source: 'trade'` aufgerufen wird, aber der angegebene Charakter hat keine `tradeTwoForDiamond`-Ability
- **THEN** gibt der Move `INVALID_MOVE` zurück

#### Scenario: 2-Perle kann nicht doppelt verwendet werden
- **WHEN** ein `handCardIndex` sowohl in einer `source: 'hand'`-Selection als auch in einer `source: 'trade'`-Selection vorkommt
- **THEN** gibt der Move `INVALID_MOVE` zurück

#### Scenario: Tausch-Diamant deckt decreaseWithPearl-Kosten
- **WHEN** ein Trade verwendet wird und `diamondsToSpend === 1` (z.B. ein `decreaseWithPearl`), aber `player.diamonds === 0`
- **THEN** ist die Aktivierung valid, weil `bonusDiamonds === 1` den Diamantbedarf deckt

### Requirement: activateSharedCharacter verarbeitet Trade-Selections analog
`activateSharedCharacter` SHALL dieselbe `source: 'trade'`-Logik wie `activatePortalCard` implementieren.

#### Scenario: Trade in SharedCharacter-Aktivierung
- **WHEN** `activateSharedCharacter` mit einer gültigen `source: 'trade'`-Selection aufgerufen wird
- **THEN** verhält sich die Verarbeitung identisch zu `activatePortalCard`
