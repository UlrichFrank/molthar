## Context

Der `diamond`-Kostentyp in `CostComponent` existiert bereits in Typsystem und Validierungslogik, ist aber nie vollständig implementiert worden. Captain Hook ist die einzige aktuelle Karte mit diesem Kostentyp. Das Aktivierungs-Ökosystem besteht aus drei Schichten:

1. **Frontend** (`CharacterActivationDialog.tsx`): Spieler wählt Perlen + Abilities aus, `PaymentSelection[]` wird ans Backend gesendet
2. **Validierung** (`costCalculation.ts`, `validateCostPayment`): Prüft ob die Auswahl die Kosten deckt
3. **Backend-Move** (`index.ts`, `activatePortalCard`): Verbraucht Karten und Ressourcen

Diamanten als Kostenbestandteil unterscheiden sich grundlegend von Diamanten als Rabatt (`decreaseWithPearl`): Sie sind ein fixer, zwingend zu zahlender Betrag — keine optionale Modifikation.

## Goals / Non-Goals

**Goals:**
- Spieler kann Karten mit `diamond`-Kostenelementen korrekt aktivieren
- Die exakte Diamantanzahl muss im Dialog bestätigt werden (nicht mehr, nicht weniger)
- Validierung (Frontend + Backend) funktioniert korrekt für alle `diamond`-Kostenelemente
- Datensatz ist konsistent (`value` immer explizit gesetzt)

**Non-Goals:**
- Änderungen an der `decreaseWithPearl`-Ability (anderer Mechanismus)
- Änderungen an `tradeTwoForDiamond` (anderer Mechanismus)
- Neue Diamant-Kostentypen (z.B. "bezahle beliebig viele Diamanten")

## Decisions

### Decision 1: `source: 'diamond'` in PaymentSelection

**Gewählt:** Neue Selektion `{ source: 'diamond', value: number }` in `PaymentSelection`.

**Warum:** Das Backend verarbeitet alle Zahlungen über `allSelections`. Eine explizite `diamond`-Selektion macht die Absicht des Spielers klar und erlaubt dem Backend, die Zahlung zu validieren und abzuziehen — konsistent mit der bestehenden Architektur (`hand`, `ability`, `trade`).

**Alternative verworfen:** Diamond-Kosten implizit aus dem Cost-Array ableiten und automatisch abziehen, ohne Spieler-Bestätigung. Kein explizites UI nötig, aber der Spieler sieht nicht, dass Diamanten verbraucht werden, und ein versehentliches Aktivieren wäre möglich.

### Decision 2: Exakte Bestätigung per Toggle-Button

**Gewählt:** Im Dialog erscheint ein einziger Toggle-Button "1 Diamant bezahlen" (oder entsprechende Anzahl). Der Spieler muss ihn aktivieren; die Validierung schlägt fehl wenn nicht bestätigt.

**Warum:** Diamantkosten sind nicht variabel — es gibt nichts auszuwählen außer "Ja, ich zahle". Ein Counter oder Slider wäre überdimensioniert. Der Toggle macht den Zustand (bezahlt / nicht bezahlt) klar sichtbar.

**Alternative verworfen:** Automatisch bestätigen wenn der Spieler genug Diamanten hat. Verletzt das Prinzip der expliziten Bestätigung — Spieler sollte immer steuern, was er ausgibt.

### Decision 3: `value ?? 1` als Default

**Gewählt:** In Validierung und Backend wird `component.value ?? 1` verwendet statt `component.value || 0`.

**Warum:** `{ type: "diamond" }` ohne `value` bedeutet semantisch "1 Diamant". `|| 0` würde undefined als 0 interpretieren, was falsch ist. `?? 1` gibt den richtigen Default.

**Ergänzend:** `cards.json` wird um `"value": 1` ergänzt, damit der Datensatz explizit und self-documenting ist.

### Decision 4: `>=` statt `===` in `validateDiamondCost`

**Gewählt:** `diamondCount >= requiredDiamonds`

**Warum:** Der Spieler muss genug Diamanten *haben*, um zu bezahlen. Ob er mehr hat, ist irrelevant für die Fähigkeit zur Zahlung — der Abzug erfolgt im Backend. `===` würde Spieler mit "zu vielen" Diamanten blockieren.

## Risks / Trade-offs

- **PaymentSelection-Typ ist shared**: Die Erweiterung um `source: 'diamond'` ändert einen öffentlichen Typ. Backend-Validierungscode, der `source` per exhaustive switch prüft, muss angepasst werden. → Grep nach `source` in `index.ts` und abdecken.
- **Nur eine Karte betroffen**: Das Risiko, anderen Code zu brechen, ist gering — aber `validateCostPayment` und `findCostAssignment` werden von vielen Tests genutzt; ein neuer Testfall für `diamond`-Kosten ist nötig.

## Open Questions

- Soll die neue `diamond`-Sektion im Dialog auch anzeigen, wie viele Diamanten der Spieler nach der Zahlung noch übrig hat? (UX-Nice-to-have, kein Blocker)
