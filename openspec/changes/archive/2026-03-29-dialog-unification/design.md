## Context

Nach dem dead-code-cleanup haben die vier Spiel-Dialoge kein gemeinsames Styling mehr. Jeder Dialog hat sein eigenes inline-Tailwind-Gestrüpp. Das `dialogs.css`-Ansatz (Option A) gibt semantische Klassen zurück, die `GameDialog.tsx`-Wrapper (Option C) eliminieren strukturelle Duplikation.

Die Lobby nutzt bereits denselben Ansatz: semantische Klassen in `App.css`, kein Framework.

## Goals / Non-Goals

**Goals:**
- Einheitliches visuelles Spielthema in allen Dialogen (dunkles `#1a1a2e`, grüner `#16c784` Akzent)
- JSX-Komponenten lesbar: 40–60 Zeilen statt 80–120
- Kein Duplikat-Boilerplate für Overlay, Modal-Box, Action-Buttons

**Non-Goals:**
- Accessibility-Funktionen (focus trap, ARIA) — kein Scope für diesen Change
- Animation/Transitions — kein Scope, kann später ergänzt werden
- Shadcn/Radix einführen
- Lobby-Styles oder Canvas-Code anfassen

## Decisions

### Entscheidung 1: Zwei-Schichten-Ansatz (CSS + React)

**CSS-Schicht** (`dialogs.css`): Visuelle Grundsprache. Definiert Farben, Abstände, Typografie des Spiel-Themas. Analog zu `App.css` für die Lobby.

**React-Schicht** (`GameDialog.tsx`): Strukturelle Abstraktion. Kapselt das DOM-Pattern (overlay → box → content), nicht die Farben. Konsumiert die CSS-Klassen.

**Warum zwei Schichten:** CSS allein würde JSX-Duplikation nicht lösen. React allein würde Styling-Konsistenz nicht garantieren (jede Komponente könnte ihre eigenen Tailwind-Abweichungen einbauen). Zusammen: CSS = "wie es aussieht", React = "wie es strukturiert ist".

### Entscheidung 2: Semantische Klassen statt Tailwind-Utilities in CSS

`dialogs.css` verwendet **keine** Tailwind-`@apply`. Stattdessen normales CSS mit `game-dialog-*` Präfix (analog zu `.lobby-container`, `.match-list` in `App.css`).

**Warum kein `@apply`:** `@apply` in Tailwind v4 ist limitiert und erzeugt starke Kopplung zwischen CSS und dem Tailwind-Layer. Direktes CSS ist stabiler und portabler.

**Warum nicht alles Tailwind-Inline:** Inline-Tailwind für 5–7 Klassen pro Element ist lesbar. Für 12–15 Klassen (wie aktuell nach der Migration) nicht mehr. CSS-Klassen für das Fundament, Tailwind-Inline nur für komponentenspezifische Nuancen.

### Entscheidung 3: CardPicker als eigenständige Komponente

`CardPicker` kapselt den Karten-Auswahl-Grid der in `CharacterActivationDialog` und `DiscardCardsDialog` identisch ist. Props: `cards`, `getImageSrc`, `getAlt`, `selected: Set<number>`, `onToggle`.

`CharacterReplacementDialog` hat einen anderen Interaktionstyp (einer von N, nicht Multi-Select) und nutzt `CardPicker` nicht — dort reicht ein einfaches Button-Grid mit `game-dialog-card-grid`.

### Entscheidung 4: GameDialogActions als props-basierte Komponente

Statt `children` nimmt `GameDialogActions` explizite Props: `confirmLabel`, `confirmDisabled`, `cancelLabel`, `onConfirm`, `onCancel`. Das erzwingt ein konsistentes Confirm-links / Cancel-rechts-Layout über alle Dialoge.

**Abweichung für ActivatedCharacterDetailView:** Hat keine Confirm/Cancel-Buttons — schließt über Overlay-Klick. Verwendet `GameDialogActions` nicht.

### Entscheidung 5: ActivatedCharacterDetailView nutzt `game-dialog--split` Modifier

Das Side-by-Side-Layout (Bild links, Info rechts) ist einzigartig für diesen Dialog. Statt einen separaten Wrapper zu bauen, erhält `GameDialog` einen `variant="split"` Prop, der `.game-dialog--split` hinzufügt und Flexbox-Row aktiviert.

## Risks / Trade-offs

**[Risiko: CSS-Klassen-Namenskonflikt mit Lobby-Styles]** → Mitigation: `game-dialog-*` Präfix, getrennte Datei `dialogs.css`

**[Risiko: dialogs.css wird über App.css importiert statt direkt]** → Mitigation: `dialogs.css` wird in `CanvasGameBoard.tsx` importiert (dort landen alle Dialoge) — ein einziger Import-Punkt

**[Trade-off: Zwei Abstraktionsschichten]** → Für 4 Dialoge ist das angemessen. Unter 3 Dialogen wäre es Overkill. Über 6 würde man shadcn ernsthaft evaluieren.

## Migration Plan

Pro Komponente:
1. `GameDialog.tsx` + `dialogs.css` schreiben (einmalig)
2. Komponente auf `GameDialog` umstellen
3. Inline-Tailwind-Klassen durch `game-dialog-*` Klassen ersetzen
4. TypeScript + visueller Browser-Check

Keine Datenbank- oder API-Migrationen. Rollback: Git-Revert pro Komponente.

## Open Questions

Keine.
