# Code Review: Portale von Molthar

**Datum:** 2026-03-27
**Reviewer:** Staff Engineer Review (Claude Sonnet 4.6)
**Scope:** Vollständige Codebase — shared, backend, game-web

---

## Executive Summary

Die Gesamtarchitektur (boardgame.io Monorepo, shared Game Logic, Canvas-Frontend) ist solide. Die Spiellogik in `shared/` ist gut strukturiert und gut getestet. Die kritischsten Probleme liegen im Frontend: Debug-Code in Produktion, God Components, fehlende Env-Konfiguration und mehrfach duplizierte Logik.

---

## 1. Code Quality Assessment

### Kritische Befunde

#### Debug-Code in Produktion

**`game-web/src/components/CharacterActivationDialog.tsx:24-47`**

`console.group` / `console.debug` direkt im Render-Body — läuft bei **jedem Re-Render**:

```tsx
// Wird bei jedem Render ausgeführt:
console.group('[CharacterActivationDialog] Component loaded/updated');
console.debug('Props:', { availableCharactersCount, handSize, diamonds, portalSlotIndex });
// ... nochmals im useMemo (Zeilen 50-68)
```

**`shared/src/game/index.ts:322-354`** — Move `discardCardsForHandLimit` hat 6 `console.log` Statements:

```ts
console.log('discardCardsForHandLimit called:', { selectedCardIndices, ... });
console.log('Move rejected: no player or requiresHandDiscard is false');
console.log('Move rejected: card count mismatch', { ... });
// ... 3 weitere
```

#### Duplizierte Funktion im gleichen File

**`game-web/src/components/CanvasGameBoard.tsx`** — `handleEndTurn` (Zeile 399) ist identisch mit `handleButtonClick → case 'end-turn'` (Zeile 342):

```ts
// Zeile 342–352
case 'end-turn':
  if (moves.endTurn) { moves.endTurn(); }

// Zeile 399–406 — exakt dasselbe
const handleEndTurn = () => {
  if (moves.endTurn) { moves.endTurn(); }
};
```

#### Duplizierter Kommentar

**`CanvasGameBoard.tsx:132-135`** — Copy-Paste eines JSDoc-Kommentars:

```ts
/**
 * Konvertiere CSS-Koordinaten zu Model-Koordinaten
/**
 * Konvertiere CSS-Koordinaten zu Model-Koordinaten  ← dupliziert
 */
```

#### Fragile ID-Generierung

**`shared/src/game/index.ts:162`**:

```ts
id: `${player.id}-${Date.now()}-${Math.random()}`
```

`Math.random()` ist nicht kollisionssicher. boardgame.io arbeitet mit deterministischem State — diese ID-Generierung bricht potentiell Replays und Snapshots.

#### Defensiver Null-Check für garantiertes Feld

**`shared/src/game/index.ts:240`**:

```ts
if (!player.activatedCharacters) {
  player.activatedCharacters = [];
}
```

`activatedCharacters` wird in `setup()` immer initialisiert. Dieser Check zeigt Unsicherheit über den eigenen State und verdeckt ein potenzielles Initialisierungsproblem.

#### `any`-Casts und `@ts-ignore`

| Datei | Zeile | Problem |
|-------|-------|---------|
| `shared/src/game/index.ts` | 4 | `// @ts-ignore` für cardDatabaseLoader |
| `game-web/src/lib/gameRender.ts` | 259, 263 | `(card as any).imageName`, `(card as any).value` |
| `shared/src/game/cardDatabase.ts` | 41 | `raw.ability as any` |
| `game-web/src/App.tsx` | 17 | `CanvasGameBoard as unknown as ComponentType<any>` |

### Naming & Konsistenz

- `drawAuslage` — mischsprachig (DE/EN gemischt im gleichen Scope)
- `MARGIN_H` ist als `ZONE_TOP_H` definiert — ein Margin als Zone-Height zu benennen ist irreführend
- Deutsche Kommentare neben englischen (`// Berechne Sichtbare Größe` neben `// Track hover over cards`)
- `ctx` als Parameter-Name in boardgame.io Moves kollidiert semantisch mit Canvas `ctx` im gleichen Projekt

---

## 2. Architektur-Review

### Erkennbare Architektur

Monorepo mit boardgame.io als Framework-Core. Die Schichtung ist grundsätzlich korrekt:

```
shared/game/        → Domain Logic (pure functions, testbar)
backend/            → Server (boardgame.io Master)
game-web/lib/       → UI-Utilities (Rendering, Layout, Hit-Testing)
game-web/components/→ Presentation Layer
```

### Schwächen

