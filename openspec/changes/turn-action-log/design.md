## Context

Das Canvas-Board (`CanvasGameBoard.tsx`) rendert alle Spielelemente in einem `requestAnimationFrame`-Loop. State-Updates kommen als neue `G`-Props von boardgame.io — atomar, ohne Zwischenzustände. Gegnerzüge sind damit nicht nachvollziehbar: mehrere Aktionen (Perle nehmen, Charakter aktivieren, Fähigkeit auslösen) landen als ein einziger State-Sprung.

Das bestehende `card-movement-animations`-Change-Proposal versucht das durch State-Diff-Fluganimationen zu lösen, ist aber anfällig für Race-Conditions, verliert die Aktionsreihenfolge und überwältigt bei gleichzeitigen Moves (z.B. `rehandCards`).

Move-Handler: `takePearlCard`, `takeCharacterCard`, `activatePortalCard`, `replacePearlSlots`, `swapPortalCharacter`, `rehandCards`, `activateSharedCharacter`, `peekCharacterDeck`, `tradeForDiamond`, `endTurn`, `dismissReturnPearlDialog`.

## Goals / Non-Goals

**Goals:**
- Spieler sehen was im aktuellen Zug (eigener + letzter Gegnerzug) passiert ist
- Geänderte Elemente (neue Handkarten, aktivierte Charaktere, PP-Gewinne) werden kurz hervorgehoben
- Keine Fluganimationen — kein State-Diff-Komplexitätsproblem
- Funktioniert für eigene und Gegner-Aktionen gleichermaßen (da serverseitig geloggt)

**Non-Goals:**
- Vollständiger Spielverlauf (kein persistentes History-Feature)
- Detaillierte Replay-Funktion
- Animierte Karten-Flugbahnen
- Geräuscheffekte

## Decisions

### 1. Serverseitiges Log in `GameState`

**Gewählt:** `G.actionLog: ActionLogEntry[]` — jeder Move-Handler schreibt einen Eintrag.

```typescript
interface ActionLogEntry {
  playerId: string;
  type: 'takePearl' | 'takeCharacter' | 'activateCharacter' | 'activateShared'
      | 'replacePearls' | 'swapPortal' | 'rehand' | 'tradeDiamond'
      | 'peekDeck' | 'endTurn';
  cardName?: string;     // z.B. Charakterkartenname bei Aktivierung
  cardValue?: number;    // z.B. Perlwert bei takePearl
  ppGained?: number;     // Powerpoints-Gewinn bei Aktivierung
}
```

Log wird bei Zugwechsel (`turn.onBegin`) **nicht geleert** — damit Mitspieler den Zug des Vorgängers noch sehen können. Es wird auf max. 30 Einträge beschränkt (FIFO).

**Alternative verworfen:** Clientseitiger State-Diff — verliert Aktionsreihenfolge, kann Effekte (PP-Gewinne) nicht zuverlässig ableiten.

### 2. Frontend: Log-Leiste als HTML-Overlay (nicht Canvas)

**Gewählt:** Die Log-Leiste wird als HTML-`div` über dem Canvas gerendert (absolut positioniert), nicht in den Canvas gezeichnet.

```
┌─────────────────────────────────────────────────┐
│              Canvas (Spielfeld)                 │
│                                                 │
│─────────────────────────────────────────────────│
│ 🎴 Hans: Perle-6   ⚡ Hans: Zorro (+2PP)        │ ← HTML div
│ 🎴 Du: Perle-8     ⚡ Du: Pirat aktiviert       │
└─────────────────────────────────────────────────┘
```

Breite: volle Canvas-Breite. Höhe: ~40px (2 Zeilen, scrollbar). Position: unterhalb des Canvas, innerhalb des Spielfeld-Containers.

**Alternative verworfen:** Canvas-`fillText` — schlechte Scrollbarkeit, kein CSS-Styling, kein Copy-Paste für Debugging.

### 3. Highlight-on-Diff via `prevGRef`

**Gewählt:** `prevGRef` wird neben `gRef` gehalten. In `useEffect([G])` wird ein flacher Diff berechnet:
- Neue Handkarten → Highlight-IDs in `highlightedCardsRef`
- Geänderte Portalkarten → Highlight
- Geänderte PP → Zahl kurz animieren (count-up, 400ms)

Highlights werden im rAF-Loop als `rgba(103, 232, 249, 0.35)`-Rechteck über dem betreffenden Element gezeichnet und über 800ms linear zu 0 gefadet.

```typescript
interface HighlightEntry {
  regionId: string;  // z.B. 'hand-2', 'portal-1', 'pp-counter'
  startTime: number;
  duration: number;  // ms, default 800
}
```

**Kein vollständiger Karten-Diff** — nur Array-Länge und IDs vergleichen. Kein Deep-Equal.

### 4. Log-Einträge sind i18n-konform

Log-Strings werden aus TranslationKeys aufgebaut:

```
DE: "Perle-{value} gezogen"  →  "Perle-6 gezogen"
EN: "Drew Pearl {value}"     →  "Drew Pearl 6"
FR: "Perle {value} piochée"  →  "Perle 6 piochée"
```

Jeder `ActionLogEntry.type` bekommt einen TranslationKey. Interpolation über das bestehende `t(key, params)`-System.

### 5. Log-Anzeigestrategie

- Nur letzter abgeschlossener Zug + aktuell laufender Zug sichtbar
- Neue Einträge erscheinen links, ältere rücken nach rechts (horizontaler Scroll, neueste zuerst)
- Nach Zugwechsel: kurze visuelle Trennung (`─── Hans' Zug ───`)
- Max. 30 Einträge in `G.actionLog` (serverseitig), Frontend zeigt max. 10

## Risks / Trade-offs

- **Boardgame.io State-Größe**: `actionLog` vergrößert den serialisierten State. 30 kleine Objekte ≈ 2–5 KB — vernachlässigbar.
- **Highlight-Diff-Falsch-Positives**: Boardgame.io kann neue Array-Referenzen für unveränderte Felder erstellen. Mitigation: Vergleich auf `card.id`-Ebene, nicht Referenz.
- **Gleichzeitige Highlights**: Bei `rehandCards` (alle Handkarten neu) leuchten bis zu 8 Highlights gleichzeitig auf — visuell vertretbar, da dezent.
- **Log-Leiste nimmt Platz**: Auf kleinen Bildschirmen (~375px) konkurriert die Leiste mit Spielinhalten. Mitigation: Leiste kollabierbar (toggle).

## Open Questions

- Soll die Log-Leiste collapsible sein (Toggle-Button)?
- Sollen auch nicht-spielrelevante Ereignisse geloggt werden (z.B. `peekCharacterDeck`)?
- Maximale Anzahl sichtbarer Log-Zeilen: 1 oder 2?
