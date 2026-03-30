## ADDED Requirements

### Requirement: tradeTwoForDiamond-Karte erscheint in der Fähigkeiten-Sektion
Im `CharacterActivationDialog` SHALL ein aktivierter Charakter mit der `tradeTwoForDiamond`-Ability in der Fähigkeiten-Sektion angezeigt werden, wenn der Spieler diese Ability aktiv hat.

#### Scenario: Karte erscheint in Fähigkeiten-Sektion
- **WHEN** `activatedCharacters` einen Charakter mit `tradeTwoForDiamond`-Ability enthält
- **THEN** wird dieser Charakter in der Fähigkeiten-Sektion des Dialogs angezeigt

### Requirement: Toggle-Button aktiviert und deaktiviert den Tausch
Neben dem Charakter mit `tradeTwoForDiamond` SHALL ein Toggle-Button angezeigt werden. Aktivieren des Toggles SHALL `virtualDiamonds += 1` bewirken und eine verfügbare 2-Perle aus der Hand als "für Trade reserviert" markieren. Deaktivieren SHALL `virtualDiamonds -= 1` und die Reservierung aufheben.

#### Scenario: Toggle ON — virtualDiamonds erhöht sich
- **WHEN** Spieler klickt den Toggle-Button (OFF → ON) und mind. eine nicht-selektierte 2-Perle ist in der Hand
- **THEN** wird `virtualDiamonds += 1`, der erste freie 2-Perle-Index wird als `tradeSelection` gespeichert, und die entsprechende Handkarte wird visuell als reserviert markiert

#### Scenario: Toggle OFF — virtualDiamonds verringert sich
- **WHEN** Spieler klickt den Toggle-Button (ON → OFF)
- **THEN** wird `virtualDiamonds -= 1` und `tradeSelection` wird auf `null` gesetzt

#### Scenario: Toggle deaktiviert wenn keine 2-Perle verfügbar
- **WHEN** alle 2-Perlen in der Hand bereits in `handSelections` verwendet werden ODER keine 2-Perle in der Hand ist
- **THEN** ist der Toggle-Button deaktiviert (nicht klickbar)

### Requirement: virtualDiamonds fließen in Kostenvalidierung ein
Der Dialog SHALL `diamonds + virtualDiamonds` überall dort verwenden, wo `diamonds` für `isValidPayment` und für die Verfügbarkeit von `decreaseWithPearl` geprüft wird.

#### Scenario: Validierung mit virtuellem Diamant
- **WHEN** `virtualDiamonds === 1` und Karte hat Diamant-Kosten von 1, aber `player.diamonds === 0`
- **THEN** zeigt `isValidPayment` `true` an (virtueller Diamant deckt den Bedarf)

#### Scenario: decreaseWithPearl nutzbar mit virtuellem Diamant
- **WHEN** `virtualDiamonds === 1` und `player.diamonds === 0`
- **THEN** ist der `−1 💎`-Button für `decreaseWithPearl` aktiv (nicht ausgegraut)

### Requirement: Trade-Selection wird beim Absenden übermittelt
Beim Klick auf "Activate" SHALL `allSelections` eine `{ source: 'trade', characterId, handCardIndex, value: 2 }`-Selection enthalten, wenn `tradeSelection !== null`.

#### Scenario: Trade-Selection in allSelections
- **WHEN** Trade-Toggle ON ist und Spieler klickt "Activate"
- **THEN** enthält das übermittelte Selections-Array einen Eintrag mit `source: 'trade'`

#### Scenario: Keine Trade-Selection ohne Toggle
- **WHEN** Trade-Toggle OFF ist
- **THEN** enthält `allSelections` keinen `source: 'trade'`-Eintrag
