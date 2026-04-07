## Context

**Bestehendes Payment-System:**
- `PaymentSelection` hat `source: 'hand' | 'ability'`
- `source: 'hand'` konsumiert eine Handkarte; optional mit `abilityType` für Wertmodifikation (z.B. `decreaseWithPearl` fügt `diamondsToSpend += 1` hinzu)
- `source: 'ability'` fügt eine virtuelle Bonuskarte zur virtuellen Hand hinzu
- `remainingDiamondsForValidation = player.diamonds - diamondsToSpend`
- Am Ende: `player.diamonds -= diamondsToSpend`

**Ziel des Tauschs:**
- 1 × 2-Perle konsumieren → effektiv 1 Diamant gewinnen
- Dieser Diamant kann für `decreaseWithPearl` (kostet 1 Diamant) oder Karten-Diamantkosten genutzt werden

## Goals / Non-Goals

**Goals:**
- Tausch findet innerhalb der Aktivierungs-Transaktion statt (atomar).
- Korrekte Validierung: keine 2-Perle verfügbar → Toggle deaktiviert.
- Kombinierbar mit `decreaseWithPearl` und Diamantkosten.

**Non-Goals:**
- Kein separater `tradeForDiamond`-Move-Aufruf mehr nötig für diesen Flow (der bestehende standalone-Move bleibt erhalten, ist aber für diesen Dialog-Flow nicht verwendet).
- Kein Tausch mehrerer 2-Perlen in einer Aktivierung (max. 1 Trade pro Aktivierung, da typischerweise nur eine `tradeTwoForDiamond`-Karte aktiv ist).

## Decisions

### 1. Neuer `source: 'trade'` in PaymentSelection

**Entscheidung:** `PaymentSelection.source` wird um `'trade'` erweitert. Felder: `characterId` (die Karte mit `tradeTwoForDiamond`), `handCardIndex` (die 2-Perle). `value` ist immer `2` (wird nicht für Kostenberechnung genutzt, nur für Konsistenz).

**Begründung:** Konsistent mit dem bestehenden Selections-Pattern. Backend verarbeitet alle Selections in einem Pass. Atomar — entweder die gesamte Aktivierung klappt oder gar nichts.

**Alternativen verworfen:**
- *`tradeForDiamond` vor `activatePortalCard` aufrufen*: Zwei Moves statt einem. Falls `activatePortalCard` danach scheitert (z.B. Validierungsfehler), ist der Diamant bereits dauerhaft getauscht — inkonsistenter Zustand.
- *`source: 'hand'` mit neuem `abilityType: 'tradeTwoForDiamond'`*: Die Semantik ist grundlegend anders (keine virtuelle Handkarte, sondern Diamond-Gain). Eigener Source-Typ ist klarer.

### 2. Backend-Verarbeitungslogik

**Entscheidung:** Neuer `bonusDiamonds`-Zähler parallel zu `diamondsToSpend`:
```
bonusDiamonds++ bei source === 'trade' (nach Validierung)
remainingDiamondsForValidation = player.diamonds - diamondsToSpend + bonusDiamonds
player.diamonds -= (diamondsToSpend - bonusDiamonds)
```
Die 2-Perle wird zu `handIndicesToRemove` hinzugefügt (konsumiert), aber NICHT zur `virtualHand` (sie zählt nicht als Kosten-Perle).

**Validierungen für `source: 'trade'`:**
- Charakter hat `tradeTwoForDiamond` in `abilities`
- `hand[handCardIndex].value === 2`
- `handCardIndex` noch nicht in `handIndicesToRemove`
- Max. 1 Trade-Selection pro Move (Duplikat-Guard)

### 3. Frontend: `virtualDiamonds` als lokaler Dialog-State

**Entscheidung:** Neues `useState<number>(0)` für `virtualDiamonds` im Dialog. Alle Berechnungen die `diamonds` verwenden nutzen `diamonds + virtualDiamonds` statt `diamonds`.

**Begründung:** Kein Game-State-Eingriff nötig. Lokaler State ist ausreichend und sofort reaktiv.

### 4. Auto-Picking der 2-Perle

**Entscheidung:** Beim Toggle ON wird automatisch der erste Index einer 2-Perle aus der Hand gewählt, der noch nicht in `handSelections` ist. Die ausgewählte 2-Perle wird im Dialog visuell als "für Trade reserviert" markiert (gedimmt oder mit Symbol).

**Begründung:** Minimale UX-Komplexität. Der Spieler muss die 2-Perle nicht manuell auswählen.

**Edge case:** Hat der Spieler bereits alle 2-Perlen als `handSelections` für Kosten ausgewählt → Toggle bleibt deaktiviert (keine freie 2-Perle verfügbar).

### 5. `tradeSelection`-State im Dialog

**Entscheidung:** Neues `tradeSelection: { characterId: string; handCardIndex: number } | null` im Dialog-State. Toggle setzt/löscht diesen State.

**Begründung:** Klar separiert von `handSelections` und `abilitySelections`. Beim Zusammenstellen von `allSelections` wird `tradeSelection` als `{ source: 'trade', ... }` hinzugefügt.

## Risks / Trade-offs

- **Diamanten können nicht negativ werden:** `player.diamonds - (diamondsToSpend - bonusDiamonds)` muss `>= 0`. Falls `diamondsToSpend < bonusDiamonds` (mehr Diamanten gewonnen als ausgegeben) bleibt der Rest beim Spieler — korrekt. Backend-Validierung: `player.diamonds + bonusDiamonds >= diamondsToSpend`.
- **2-Perle bereits für Kosten ausgewählt:** Auto-Picking filtert bereits verwendete Hand-Indices — korrekt behandelt.
