## ADDED Requirements

### Requirement: Aufgedeckte Karte wird face-up auf dem Stapel gerendert
Wenn `me.peekedCard` gesetzt ist, SHALL die oberste Karte des Charakter-Nachziehstapels mit ihrer Vorderseite (Kartenname und Kartenbild) statt der Rückseite gerendert werden.

#### Scenario: Top-Karte zeigt Vorderseite im Preview-Zustand
- **WHEN** `me.peekedCard` ist eine gültige `CharacterCard`
- **THEN** wird die oberste Karte des Charakter-Deck-Stacks mit `drawImageOrFallback` und dem Kartenbild der aufgedeckten Karte gerendert, alle anderen Karten darunter zeigen weiterhin die Rückseite

#### Scenario: Normales Rendering ohne Preview
- **WHEN** `me.peekedCard` ist `null` oder `undefined`
- **THEN** rendert der Charakter-Stapel alle Karten mit der Rückseite (`'Charakterkarte Hinten.png'`), kein Unterschied zum bisherigen Verhalten

### Requirement: Visueller Hinweis auf zweiten Klick
Wenn eine Karte aufgedeckt ist, SHALL ein kurzer Canvas-Text neben/unter dem Deck angezeigt werden, der den Spieler informiert dass ein weiterer Klick die Karte nimmt.

#### Scenario: Hinweistext im Preview-Zustand
- **WHEN** `me.peekedCard` ist gesetzt und der lokale Spieler ist der aktive Spieler
- **THEN** wird ein Label (z.B. "Klick zum Nehmen") als Canvas-Text nahe dem Charakter-Deck gerendert

#### Scenario: Kein Hinweistext ohne Preview
- **WHEN** `me.peekedCard` ist `null` oder `undefined`
- **THEN** wird kein zusätzlicher Hinweistext gerendert
