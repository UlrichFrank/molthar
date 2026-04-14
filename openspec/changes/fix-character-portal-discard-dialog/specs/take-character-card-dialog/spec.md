## MODIFIED Requirements

### Requirement: Move wird erst nach Bestätigung ausgelöst
Das System SHALL nach Bestätigung des Charakterkarten-Holens den Dialog **zuverlässig schließen**, unabhängig davon ob sich der Game-State zwischen Öffnen und Bestätigen des Dialogs geändert hat.

#### Scenario: Dialog schließt nach Bestätigung (Auslage, Portal hat Platz)
- **WHEN** der Spieler im Vorschau-Dialog den Bestätigen-Button drückt
- **THEN** wird der `takeCharacterCard`-Move ausgeführt und der Dialog geschlossen
- **AND** der Dialog bleibt auch nach State-Update geschlossen

#### Scenario: Abbrechen schließt Dialog ohne Move
- **WHEN** der Spieler im Vorschau-Dialog den Abbrechen-Button drückt
- **THEN** wird kein Move ausgeführt und der Dialog geschlossen

### Requirement: Austauschdialog — Verwerfen schließt Dialog zuverlässig
Der Austauschdialog (CharacterReplacementDialog) SHALL nach dem Klick auf "Verwerfen" den Dialog schließen und den `discardPickedCharacterCard`-Move mit dem **beim Öffnen des Dialogs gespeicherten Slot-Index** aufrufen — nicht mit einem nachträglich ermittelten Index über `G.characterSlots`.

#### Scenario: Verwerfen schließt Dialog (Portal voll, Auslage-Karte)
- **WHEN** der Spieler im Austauschdialog auf "Verwerfen" klickt
- **THEN** wird `discardPickedCharacterCard` mit dem korrekten Slot-Index aufgerufen
- **AND** der Dialog schließt sich unmittelbar
- **AND** der Dialog öffnet sich nach dem State-Update nicht erneut

#### Scenario: Karte ersetzen schließt Dialog (Portal voll, Auslage-Karte)
- **WHEN** der Spieler im Austauschdialog eine Portal-Karte zum Ersetzen auswählt
- **THEN** wird `takeCharacterCard` mit dem korrekten Slot-Index und `replacedSlotIndex` aufgerufen
- **AND** der Dialog schließt sich unmittelbar
