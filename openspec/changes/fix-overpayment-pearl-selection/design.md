## Context

`CharacterActivationDialog` baut aus den ausgewählten Handkarten eine `virtualHand` auf und ruft `validateCostPayment(cost, virtualHand, diamonds)` auf. Diese Funktion prüft nur, ob die übergebene Hand die Kosten *erfüllen kann* — nicht ob sie exakt passt. Wählt der Spieler z. B. für Kosten `[{type:'number', value:3}]` sowohl eine 3er- als auch eine 5er-Perle aus, ist die Validation trotzdem `true`. Beim Klick auf "Aktivieren" werden alle ausgewählten Karten (inkl. der 5er-Perle) aus der Hand entfernt.

Das Backend (`activatePortalCard`) vertraut der Auswahl des Frontends und konsumiert ebenfalls alle übergebenen `PaymentSelection`-Einträge.

## Goals / Non-Goals

**Goals:**
- Aktivierungs-Button deaktivieren, sobald eine Karte in der Auswahl vorliegt, die ohne Verlust der Kostenerfüllung entfernt werden könnte
- Fehlermeldung im Dialog: "Zu viele Karten ausgewählt"
- Backend-Absicherung: `activatePortalCard` lehnt Auswahlen ab, bei denen eine Karte ohne Kostenerfüllung weggelassen werden könnte

**Non-Goals:**
- Automatische Minimierung der Auswahl (der Spieler soll selbst wählen, nicht das System)
- Änderungen an `validateCostPayment` selbst (nur neue Hilfsfunktion drumherum)

## Decisions

### 1. Überzahlungs-Erkennung via "Leave-one-out"-Check

```typescript
// shared/src/game/costCalculation.ts
export function hasUnnecessarySelection(
  cost: CostComponent[],
  hand: PearlCard[],
  diamonds: number
): boolean {
  for (let i = 0; i < hand.length; i++) {
    const reduced = hand.filter((_, idx) => idx !== i);
    if (validateCostPayment(cost, reduced, diamonds)) return true;
  }
  return false;
}
```

**Warum Leave-one-out statt exakter Minimierung:** Das Kostsystem ist kombinatorisch (Runs, Tuples, Sums). Eine exakte Minimierung wäre NP-schwer. Leave-one-out ist O(n · validate) und für max. 5+1 Handkarten schnell genug. Es erkennt alle einfachen Überzahlungen zuverlässig.

**Alternative verworfen:** Nur auf Gesamtwert prüfen — funktioniert nicht für strukturierte Kosten wie Runs oder Tuples.

### 2. Frontend: `isValidPayment` erweitern

```typescript
const isValidPayment = useMemo(() => {
  if (!selectedCharacter) return false;
  if (totalDiamondCost > 0 && !diamondCostConfirmed) return false;
  const virtualHand = /* wie bisher */;
  if (!validateCostPayment(selectedCharacter.cost, virtualHand, diamonds)) return false;
  if (hasUnnecessarySelection(selectedCharacter.cost, virtualHand, diamonds)) return false;
  return true;
}, [...]);
```

Button-Label bleibt "Ungültige Zahlung" bei `!isValidPayment`. Ein separater Hinweis im Dialog zeigt bei Überzahlung "Zu viele Karten ausgewählt" an.

### 3. Backend-Absicherung

In `activatePortalCard`: nach der bestehenden `validateCostPayment`-Prüfung zusätzlich `hasUnnecessarySelection` aufrufen → `INVALID_MOVE` bei Überzahlung. Diese Prüfung ist Defense-in-depth; das Frontend verhindert den Fall bereits.

## Risks / Trade-offs

- **Leave-one-out ist kein exakter Überzahlungsnachweis:** Bei sehr komplexen Kosten könnten theoretisch zwei redundante Karten zusammen notwendig wirken, einzeln aber nicht. In der Praxis mit max. 5 Handkarten und den vorliegenden Kostentypen ist das nicht zu erwarten.
- **Diamond-Selections werden nicht berücksichtigt:** Die `diamond`-Source-Einträge werden bereits vor der virtualHand-Erstellung gefiltert — kein Änderungsbedarf.
