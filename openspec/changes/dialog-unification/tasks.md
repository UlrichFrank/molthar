## 1. Fundament aufbauen

- [x] 1.1 `game-web/src/styles/dialogs.css` erstellen mit allen `game-dialog-*` Klassen:
  - `.game-dialog-overlay` — fixed overlay, `rgba(0,0,0,0.7)`, flex center, z-1000
  - `.game-dialog` — modal box: `#1a1a2e` bg, 2px solid `#16c784` border, 12px radius, padding, max-width 600px, max-height `calc(100vh - 1rem)`, overflow-y auto, shadow
  - `.game-dialog--wide` — modifier: max-width 800px (für ActivatedCharacterDetailView)
  - `.game-dialog--split` — modifier: flex row, gap 2rem (Bild links, Info rechts)
  - `.game-dialog-title` — h2: `#16c784`, zentriert, border-bottom 2px `#16c784`, mb
  - `.game-dialog-info` — info-box: `#fff3cd` bg, linker border `#ffc107`
  - `.game-dialog-info-text` — `#856404`, font-size 0.9rem
  - `.game-dialog-info-text--warning` — `#d32f2f`, font-weight bold
  - `.game-dialog-card-grid` — grid, auto-fill minmax(60px,1fr), gap, white bg, padding, border-radius
  - `.game-dialog-card-btn` — 59px breit, aspect-ratio 59/92, appearance none, position relative, overflow hidden, rounded, cursor pointer, hover: translateY(-2px)
  - `.game-dialog-card-selected-overlay` — absolute inset-0, `rgba(76,175,80,0.5)`
  - `.game-dialog-actions` — flex, gap 1rem, mt 1.5rem
  - `.game-dialog-btn-confirm` — grün (#4CAF50), disabled: #ccc/#666, border 2px #333, border-radius 12px, font-weight bold, hover: #45a049 + scale(1.02)
  - `.game-dialog-btn-cancel` — rot (#f44336), border 2px #333, border-radius 12px, font-weight bold, hover: #da190b + scale(1.02)
  - `.game-dialog-btn-neutral` — `#444` bg, border `#666`, hover: `#555`

- [x] 1.2 `game-web/src/components/GameDialog.tsx` erstellen mit:
  - `GameDialog`: Overlay + Modal-Box, Props: `children`, `variant?: 'default' | 'wide' | 'split'`, `onOverlayClick?: () => void`
  - `GameDialogTitle`: `<h2 className="game-dialog-title">`, Props: `children`
  - `GameDialogActions`: Confirm + Cancel Buttons, Props: `confirmLabel`, `confirmDisabled?: boolean`, `cancelLabel?: string`, `onConfirm`, `onCancel`
  - `CardPicker`: Karten-Grid mit Selection-Overlay, Props: `cards: T[]`, `selected: Set<number>`, `onToggle: (i: number) => void`, `getImageSrc: (card: T) => string`, `getAlt: (card: T) => string`

- [x] 1.3 Import von `dialogs.css` in `CanvasGameBoard.tsx` hinzufügen

## 2. Dialoge umstellen

- [x] 2.1 `CharacterActivationDialog.tsx` auf `GameDialog` + `CardPicker` + `GameDialogActions` umstellen; inline-Tailwind für Overlay/Modal entfernen
- [x] 2.2 `CharacterReplacementDialog.tsx` auf `GameDialog` + `GameDialogActions` umstellen; inline-Tailwind für Overlay/Modal entfernen
- [x] 2.3 `DiscardCardsDialog.tsx` auf `GameDialog` + `CardPicker` + `GameDialogActions` umstellen; inline-Tailwind für Overlay/Modal entfernen
- [x] 2.4 `ActivatedCharacterDetailView.tsx` auf `GameDialog variant="split"` umstellen; inline-Tailwind für Overlay/Modal entfernen

## 3. Verifikation

- [x] 3.1 TypeScript-Kompilierung prüfen: `cd game-web && pnpm run type-check` fehlerfrei
- [ ] 3.2 Manuell testen: CharacterActivationDialog — Karten-Grid, Confirm/Cancel, disabled state korrekt
- [ ] 3.3 Manuell testen: CharacterReplacementDialog — Portal-Karten auswählbar, Cancel funktioniert
- [ ] 3.4 Manuell testen: DiscardCardsDialog — Multi-Select, Confirm disabled bis korrekte Anzahl
- [ ] 3.5 Manuell testen: ActivatedCharacterDetailView — Split-Layout (Bild + Info), schließt bei Overlay-Klick
- [ ] 3.6 Manuell testen: Alle Dialoge haben einheitliches Thema (dunkler Hintergrund, grüner Akzent)
