## Why

Das Spiel soll eine Joker-Perlenkarte erhalten, die als Wildcard jeden beliebigen Perlenwert annehmen kann. Damit wird das Aktivieren von Charakteren mit ungewöhnlichen Kostenkombinationen flexibler und eröffnet neue strategische Optionen.

## What Changes

- Eine neue Perlenkarten-Variante (`isJoker: true`) wird eingeführt: die Joker-Perlenkarte
- Die Joker-Karte kann beim Bezahlen jeden Perlenwert 1–8 annehmen
- Die Nutzung kostet zusätzlich 1 Diamant (wird zusammen mit der Joker-Karte auf den Ablagestapel gelegt)
- Das Bild `PerlenkarteJoker.png` liegt bereits in `assets/`
- Die Karte taucht im Perlenzieh-Stapel auf (analog zu anderen Perlenkarten)
- Das Frontend muss dem Spieler die Wertauswahl beim Einsetzen der Joker-Karte ermöglichen

## Capabilities

### New Capabilities

- `joker-pearl-card`: Joker-Perlenkarte mit Wildcard-Wert und Diamant-Kosten beim Aktivierungsbezahlen

### Modified Capabilities

- `diamond-cost-payment`: Neue Quelle für Diamant-Ausgabe beim Bezahlen (Joker-Nutzung)

## Impact

- `shared/src/game/types.ts` — `PearlCard` bekommt optionales Flag `isJoker`
- `shared/src/game/costCalculation.ts` — Joker-Karte muss als gültiger Wert akzeptiert werden
- `shared/src/game/index.ts` — Validierung in `activatePortalCard` und `activateSharedCharacter`: Diamant-Abzug für Joker-Nutzung
- `game-web/src/components/CharacterActivationDialog.tsx` — Wertauswahl-UI für Joker-Karten
- `assets/cards.json` bzw. Perl-Deck-Generierung: Joker-Karte in den Stapel aufnehmen
- Kein Breaking Change für bestehende Spiele (neue Karte kommt nur in neuen Spielen vor)
