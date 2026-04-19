## ADDED Requirements

### Requirement: Spieler konfiguriert NPC-Slots beim Match-Erstellen
Die Lobby SHALL dem Spieler erlauben, für jeden Spieler-Slot zu wählen ob es ein Mensch oder ein NPC ist. Für NPC-Slots wird eine Strategie gewählt. Es MUSS mindestens 1 menschlicher Spieler geben. Die Gesamtzahl (Mensch + NPC) MUSS zwischen 2 und 5 liegen.

#### Scenario: NPC-Slot hinzufügen
- **WHEN** Spieler die Gesamtspielerzahl auf 3 setzt und Slot 2 auf NPC stellt
- **THEN** erscheint ein Strategie-Dropdown für Slot 2 mit den 5 Strategien

#### Scenario: Strategie wählen
- **WHEN** Spieler im Strategie-Dropdown "Weiser Wendelin (efficient)" wählt
- **THEN** wird diese Strategie für den NPC-Slot gespeichert und beim Erstellen übergeben

#### Scenario: Mindestens 1 Mensch erzwingen
- **WHEN** Spieler versucht alle Slots auf NPC zu stellen
- **THEN** ist der "Erstellen"-Button deaktiviert und ein Hinweis erscheint

#### Scenario: NPC-Slots auto-gejoint
- **WHEN** Spieler auf "Erstellen" klickt und ein NPC-Slot konfiguriert ist
- **THEN** werden NPC-Slots automatisch mit dem NPC-Namen gejoint bevor der WaitingRoom angezeigt wird

### Requirement: WaitingRoom wartet nur auf menschliche Spieler
Der WaitingRoom SHALL nur zählen wie viele menschliche Spieler-Slots belegt sind. NPC-Slots gelten als sofort belegt.

#### Scenario: Sofortstart bei nur einem menschlichen Spieler
- **WHEN** Match hat 1 Mensch + 2 NPCs und der Mensch ist gejoint
- **THEN** wechselt der WaitingRoom sofort ins Spiel ohne auf weitere Joins zu warten

#### Scenario: Warten auf zweiten Mensch
- **WHEN** Match hat 2 Menschen + 1 NPC und erst 1 Mensch ist gejoint
- **THEN** wartet der WaitingRoom auf den zweiten menschlichen Spieler

### Requirement: NPC-Strategienamen sind im Lobby sichtbar
Die Lobby SHALL für NPC-Slots den Fantasy-Namen und die Strategie-Bezeichnung anzeigen.

#### Scenario: Strategie-Anzeige im Dropdown
- **WHEN** Spieler das Strategie-Dropdown öffnet
- **THEN** werden alle 5 Strategien mit Fantasy-Name und kurzem Descriptor angezeigt:
  Irrnis (Zufall), Gier von Goldbach (Opportunist), Edelstein-Erda (Diamanten),
  Weiser Wendelin (Effizient), Raubritter Ralf (Aggressiv)
