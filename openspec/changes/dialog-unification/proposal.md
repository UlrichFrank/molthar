## Why

Die vier Spiel-Dialoge (CharacterActivation, CharacterReplacement, DiscardCards, ActivatedCharacterDetailView) wurden im Zuge des dead-code-cleanup von CSS-Dateien auf inline-Tailwind migriert. Das Ergebnis ist unleserlicher JSX: 80–120 Zeilen lange Komponenten voll mit `className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] ..."`. Jeder Dialog dupliziert dasselbe visuelle Grundmuster unabhängig voneinander, ohne gemeinsame Abstraktion.

## What Changes

- Neue `game-web/src/styles/dialogs.css` mit semantischen Klassen für das Spiel-Dialog-Fundament (Overlay, Modal-Box, Titel, Info-Sections, Karten-Grid, Action-Buttons) — einheitliches dunkles Spielthema
- Neue `game-web/src/components/GameDialog.tsx` mit React-Wrapper-Komponenten: `GameDialog`, `GameDialogTitle`, `GameDialogActions`, `CardPicker`
- `CharacterActivationDialog.tsx` auf `GameDialog` + `CardPicker` umstellen
- `CharacterReplacementDialog.tsx` auf `GameDialog` + `CardPicker` umstellen
- `DiscardCardsDialog.tsx` auf `GameDialog` + `CardPicker` umstellen
- `ActivatedCharacterDetailView.tsx` auf `GameDialog` umstellen

## Capabilities

### New Capabilities

Keine.

### Modified Capabilities

- `game-web-spec`: Dialog-Architektur — einheitliche `GameDialog`-Abstraktion statt Inline-Tailwind-Duplikation in jedem Dialog

## Impact

**Neue Dateien:**
- `game-web/src/styles/dialogs.css` — semantische CSS-Klassen für Spiel-Dialoge
- `game-web/src/components/GameDialog.tsx` — wiederverwendbare Dialog-Wrapper-Komponenten

**Geänderte Dateien:**
- `game-web/src/components/CharacterActivationDialog.tsx` — auf GameDialog umstellen
- `game-web/src/components/CharacterReplacementDialog.tsx` — auf GameDialog umstellen
- `game-web/src/components/DiscardCardsDialog.tsx` — auf GameDialog umstellen
- `game-web/src/components/ActivatedCharacterDetailView.tsx` — auf GameDialog umstellen

**Keine Änderungen an:**
- Game Logic (moves, shared, backend)
- Canvas-Rendering-Code
- Lobby-Komponenten
- CanvasGameBoard (Dialog-Integration bleibt unverändert)

### CSS-Klassen-Design (dialogs.css)

```
.game-dialog-overlay    fixed inset-0 overlay, dunkler Hintergrund, flex center
.game-dialog            modal box: dunkles Spielthema (#1a1a2e), grüner border (#16c784)
.game-dialog-title      h2: #16c784, zentriert, border-bottom
.game-dialog-info       info-box: #fff3cd Hintergrund, linker gelber border
.game-dialog-info-text  text in info-box: #856404
.game-dialog-info-text--warning  rot, fett
.game-dialog-card-grid  auto-fill grid für Kartenauswahl
.game-dialog-card-btn   card selector button: 59px breit, aspect-ratio 59/92
.game-dialog-card-selected-overlay  grüner halbtransparenter overlay über selected card
.game-dialog-actions    button row: flex, gap, centered
.game-dialog-btn-confirm  grüner Bestätigungsbutton (disabled-state eingebaut)
.game-dialog-btn-cancel   roter Abbrechen-Button
.game-dialog-btn-neutral  grauer neutraler Button

.game-dialog--wide      modifier für breitere Dialoge (ActivatedCharacterDetailView)
.game-dialog--split     modifier für side-by-side layout (Bild + Info)
```

### React-Komponenten-Design (GameDialog.tsx)

```tsx
// Kern-Wrapper
<GameDialog onOverlayClick={fn}>
  children
</GameDialog>

// Titel
<GameDialogTitle>Activate Character</GameDialogTitle>

// Action-Buttons
<GameDialogActions
  confirmLabel="Activate"
  confirmDisabled={!isValid}
  onConfirm={fn}
  onCancel={fn}
/>

// Karten-Auswahl-Grid (für ActivationDialog + DiscardDialog)
<CardPicker
  cards={hand}          // PearlCard[]
  getImageSrc={fn}      // card → img src
  getAlt={fn}           // card → alt text
  selected={selectedSet}
  onToggle={fn}
/>
```
