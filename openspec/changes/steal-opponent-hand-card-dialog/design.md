## Context

**Backend:** `stealOpponentHandCard` in `abilityHandlers.ts` ist ein Auto-Select-Platzhalter. Die Handkarten aller Spieler liegen im shared `GameState` unter `players[id].hand` — technisch für alle Clients sichtbar. Das ist bewusst so (boardgame.io secret state wird hier nicht genutzt); die "Verdecktheit" in Stufe 1 ist eine reine UX-Entscheidung im Frontend.

**Frontend:** Das Pending-Flag-Muster ist bereits für `discardOpponentCharacter` geplant und für `requiresHandDiscard` etabliert. Der `DialogContext` wird für jeden neuen Dialog-Typ erweitert.

## Goals / Non-Goals

**Goals:**
- Spieler wählt explizit Gegner und Karte.
- Stufe 1 zeigt Handkarten verdeckt (nur Anzahl), Stufe 2 zeigt sie aufgedeckt.
- Dialog ist nicht abbrechbar.
- Kein Effekt und kein Dialog wenn kein Gegner Handkarten hat.

**Non-Goals:**
- Kein echtes Secret State (boardgame.io-Level) — Verdecktheit ist UI-only.
- Keine Mehrfachauswahl.

## Decisions

### 1. Zweistufiger Dialog-State im DialogContext

**Entscheidung:** Der Dialog-Typ `steal-opponent-hand-card` enthält einen internen Zustand `selectedPlayerId: string | null`. Stufe 1 (`selectedPlayerId === null`) zeigt Spielerauswahl, Stufe 2 (`selectedPlayerId !== null`) zeigt Karten des gewählten Spielers.

**Begründung:** Der interne Zustand ist rein UI-seitig (welcher Spieler gerade ausgewählt ist) und gehört nicht in den Game-State. Ein einzelner Dialog-Typ mit internem State ist sauberer als zwei separate Typen.

**Alternativen verworfen:**
- *Zwei separate Dialog-Typen (`step1`, `step2`)*: Mehr Boilerplate, gleiche Funktionalität.
- *State im Game-State*: Unnötig — die Spielerauswahl ist transient und nur lokal relevant.

### 2. Resolve-Move mit `handCardIndex`

**Entscheidung:** `resolveStealOpponentHandCard(targetPlayerId, handCardIndex)` verwendet den Index der Karte in `players[targetPlayerId].hand`.

**Begründung:** Handkarten haben keine eindeutige persistente ID (anders als Portal-Einträge mit `portalEntryId`). Der Index ist ausreichend sicher, da der Move im Backend validiert wird und Race Conditions bei Handkarten weniger kritisch sind als bei Portal-Einträgen.

**Alternativen verworfen:**
- *Karten-ID statt Index*: `PearlCard` hat eine `id` — technisch möglich, aber der Index ist einfacher und direkt nutzbar.

### 3. Verdeckte Anzeige in Stufe 1

**Entscheidung:** In Stufe 1 werden pro Gegner N Kartenrückseiten gerendert (N = `hand.length`). Kein Wert, kein Bild der Karte sichtbar.

**Begründung:** Erzeugt Spielspannung. Da der Wert technisch im State liegt, ist dies nur ein Rendering-Entscheid — kein Sicherheitskonzept.

### 4. Idempotenter Resolve-Move (Sicherheit)

**Entscheidung:** Der Move prüft: `pendingStealOpponentHandCard === true`, `targetPlayerId !== ctx.currentPlayer`, `handCardIndex` im gültigen Bereich. Sonst no-op.

**Begründung:** Schutz gegen Move-Injection, identisch zum Pattern bei `discardOpponentCharacter`.

## Risks / Trade-offs

- **Concurrent State:** Wenn ein anderer Spieler zwischen Flag-Setzen und Resolve eine Karte abwirft, könnte `handCardIndex` ungültig werden. → Move validiert den Index, ungültiger Index → no-op. Der Spieler muss dann ggf. erneut auswählen (Dialog bleibt offen, da Flag noch gesetzt).
- **UI-Verdecktheit ist kein echtes Secret:** Ein technisch versierter Spieler könnte den GameState inspizieren. → Akzeptiert — das Spiel nutzt kein Secret State.