#### God Component: `CanvasGameBoardContent` (~490 Zeilen)

Eine einzelne Funktion mit 6 Verantwortlichkeiten:
1. Canvas-Rendering-Koordination
2. ResizeObserver + Viewport-Berechnung
3. Pointer-Event-Handling + Hit-Testing
4. Dialog-State-Orchestrierung
5. Game-Move-Dispatching
6. Keyboard-Event-Handler

#### God Component: `LobbyScreen` in `App.tsx` (~220 Zeilen)

Fünf Verantwortlichkeiten in einer Komponente:
1. Match-Listing mit Polling (alle 3 Sekunden)
2. Match-Erstellung
3. Match-Beitritt
4. Waiting-Room mit eigenem Polling (alle 1 Sekunde)
5. In-Game-Wrapper mit `PortaleClient`

#### `DialogContext` — Bag-Typ statt Discriminated Union

```ts
// IST: 7 optionale Felder, alle gleichzeitig vorhanden
dialogContext: {
  newCharacter?: CharacterCard;
  portalCharacters?: CharacterCard[];
  character?: CharacterCard;
  portalSlotIndex?: number;
  hand?: PearlCard[];
  excessCardCount?: number;
  currentHandLimit?: number;
}
```

Konsumenten müssen alle Felder manuell auf `undefined` prüfen (`CanvasGameBoard.tsx:483, 511, 530`). Kein Compile-Fehler wenn die falschen Felder für einen Dialog-Typ verwendet werden.

#### Hardcodierter Server-URL

```ts
const SERVER_URL = 'http://127.0.0.1:3001'; // App.tsx:10
```

Kein `import.meta.env` — Deployment-Blocker.

#### `INVALID_MOVE` nicht verwendet

Alle Moves geben bei ungültigen Eingaben implizit `undefined` zurück. boardgame.io's `INVALID_MOVE` Sentinel wird vom Framework korrekt behandelt (Debug-Panel, Logging, State-Rollback).

---

## 3. Redundanz & DRY

### Deck-Refill-Logik: 3x dupliziert

In `shared/src/game/index.ts` erscheint dieses Pattern in `takePearlCard` (Zeile 128), `takeCharacterCard` (Zeile 182) und `replacePearlSlots` (Zeile 281):

```ts
while (G.pearlSlots.length < 4) {
  let refillCard = G.pearlDeck.pop();
  if (!refillCard && G.pearlDiscardPile.length > 0) {
    G.pearlDeck = G.pearlDiscardPile.splice(0);
    shuffleArray(G.pearlDeck);
    refillCard = G.pearlDeck.pop();
  }
  if (refillCard) G.pearlSlots.push(refillCard);
  else break;
}
```

### `CostPaymentDialog` vs `CharacterActivationDialog`: ~80% identisch

`game-web/src/components/CostPaymentDialog.tsx` und `CharacterActivationDialog.tsx` haben:
- Identische Handkarten-Selektion via `toggleCard`
- Identische `validateCostPayment`-Logik im `useMemo`
- Identische UI-Struktur (hand-grid, actions, error-message)

`CostPaymentDialog` ist vermutlich ein Vorgänger, der nicht mehr verwendet wird.

### Action-Count-Guard: mehrfach geprüft

```ts
function handleCardClick(target: HitTarget) {
  if (G.actionCount >= G.maxActions) return; // ← Guard hier

  switch (target.type) {
    case 'deck-character': {
      if (G.actionCount >= G.maxActions) return; // ← nochmal, redundant
    }
    case 'deck-pearl': {
      if (G.actionCount >= G.maxActions) return; // ← nochmal, redundant
    }
  }
}
```

---

## 4. SOLID-Analyse

| Prinzip | Bewertung | Konkretes Problem |
|---------|-----------|-------------------|
| **SRP** | ❌ Verletzt | `CanvasGameBoardContent`, `LobbyScreen`, `discardCardsForHandLimit` (discard + endTurn in einem Move) |
| **OCP** | ⚠️ Teilweise | `validateCostComponent` switch wächst linear mit neuen CostTypes — jede Erweiterung modifiziert die Funktion |
| **LSP** | ✅ OK | Keine Vererbungshierarchie |
| **ISP** | ❌ Verletzt | `DialogContextType.dialogContext` ist ein Fat Interface — Konsumenten haben Zugriff auf für sie irrelevante Felder |
| **DIP** | ⚠️ Teilweise | `lobbyClient` als Modul-Level-Singleton in `App.tsx`, `SERVER_URL` hardcoded — kein Interface, keine Injektion |

**SRP-Verletzung: `discardCardsForHandLimit`**

