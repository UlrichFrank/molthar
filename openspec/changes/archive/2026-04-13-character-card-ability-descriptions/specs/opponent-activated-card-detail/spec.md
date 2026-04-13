## ADDED Requirements

### Requirement: Ability-Erklärungstexte im Charakterkarten-Detaildialog
Das System SHALL im `ActivatedCharacterDetailView` für jede Fähigkeit einer Charakterkarte einen deutschen Erklärungstext anzeigen. Der Text SHALL aus `getAbilityDisplay(ability.type).description` bezogen werden. Wenn kein Text vorhanden ist (unbekannter Typ), SHALL kein leeres Textfeld gerendert werden.

#### Scenario: Bekannte blaue Fähigkeit — Beschreibungstext sichtbar
- **WHEN** die `ActivatedCharacterDetailView` für eine Karte mit einer bekannten blauen Fähigkeit (z.B. `handLimitPlusOne`) geöffnet wird
- **THEN** wird unterhalb des Fähigkeits-Labels ein nicht-leerer Beschreibungstext angezeigt

#### Scenario: Bekannte rote Fähigkeit — Beschreibungstext sichtbar
- **WHEN** die `ActivatedCharacterDetailView` für eine Karte mit einer bekannten roten Fähigkeit (z.B. `threeExtraActions`) geöffnet wird
- **THEN** wird unterhalb des Fähigkeits-Labels ein nicht-leerer Beschreibungstext angezeigt

#### Scenario: Unbekannter Ability-Typ — kein leerer Platzhalter
- **WHEN** eine Karte eine Fähigkeit mit unbekanntem Typ enthält
- **THEN** wird kein leeres `<p>`-Element für die Beschreibung gerendert

### Requirement: abilityDisplayMap enthält Beschreibungen für alle bekannten Typen
`getAbilityDisplay` SHALL für alle 17 bekannten `CharacterAbilityType`-Werte ein nicht-leeres `description`-Feld zurückgeben. Für unbekannte Typen (z.B. `none`) SHALL `description` als leerer String zurückgegeben werden.

#### Scenario: Alle bekannten blauen Typen haben Beschreibung
- **WHEN** `getAbilityDisplay` für jeden bekannten blauen Ability-Typ aufgerufen wird
- **THEN** ist `display.description` nicht leer

#### Scenario: Alle bekannten roten Typen haben Beschreibung
- **WHEN** `getAbilityDisplay` für `threeExtraActions`, `nextPlayerOneExtraAction`, `discardOpponentCharacter`, `stealOpponentHandCard`, `takeBackPlayedPearl` aufgerufen wird
- **THEN** ist `display.description` nicht leer

#### Scenario: Unbekannter Typ gibt leere Beschreibung zurück
- **WHEN** `getAbilityDisplay('none')` aufgerufen wird
- **THEN** ist `display.description` ein leerer String oder nicht gesetzt
