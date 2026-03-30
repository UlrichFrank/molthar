## Context

**Backend (vollständig):**
- Move `peekCharacterDeck` in `index.ts`: Guard auf `actionCount > 0` und auf fehlende Ability, setzt `player.peekedCard = G.characterDeck[last]`
- `peekedCard` wird beim Spielerwechsel auf `null` zurückgesetzt (Zeile ~613)
- `peekedCard` ist in `PlayerState` als `peekedCard?: CharacterCard | null` definiert

**Frontend (Stand):**
- `deck-character`-Click in `CanvasGameBoard`: öffnet entweder ReplacementDialog (Portal voll) oder ruft direkt `takeCharacterCard(-1)` auf — kein Preview
- `drawDeckStack` in `gameRender.ts`: rendert immer Kartenrückseite (`'Charakterkarte Hinten.png'`)
- `peekedCard` wird im Frontend an keiner Stelle ausgelesen

## Goals / Non-Goals

**Goals:**
- Klick auf Charakter-Deck verhält sich kontextabhängig (Preview vs. Direkt-Zug)
- Aufgedeckte Karte wird visuell face-up auf dem Stapel gezeigt
- Zweiter Klick nimmt die Karte (oder öffnet Replacement-Dialog bei vollem Portal)

**Non-Goals:**
- Kein neuer Backend-Move — `peekCharacterDeck` ist ausreichend
- Kein Modal/Dialog für den Preview — Karte wird direkt auf dem Canvas gezeigt
- Keine Änderung des Pearl-Decks

## Decisions

### 1. Preview-State aus `peekedCard` ableiten

**Entscheidung:** Der Preview-State ist `me.peekedCard !== null && me.peekedCard !== undefined`. Kein eigenes Frontend-State nötig.

**Begründung:** `peekedCard` ist bereits der authoritative Zustand im Game-State — synchron über alle Clients. Lokales State würde Inkonsistenzen riskieren.

### 2. Klick-Logik im `deck-character`-Handler

**Entscheidung:** Dreiteilige Kondition im bestehenden `case 'deck-character'`-Block:
```
if (hasPreviewAbility && actionCount === 0 && !peekedCard) → peekCharacterDeck()
else if (hasPreviewAbility && peekedCard)                  → takeCard()
else                                                        → takeCard() (bisheriges Verhalten)
```
`takeCard()` bedeutet: ReplacementDialog falls Portal voll, sonst `takeCharacterCard(-1)`.

**Begründung:** Minimal-invasiv. Die bestehende `takeCard`-Logik wird nicht dupliziert.

**Alternativen verworfen:**
- *Eigenes Frontend-State für Preview*: Fehleranfällig bei Reconnect/Reload — `peekedCard` aus GameState ist robuster.
- *Separater Canvas-Button "Nehmen"*: Zu aufwändig; Doppelklick-Paradigma ist intuitiver.

### 3. Face-Up-Rendering der obersten Karte

**Entscheidung:** `drawDeckStack` erhält einen optionalen Parameter `peekedCard?: CharacterCard`. Falls gesetzt, wird die oberste Karte mit der Vorderseite gerendert (`Charakterkarte${id}.png` oder Fallback-Text mit Kartenname).

**Begründung:** `drawDeckStack` ist die einzige Stelle, die den Charakter-Stapel zeichnet. Kein Refactoring nötig — nur ein optionaler Parameter.

### 4. Visueller Hinweis im Preview-Zustand

**Entscheidung:** Wenn `peekedCard` gesetzt ist, wird unterhalb/neben dem Deck ein kurzer Text `"← Klick zum Nehmen"` oder ein kleines Label eingeblendet — als Canvas-Text, nicht als DOM-Overlay.

**Begründung:** Konsistent mit dem restlichen Canvas-basierten UI. Kein React-Overlay nötig.

## Risks / Trade-offs

- **Sichtbarkeit für andere Spieler:** `peekedCard` ist in `PlayerState` und wird allen Clients synchronisiert. Andere Spieler sehen technisch gesehen ebenfalls, dass eine Karte aufgedeckt wurde — aber nicht welche (da `peekedCard` in ihrem eigenen Player-State ist und nur der aktive Spieler seinen `me`-State liest). Kein Leak.
- **Race Condition:** Wenn der Spieler während der Preview eine andere Aktion macht, setzt das Backend `peekedCard` nicht automatisch zurück (nur bei Spielerwechsel). → Akzeptabel, da `peekCharacterDeck` nur erlaubt ist wenn `actionCount === 0`, und nach jeder Aktion ist `actionCount > 0`, sodass kein zweiter Peek möglich ist.