Der Move macht 3 Dinge: Karten validieren → Karten aus Hand entfernen → `events.endTurn()` aufrufen. Ein Turn-Ende als Seiteneffekt in einem `discard`-Move verletzt SRP und macht das Verhalten schwer isoliert testbar.

---

## 5. Code-Metriken (qualitativ)

### Cyclomatic Complexity

| Modul | Komplexität | Anmerkung |
|-------|------------|-----------|
| `costCalculation.ts` — `tryAssignCardsExhaustive` | Hoch | Rekursives Backtracking, viele Branches, aber gut dokumentiert |
| `CanvasGameBoardContent` | Hoch | Verschachtelte Event-Handler, Switch, conditional rendering |
| `validateCostComponent` | Medium, steigend | Wächst mit jedem neuen CostType |
| `gameRender.ts` Einzelfunktionen | Niedrig | Gut |

### Coupling & Cohesion

| Modul | Kohäsion | Kopplung | Bewertung |
|-------|----------|----------|-----------|
| `gameRender.ts` | Hoch | Niedrig | Gut: reine Render-Funktionen |
| `costCalculation.ts` | Hoch | Niedrig | Gut: geschlossenes Modul, klare API |
| `CanvasGameBoardContent` | Niedrig | Hoch | Schlecht: G, ctx, moves, events, dialog, canvas API, ResizeObserver |
| `LobbyScreen` | Niedrig | Hoch | Schlecht: API-Aufrufe, Polling, State, Rendering gemischt |

### Testbarkeit

| Modul | Testbarkeit | Grund |
|-------|------------|-------|
| `costCalculation.ts` | Sehr gut | Pure functions |
| `shared/game/index.ts` Moves | Mittel | boardgame.io Mock notwendig |
| `CanvasGameBoard` | Schlecht | Canvas API, ResizeObserver, DialogContext — alles verwoben |
| `LobbyScreen` | Schlecht | Direktes lobbyClient-Singleton, Polling-Intervalle, kein DI |

---

## 6. Refactoring-Vorschläge (Vorher/Nachher)

### A: Deck-Refill extrahieren

```ts
// VORHER (3× dupliziert):
while (G.pearlSlots.length < 4) {
  let refillCard = G.pearlDeck.pop();
  if (!refillCard && G.pearlDiscardPile.length > 0) {
    G.pearlDeck = G.pearlDiscardPile.splice(0);
    shuffleArray(G.pearlDeck);
    refillCard = G.pearlDeck.pop();
  }
  if (refillCard) G.pearlSlots.push(refillCard);
  else break;
}

// NACHHER (1× definiert, 3× aufgerufen):
function refillSlots<T>(
  slots: T[],
  deck: T[],
  discardPile: T[],
  maxSlots: number
): void {
  while (slots.length < maxSlots) {
    let card = deck.pop();
    if (!card && discardPile.length > 0) {
      deck.push(...discardPile.splice(0));
      shuffleArray(deck);
      card = deck.pop();
    }
    if (card) slots.push(card);
    else break;
  }
}
```

### B: DialogContext als Discriminated Union

```ts
// VORHER: Bag mit 7 optionalen Feldern
dialogContext: {
  newCharacter?: CharacterCard;
  portalCharacters?: CharacterCard[];
  character?: CharacterCard;
  portalSlotIndex?: number;
  hand?: PearlCard[];
  excessCardCount?: number;
  currentHandLimit?: number;
}

// NACHHER: Typsicher, kein undefined-Guarding nötig
type DialogState =
  | { type: 'none' }
  | { type: 'replacement'; newCharacter: CharacterCard; portalCharacters: CharacterCard[] }
  | { type: 'activation'; character: CharacterCard; portalSlotIndex: number }
  | { type: 'discard'; hand: PearlCard[]; excessCardCount: number; currentHandLimit: number };

// Konsument:
if (dialog.state.type === 'activation') {
  // dialog.state.character ist hier garantiert CharacterCard, kein undefined-Check nötig
}
```

### C: INVALID_MOVE verwenden

```ts
// VORHER: silent failure
takePearlCard({ G, ctx }, slotIndex) {
  const player = G.players[ctx.currentPlayer];
  if (!player) return;
  if (G.actionCount >= G.maxActions) return;

// NACHHER: Framework-seitig korrekt behandelt
import { INVALID_MOVE } from 'boardgame.io/core';

takePearlCard({ G, ctx }, slotIndex) {
  const player = G.players[ctx.currentPlayer];
  if (!player) return INVALID_MOVE;
  if (G.actionCount >= G.maxActions) return INVALID_MOVE;
```

