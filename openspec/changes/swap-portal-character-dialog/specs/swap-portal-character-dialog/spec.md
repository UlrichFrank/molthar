## ADDED Requirements

### Requirement: CharacterSwapDialog zeigt Portal-Karte und Auslage-Optionen
Der `CharacterSwapDialog` SHALL die aus dem Portal auszutauschende Karte oben anzeigen, ein ⇄-Symbol in der Mitte, und die verfügbaren Auslage-Charakterkarten unten als auswählbare Optionen.

#### Scenario: Aufbau des Dialogs
- **WHEN** Dialog geöffnet wird mit `portalCard` und 2 `tableCards`
- **THEN** wird `portalCard` oben dargestellt, ⇄ darunter, und beide `tableCards` als anklickbare Kartenbilder unten

#### Scenario: Auswahl einer Auslage-Karte löst Tausch aus
- **WHEN** Spieler klickt auf eine der `tableCards`
- **THEN** wird `moves.swapPortalCharacter(portalSlotIndex, tableSlotIndex)` aufgerufen und der Dialog schließt sich

#### Scenario: Leere characterSlots werden nicht angezeigt
- **WHEN** ein `characterSlot` ist leer (`undefined`)
- **THEN** wird dieser Slot nicht als auswählbare Option dargestellt

### Requirement: Dialog hat einen Cancel-Button
Der `CharacterSwapDialog` SHALL einen Cancel-Button haben, der den Dialog ohne Aktion schließt.

#### Scenario: Cancel schließt Dialog ohne Move
- **WHEN** Spieler klickt auf Cancel
- **THEN** wird kein Move aufgerufen und der Dialog schließt sich

### Requirement: Visuelle Richtung des Tauschs ist erkennbar
Der Dialog SHALL visuell kommunizieren, dass der Tausch bidirektional ist — die Portal-Karte geht in die Auslage, die gewählte Auslage-Karte ins Portal.

#### Scenario: ⇄ Symbol zwischen Portal- und Auslage-Karte
- **WHEN** Dialog angezeigt wird
- **THEN** ist das ⇄-Symbol (oder äquivalentes Austausch-Icon) zwischen der Portal-Karte oben und den Auslage-Karten unten sichtbar
