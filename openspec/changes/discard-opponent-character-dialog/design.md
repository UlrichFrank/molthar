## Context

Die `discardOpponentCharacter`-Ability wird in `applyRedAbility` (abilityHandlers.ts) synchron während des `activatePortalCard`-Moves ausgeführt. Aktuell entfernt sie automatisch die erste Portal-Karte des ersten Gegners — ein expliziter TODO-Platzhalter.

Das restliche Codebase verwendet das "Pending-Flag"-Muster für interaktive Unterbrechungen: `requiresHandDiscard` hält den Zug an, bis der Spieler Karten abwirft. Dialog-Verwaltung erfolgt über `DialogContext` mit typisierten Dialog-States.

## Goals / Non-Goals

**Goals:**
- Spieler wählt explizit, welche Karte welches Gegners entfernt wird.
- Dialog zeigt alle verfügbaren Portal-Karten aller Gegner, geordnet nach Zugreihenfolge ab dem nächsten Spieler.
- Kein Abbrechen möglich — Auswahl ist Pflicht.
- Wenn kein Gegner eine Portal-Karte hat: Ability wird ignoriert, kein Dialog.
- Nur der aktive Spieler sieht und bedient den Dialog (boardgame.io Secret State / UI-Filterung).

**Non-Goals:**
- Keine Änderung der Reihenfolge der anderen Abilities.
- Keine Mehrfachauswahl.
- Keine Auswahl von `activatedCharacters` (bereits aktivierte Karten) — nur `portal`-Karten.

## Decisions

### 1. Pending-Flag statt Stage/Phase

**Entscheidung:** `pendingDiscardOpponentCharacter: boolean` im `GameState`, analog zu `requiresHandDiscard`.

**Begründung:** boardgame.io Stages/Phases wären zu aufwändig für eine einzelne Unterbrechung. Das Flag-Muster ist bereits im Codebase etabliert und verstanden. Der aktive Spieler löst den Resolve-Move auf, ohne den Turn zu wechseln.

**Alternativen verworfen:**
- *boardgame.io Stage für Gegnerauswahl*: Würde den Turn-Flow unterbrechen und ist nicht nötig, da nur der aktive Spieler handelt.
- *Auswahl vor `activatePortalCard`*: Frontend würde zwei Moves brauchen; Atomarität geht verloren.

### 2. Resolve-Move mit `portalEntryId` statt Index

**Entscheidung:** `resolveDiscardOpponentCharacter(targetPlayerId: string, portalEntryId: string)` identifiziert die Karte über die eindeutige `portalEntryId`.

**Begründung:** Portal-Indices können sich zwischen Renderzeit und Move-Ausführung verschieben (bei konkurrierenden Änderungen). Die `portalEntryId` ist ein monotoner, unveränderlicher Bezeichner (bereits im Codebase via `portalEntryCounter`).

**Alternativen verworfen:**
- *Index-basierte Auswahl*: Anfällig für Race Conditions in Multiplayer-Kontext.

### 3. Spielerreihenfolge im Dialog ab "nächstem Spieler"

**Entscheidung:** Frontend berechnet die Anzeigereihenfolge aus `G.playerOrder` und `ctx.currentPlayer`: Rotation ab dem nächsten Spieler (Wrap-Around), `currentPlayer` wird übersprungen.

**Begründung:** Das entspricht der intuitiven Spielreihenfolge und gibt dem aktiven Spieler den besten Überblick über die strategische Situation.

### 4. Dialog nicht abbrechbar

**Entscheidung:** Der Dialog hat keine Schließen-/Abbrechen-Schaltfläche. Er schließt sich ausschließlich durch Auswahl einer Karte.

**Begründung:** Spielerauftrag. Entspricht dem Muster des `DiscardDialog` (auch nicht abbrechbar, bis die Aktion erledigt ist).

## Risks / Trade-offs

- **Timing:** Das Pending-Flag bleibt gesetzt, wenn der Spieler die Seite neu lädt. → Der Dialog öffnet sich beim nächsten Rendern wieder automatisch — korrektes Verhalten.
- **Validierung im Resolve-Move:** Der Move muss prüfen, ob `targetPlayerId` und `portalEntryId` gültig sind und das Flag tatsächlich gesetzt ist. Sonst könnte ein Spieler via Move-Injection fremde Portal-Karten entfernen. → Move validiert beide Bedingungen.

## Migration Plan

1. Shared: Types, abilityHandler, neuer Move, Setup — alles in einem PR.
2. Frontend: Dialog-Typ, Komponente, Board-Integration — zweiter PR oder gleichzeitig.
3. Kein Breaking Change — `pendingDiscardOpponentCharacter` startet als `false`.
