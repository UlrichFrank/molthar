# Diamond Cost Payment

## Overview

Some character cards (e.g., Captain Hook) have `diamond`-type cost components in addition to pearl costs. This capability defines the full payment flow for such cards: validation, UI confirmation, and backend deduction.

## Requirements

### Requirement: Diamant-Kostenelement im Aktivierungsdialog bestätigen
Der Aktivierungsdialog SHALL eine separate Sektion anzeigen, wenn die zu aktivierende Karte einen `diamond`-Kostenbestandteil hat. Der Spieler MUSS die exakte Anzahl Diamanten explizit bestätigen. Ohne Bestätigung bleibt der Aktivieren-Button deaktiviert.

#### Scenario: Dialog zeigt Diamantkosten an
- **WHEN** der Spieler einen Charakter mit `diamond`-Kostenbestandteil aktivieren möchte
- **THEN** zeigt der Dialog eine Sektion "Diamanten bezahlen" mit der benötigten Anzahl und der verfügbaren Anzahl
- **AND** ein Toggle-Button ermöglicht die Bestätigung der Zahlung

#### Scenario: Aktivieren-Button bleibt inaktiv ohne Diamant-Bestätigung
- **WHEN** der Spieler die erforderlichen Perlen ausgewählt hat, aber die Diamantzahlung nicht bestätigt hat
- **THEN** bleibt der Aktivieren-Button deaktiviert

#### Scenario: Aktivieren-Button wird aktiv nach vollständiger Zahlung
- **WHEN** der Spieler die erforderlichen Perlen ausgewählt hat UND die Diamantzahlung bestätigt hat
- **THEN** wird der Aktivieren-Button aktiv

#### Scenario: Spieler hat nicht genug Diamanten
- **WHEN** der Spieler weniger Diamanten hat als die Karte kostet
- **THEN** ist der Diamant-Toggle-Button deaktiviert
- **AND** der Aktivieren-Button bleibt inaktiv

#### Scenario: Diamant-Toggle kann deaktiviert werden
- **WHEN** der Spieler die Diamantzahlung bestätigt hat
- **AND** er den Toggle-Button erneut klickt
- **THEN** wird die Bestätigung zurückgenommen
- **AND** der Aktivieren-Button wird wieder inaktiv

### Requirement: Diamant-Kostenelement in PaymentSelection übertragen
Wenn der Spieler eine Aktivierung mit Diamantkosten bestätigt, MUSS die `PaymentSelection`-Liste einen Eintrag mit `source: 'diamond'` und dem korrekten `value` enthalten.

#### Scenario: PaymentSelection enthält diamond-Eintrag
- **WHEN** der Spieler einen Charakter mit 1 Diamant Kosten aktiviert und die Zahlung bestätigt
- **THEN** enthält `allSelections` einen Eintrag `{ source: 'diamond', value: 1 }`

### Requirement: Backend zieht Diamanten gemäß diamond-Kostenelementen ab
Das Backend SHALL beim Aktivieren eines Charakters mit `diamond`-Kostenelementen die korrekte Anzahl Diamanten vom Spieler abziehen.

#### Scenario: Korrekte Diamantenanzahl wird abgezogen
- **WHEN** ein Spieler einen Charakter mit `{ type: 'diamond', value: 1 }` Kostenbestandteil aktiviert
- **THEN** wird `player.diamondCards` um genau 1 Karte verringert (geht in `characterDiscardPile`)

#### Scenario: Fehlender value-Default
- **WHEN** ein `diamond`-Kostenelement kein `value`-Feld hat
- **THEN** wird der Default-Wert 1 angenommen

### Requirement: Validierung prüft ausreichende Diamantanzahl
`validateDiamondCost` SHALL prüfen, ob der Spieler mindestens so viele Diamanten hat wie gefordert (`>=`), nicht exakt gleich viele.

#### Scenario: Spieler hat genau die benötigte Anzahl
- **WHEN** der Spieler genau 1 Diamant hat und die Karte 1 Diamant kostet
- **THEN** gibt `validateDiamondCost` `true` zurück

#### Scenario: Spieler hat mehr als die benötigte Anzahl
- **WHEN** der Spieler 3 Diamanten hat und die Karte 1 Diamant kostet
- **THEN** gibt `validateDiamondCost` `true` zurück

#### Scenario: Spieler hat zu wenig Diamanten
- **WHEN** der Spieler 0 Diamanten hat und die Karte 1 Diamant kostet
- **THEN** gibt `validateDiamondCost` `false` zurück