### D: LobbyScreen aufteilen

```
// VORHER: App.tsx (~256 Zeilen, alles in LobbyScreen)

// NACHHER:
game-web/src/
├── App.tsx                        (nur Routing)
└── lobby/
    ├── LobbyScreen.tsx            (Koordination der Lobby-States)
    ├── MatchList.tsx              (Anzeige + Polling offener Matches)
    ├── CreateMatch.tsx            (Formular: Name + Spieleranzahl)
    ├── WaitingRoom.tsx            (Polling bis alle Spieler da)
    └── useLobbyClient.ts          (Kapselung des LobbyClient-Singletons)
```

### E: Server-URL aus Env-Variable

```ts
// VORHER:
const SERVER_URL = 'http://127.0.0.1:3001';

// NACHHER:
const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? 'http://127.0.0.1:3001';
```

Plus `.env.example` im Root:
```
VITE_SERVER_URL=http://127.0.0.1:3001
```

---

## 7. Priorisierung

| Rang | Task | Datei | Aufwand | Risiko |
|------|------|-------|---------|--------|
| 1 | Debug console.log/group entfernen | `CharacterActivationDialog.tsx`, `index.ts` | 15 Min | Sehr niedrig |
| 2 | Deck-Refill-Logik extrahieren | `shared/game/index.ts` | 30 Min | Niedrig |
| 3 | `SERVER_URL` als Env-Variable | `game-web/src/App.tsx` | 15 Min | Sehr niedrig |
| 4 | `DialogContext` → Discriminated Union | `contexts/DialogContext.tsx` + Konsumenten | 2-3h | Mittel |
| 5 | `handleEndTurn`-Duplikat + Action-Guard-Duplikat entfernen | `CanvasGameBoard.tsx` | 15 Min | Sehr niedrig |

---

## 2-Wochen Refactoring-Plan

### Woche 1 — Quick Wins & Kritische Fixes

| Task | Datei | Beschreibung |
|------|-------|--------------|
| Debug-Code entfernen: CharacterActivationDialog | `CharacterActivationDialog.tsx:24-47, 50-68` | Alle `console.group`/`console.debug` entfernen |
| Debug-Code entfernen: discardCardsForHandLimit | `index.ts:322-354` | Alle 6 `console.log` entfernen |
| `SERVER_URL` als Env-Variable | `App.tsx:10` | `import.meta.env.VITE_SERVER_URL`, `.env.example` anlegen |
| `handleEndTurn`-Duplikat entfernen | `CanvasGameBoard.tsx:399-406` | Funktion löschen, direkt auf `handleButtonClick` verweisen |
| Redundante Action-Count-Guards entfernen | `CanvasGameBoard.tsx:301, 327` | Doppelte Guards in `case 'deck-character'` und `case 'deck-pearl'` entfernen |
| `INVALID_MOVE` verwenden | `shared/game/index.ts` | Alle Moves bei ungültigen Inputs `INVALID_MOVE` returnen lassen |

### Woche 2 — Architektur & DRY

| Task | Datei | Beschreibung |
|------|-------|--------------|
| Deck-Refill-Logik extrahieren | `shared/game/index.ts` | `refillSlots<T>()` Helper, 3 Duplikate ersetzen |
| `DialogContext` als Discriminated Union | `contexts/DialogContext.tsx` + `CanvasGameBoard.tsx` | Bag-Typ durch typsichere Union ersetzen |
| `LobbyScreen` aufteilen | `App.tsx` → `lobby/` | Unterkomponenten + `useLobbyClient.ts` |
| `CostPaymentDialog` prüfen | `CostPaymentDialog.tsx` | Falls ungenutzt: löschen |
| `any`-Casts in `gameRender.ts` beheben | `gameRender.ts:259, 263` | Korrekte Typen oder Type-Guards statt `(card as any)` |
| Fragile ID-Generierung ersetzen | `index.ts:162` | Deterministischen Counter im GameState oder `crypto.randomUUID()` |

---

## Stärken des Projekts (nicht anfassen)

- `costCalculation.ts` — pure functions, 150+ Tests, klares API-Design, gut dokumentiert
- `cardLayoutConstants.ts` — Single Source of Truth für Layout-Konstanten, korrekt referenziert von render, hit-test und overlay
- boardgame.io-Integration — Schichtung ist korrekt, shared-Package-Exports sauber
- `DialogContext` Grundkonzept — Pattern ist richtig, nur der Typ muss korrigiert werden
- Testabdeckung für Spiellogik — `costCalculation.test.ts`, `gameFlow.test.ts`, `handLimit.test.ts` geben Vertrauen für Refactorings
