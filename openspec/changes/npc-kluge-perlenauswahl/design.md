## Context

Bots wählen Perlen aktuell über `scoredPearlSlots()` aus `botPearlScorer.ts`. Das Signal "Helpfulness" (wie viel hilft diese Perle meiner Zielkarte?) ist für fast alle Perlen 0, weil `estimateEffort` keinen Teilfortschritt erkennt — es zählt nur ob die Karte komplett zahlbar ist oder nicht. Urgency (Seltenheit im Deck) wird so zum Haupttreiber, was zu scheinbar zufälligen Entscheidungen führt. Aktive blaue Fähigkeiten (z.B. `onesCanBeEights`) sind nirgends in der Bot-Logik berücksichtigt.

## Goals / Non-Goals

**Goals:**
- Bots wählen nur Perlen die für ihre Portal-Karten nützlich sind (oder als Fallback seltene Perlen)
- Handlimit-Bewusstsein: volle Hand → Perle nur nehmen wenn sie eine nutzlose Handkarte ersetzt
- Aktive blaue Fähigkeiten ändern was als "nützlich" gilt
- Alle Kostentypen korrekt behandelt (number, nTuple, run, evenTuple, oddTuple, sumAnyTuple, sumTuple, diamond)

**Non-Goals:**
- Kein Lookahead über mehrere Züge
- Keine Änderung der Charakterkarten-Auswahl oder Aktivierungslogik
- Keine neuen Bot-Persönlichkeiten

## Decisions

### D1: `computeNeededValues` als Set — nicht als Score

**Entscheidung:** Die Funktion gibt `Set<PearlCard['value']>` zurück — eine Menge von Werten (1–8) die noch gebraucht werden. Kein graduierter Score.

**Rationale:** "Brauche ich diesen Wert?" ist eine binäre Frage, kein Kontinuum. Ein Set ist einfacher zu testen, zu verstehen und zu debuggen. Scoring (urgency, contestedness) bleibt als sekundäres Signal im `botPearlScorer` erhalten für den Tiebreaker unter nützlichen Perlen.

### D2: Alle Portal-Karten als Union — nicht eine Zielkarte

**Entscheidung:** `computeNeededValues` nimmt ALLE Portal-Karten und gibt die Vereinigung der fehlenden Werte zurück.

**Rationale:** Eine Perle die für Karte A nichts bringt aber für Karte B entscheidend ist, ist trotzdem nützlich. Bots sollen keine Perlen ablehnen, die ihren Gesamtfortschritt verbessern.

### D3: Kostentyp-spezifische Missing-Value-Logik

Pro Kostentyp wird berechnet, welche Perlenwerte den nächsten Fortschrittsschritt ermöglichen:

```
number(X):        {X}                       wenn X noch nicht auf Hand
nTuple(n, X):     {X}                       wenn weniger als n×X auf Hand
evenTuple(n):     {2,4,6,8}                 wenn weniger als n gerade Werte
oddTuple(n):      {1,3,5,7}                 wenn weniger als n ungerade Werte
run(length):      fehlende Lücken           in der längsten fast-vollständigen Folge
sumAnyTuple(sum): {sum - partialSum}        wenn partialSum ≤ sum und (sum - partialSum) ∈ 1–8
sumTuple(n, sum): wie sumAnyTuple           mit zusätzlichem n-Constraint
diamond:          {} (leer)                 Perlen helfen hier nicht
```

Für `run`: Suche die Folge der Länge `length` die mit der aktuellen Hand am meisten überlappt. Die fehlenden Positionen dieser Folge sind die benötigten Werte.

Für `sumAnyTuple`/`sumTuple`: Greedy-Ansatz — berechne was die vorhandenen Perlen bereits summieren (für die Karte), was noch fehlt ist der Rest.

### D4: Ability-Modifikationen als Post-Processing

**Entscheidung:** Fähigkeiten werden NACH der Basisberechnung angewendet — sie reduzieren die needed-Set.

```
onesCanBeEights:         wenn {8} in needed und 1 auf Hand → entferne 8 aus needed
threesCanBeAny:          für jede 3 auf Hand → entferne einen beliebigen Wert aus needed
decreaseWithPearl:       wenn Diamant vorhanden: für jeden Wert X in needed → füge X+1 hinzu
numberAdditionalCard(V): entferne V aus needed (virtueller Wert schon vorhanden)
anyAdditionalCard:       entferne einen beliebigen Wert aus needed (Wildcard)
```

**Rationale:** Separation of concerns — Basis-Berechnung unabhängig von Abilities, leichter zu testen.

### D5: Pearl-Entscheidungsmodell in Bots (Prioritätsreihenfolge)

```
1. Kandidaten = pearlSlots deren Wert in neededValues ist
2. Falls Kandidaten vorhanden:
     Softmax unter Kandidaten (Tiebreaker: urgency-Score aus botPearlScorer)
3. Falls keine Kandidaten:
   a. Hand voll (>= handLimit) → replacePearlSlots
   b. Hand nicht voll, urgency > 0.6 (seltene Perle) → trotzdem nehmen (futureProofing)
   c. Sonst → replacePearlSlots oder endTurn (je nach verbleibenden Aktionen)
4. Handlimit-Check (falls Hand voll und Kandidat gefunden):
     Prüfe: hat Hand eine "nutzlose" Karte (Wert nicht in neededValues)?
     Falls ja → Perle nehmen ist trotzdem sinnvoll (ersetzt nutzlose Karte)
     Falls nein (alle Handkarten nützlich) → replacePearlSlots statt nehmen
```

### D6: IrrnisBot (random) — minimale Änderung

IrrnisBot bleibt überwiegend zufällig. Einzige Ergänzung: er nimmt keine Perle wenn Hand voll UND keine der Handkarten nutzlos ist (würde sonst eine nützliche Karte wegwerfen).

## Risks / Trade-offs

**[computeNeededValues für run/sumAnyTuple ist approximativ]** → Für komplexe Kostentypen gibt es mehrere mögliche "Pfade zur Zahlung". Die Funktion wählt den greedy-besten. Das kann gelegentlich suboptimal sein, ist aber konsistent und verständlich.

**[Bots nehmen weniger Perlen → kürzere Züge]** → Wenn der Markt keine nützlichen Perlen hat und Hand voll ist, endet ein Bot früher. Das ist korrekt — lieber kurzer Zug als nutzlose Perle.

**[replacePearlSlots könnte Gegner helfen]** → Perlenmarkt neu aufdecken kann auch für Gegner nützlich sein. Der Bot schaut das nicht an. Akzeptiertes Trade-off für Einfachheit.

## Migration Plan

Reine Logikänderung in `shared/` und `backend/`. Server-Neustart nach Build. Kein persistierter Zustand betroffen.
