## ADDED Requirements

### Requirement: Austausch-Button unterhalb belegter Portal-Karten
Das Canvas SHALL unterhalb jeder belegten Portal-Karte einen klickbaren Austausch-Button (⇄) rendern, wenn der aktive Spieler die `changeCharacterActions`-Ability in seinen `activeAbilities` hat und `G.actionCount === 0`.

#### Scenario: Button sichtbar bei aktiver Ability vor erster Aktion
- **WHEN** aktiver Spieler hat `changeCharacterActions` in `activeAbilities`, `G.actionCount === 0`, und Portal-Slot `i` ist belegt
- **THEN** wird ein `portal-swap-btn`-Region für Slot `i` unterhalb des Portal-Slots gerendert und das ⇄-Symbol gezeichnet

#### Scenario: Button nicht sichtbar nach erster Aktion
- **WHEN** `G.actionCount > 0`
- **THEN** wird kein `portal-swap-btn` gerendert, auch wenn die Ability aktiv ist

#### Scenario: Button nicht sichtbar ohne Ability
- **WHEN** Spieler hat `changeCharacterActions` NICHT in `activeAbilities`
- **THEN** wird kein `portal-swap-btn` gerendert

#### Scenario: Button nicht sichtbar für leere Portal-Slots
- **WHEN** Portal-Slot `i` ist nicht belegt (`me.portal[i]` ist `undefined`)
- **THEN** wird kein `portal-swap-btn` für Slot `i` gerendert

### Requirement: Klick auf Austausch-Button öffnet SwapDialog
Ein Klick auf den `portal-swap-btn` SHALL den `CharacterSwapDialog` öffnen mit der Portal-Karte des geklickten Slots und den aktuellen `characterSlots` als Auswahloptionen.

#### Scenario: Dialog öffnet sich mit korrekten Daten
- **WHEN** Spieler klickt auf `portal-swap-btn` für Slot `i`
- **THEN** wird `openSwapPortalCharacterDialog(portalCard, portalSlotIndex, tableCards)` aufgerufen mit `portalCard = me.portal[i].card`, `portalSlotIndex = i`, `tableCards = G.characterSlots`
