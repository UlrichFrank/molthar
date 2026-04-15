## MODIFIED Requirements

### Requirement: Vorschau-Dialog beim Nehmen vom Stapel (Blind-Ziehen)
Das System SHALL vor dem Ausführen des `takeCharacterCard`-Moves vom Stapel einen Dialog öffnen. Standardmäßig wird die Kartenrückseite angezeigt. Hat der Spieler die Fähigkeit `previewCharacter` und ist noch keine Aktion ausgeführt worden, wird der Portal-Dialog geöffnet (statt des einfachen Vorschau-Dialogs).

#### Scenario: Dialog zeigt Rückseite beim Blind-Ziehen
- **WHEN** der Spieler auf den Charakterstapel klickt
- **AND** der Spieler NICHT die Fähigkeit `previewCharacter` hat
- **AND** das Portal des Spielers noch nicht belegt ist
- **THEN** öffnet sich ein Dialog mit der Kartenrückseite sowie einem Bestätigen- und einem Abbrechen-Button

#### Scenario: Dialog zeigt Rückseite bei previewCharacter-Fähigkeit mitten im Zug
- **WHEN** der Spieler auf den Charakterstapel klickt
- **AND** der Spieler die Fähigkeit `previewCharacter` hat
- **AND** mindestens eine Aktion in diesem Zug bereits ausgeführt wurde
- **THEN** öffnet sich ein Dialog mit der Kartenrückseite (nicht Vorderseite) sowie einem Bestätigen- und einem Abbrechen-Button

#### Scenario: Portal-Dialog beim Einsehen vor dem Zug
- **WHEN** der Spieler auf den Charakterstapel klickt
- **AND** der Spieler die Fähigkeit `previewCharacter` hat
- **AND** noch keine Aktion in diesem Zug ausgeführt wurde
- **THEN** öffnet sich der Portal-Dialog mit der Vorderseite der obersten Karte sowie den aktuellen Portal-Slots
- **AND** leere Portal-Slots werden als leere Platzhalter dargestellt
- **AND** ein Abbrechen-Button ist immer sichtbar und aktiv

#### Scenario: Kein zweiter Klick erforderlich bei previewCharacter
- **WHEN** der Spieler die Fähigkeit `previewCharacter` hat und noch keine Aktion ausgeführt hat
- **AND** der Spieler auf den Charakterstapel klickt
- **THEN** öffnet sich der Portal-Dialog sofort mit einem einzigen Klick (kein zweiter Klick nötig)

---

### Requirement: Portal-Dialog zeigt leere Slots als Platzhalter
Das System SHALL im Portal-Dialog (Austausch- und Peek-Dialog) leere Portal-Slots als klickbare Platzhalter darstellen, wenn das Portal des Spielers noch nicht vollständig belegt ist.

#### Scenario: Leerer Slot als Platzhalter dargestellt
- **WHEN** der Portal-Dialog geöffnet ist
- **AND** ein oder beide Portal-Slots des Spielers leer sind
- **THEN** werden die leeren Slots als Platzhalter-Elemente (gleiche Größe wie Karten-Buttons) dargestellt

#### Scenario: Leerer Slot ist klickbar
- **WHEN** der Spieler im Portal-Dialog auf einen leeren Slot-Platzhalter klickt
- **THEN** wird die neue Karte in diesen Slot gelegt (Move `takeCharacterCard(-1)` ohne replacedSlotIndex)

---

### Requirement: Abbrechen beim Peek immer möglich
Das System SHALL im Portal-Dialog beim Peek (previewCharacter, vor erster Aktion) immer einen aktiven Abbrechen-Button anzeigen.

#### Scenario: Abbrechen beim Peek schließt Dialog ohne Move
- **WHEN** der Spieler den Portal-Dialog nach dem Peek öffnet
- **AND** der Spieler auf Abbrechen klickt
- **THEN** wird kein Move ausgeführt, der Dialog schließt sich, und der Spieler kann andere Aktionen ausführen
