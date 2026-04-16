## Context

`takePearlCard` enthält nach dem eigentlichen Zug eine proaktive Reshuffle-Logik, die den Ablagestapel sofort neu mischt, bevor der nächste Spieler an die Reihe kommt. Diese Logik hat einen Guard `filledSlots >= 4`, der den Reshuffle verhindert wenn noch leere Slots existieren. Das führt dazu, dass der Deck leer bleibt und der Spieler keine verdeckte Karte ziehen kann.

## Decisions

**Guard entfernen, nicht ersetzen**

Die `drawCard`-Funktion reshuffelt bereits on-demand (wenn deck leer und discard nicht leer). Der proaktive Reshuffle ist eine UX-Optimierung: der Stapel soll bereits neu gemischt sein bevor der nächste Spieler zieht, damit kein "Überraschungs-Reshuffle" mitten in einer Aktion passiert.

Der Fix: `filledSlots`-Berechnung und die `>= 4`-Bedingung einfach entfernen.

```typescript
// VORHER (Slot-Zug, Zeile ~126):
const filledSlots = G.pearlSlots.filter(c => c !== null).length;
if (G.pearlDeck.length === 0 && G.pearlDiscardPile.length > 0 && filledSlots >= 4) {

// NACHHER:
if (G.pearlDeck.length === 0 && G.pearlDiscardPile.length > 0) {
```

Identische Änderung für den Deck-Zug (~Zeile 145).

**Andere Stellen unberührt**

`doReplacePearlSlots`, `rehandCards` und alle anderen Stellen nutzen `drawCard` direkt — dort reshuffelt die Funktion on-demand korrekt. Kein Handlungsbedarf.
