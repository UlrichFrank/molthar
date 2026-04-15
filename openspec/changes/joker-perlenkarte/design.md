## Context

Perlenkarten haben bisher feste Werte (1–8) und `hasSwapSymbol`/`hasRefreshSymbol` als Sondereigenschaften. Die Joker-Perlenkarte ist eine neue Variante mit Wildcard-Wert, die beim Einsatz 1 Diamant kostet. Die Kostenvalidierung (`costCalculation.ts`) arbeitet mit einer „virtuellen Hand" aus `PearlCard`-Objekten — Joker-Karten müssen dort mit dem vom Spieler gewählten Wert eingetragen werden, damit die existierende Validierungslogik unverändert bleibt.

## Goals / Non-Goals

**Goals:**
- `PearlCard` um optionales `isJoker: boolean` erweitern
- Joker-Karte im `PaymentSelection`-Format als `source: 'hand'` mit `abilityType: 'joker'` übertragen, inkl. gewähltem Wert und `diamondsUsed: 1`
- Backend zieht bei Joker-Einsatz 1 Diamant pro Joker-Karte ab (analog zu `decreaseWithPearl`)
- Frontend zeigt Wert-Picker (1–8) für Joker-Karten; Diamant-Warnung wenn zu wenig Diamanten
- Joker-Karte wird in den Perlen-Stapel aufgenommen (in `pearlDeck` initialisiert)

**Non-Goals:**
- Joker-Karte als Belohnung (nur im normalen Perlen-Stapel)
- Joker-Karte als Grundlage für `takeBackPlayedPearl` (kein Sonderfall nötig)
- Änderung der `costCalculation.ts` — die virtuelle Hand enthält den gewählten Wert, kein Umbau nötig

## Decisions

**PaymentSelection-Format für Joker**
Der Joker wird als `source: 'hand'` mit `abilityType: 'joker'` und `diamondsUsed: 1` übertragen. Der Spieler wählt den gewünschten Wert, der als `value` eingetragen wird.
Alternative: neues `source: 'joker'` — abgelehnt, da es die Verarbeitung im Backend duplizieren würde. Durch Nutzung von `abilityType: 'joker'` läuft der Joker durch denselben Validierungspfad wie `decreaseWithPearl` (Diamantabzug, Wertersatz).

**Joker im Perlen-Deck**
Die Joker-Karte wird beim Setup-Shuffle einmalig (oder mehrfach, je nach Spielbalance-Entscheidung) in `pearlDeck` eingefügt. Vorläufig: 2 Joker-Karten im Deck.

**Keine Änderung an costCalculation.ts**
Die virtuelle Hand enthält beim Joker den vom Spieler gewählten Wert. `validateCostPayment` sieht keinen Joker, nur eine normale Perlenkarte mit Wert X. Das verhindert Komplexität in der Kostenlogik.

**Diamantabzug-Pfad**
Analog zu `decreaseWithPearl`: `diamondsToSpend += 1` pro Joker-Auswahl. Nach der Kostenvalidierung werden die Diamanten ausgegeben. Kein separater Validierungsschritt nötig.

## Risks / Trade-offs

- [Joker und `decreaseWithPearl` gleichzeitig] → Diamantvorrat kann schnell erschöpft sein; keine Regel dagegen, ist akzeptiertes Spielverhalten.
- [Joker und `usedPaymentAbilityTypes`] → `'joker'` muss als Typ NICHT in die einmalige Nutzungssperre, da Joker-Karten physisch aus der Hand verschwinden. Jede Joker-Karte darf eingesetzt werden, sofern Diamanten vorhanden.
- [Balancing] → 2 Joker-Karten im Deck ist ein erster Wert; Anzahl kann jederzeit in der Initialisierung angepasst werden.
