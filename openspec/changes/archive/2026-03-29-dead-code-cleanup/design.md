## Context

Das `game-web`-Frontend entstand über drei Iterationen:
1. **Lokales DOM-Board** (`GameContainer` + DOM-Komponenten) — vor boardgame.io
2. **boardgame.io DOM-Board** (`ResponsiveGameBoard` + CSS-Overlays) — erste Multiplayer-Version
3. **Canvas-Board** (`CanvasGameBoard` + rAF-Loop) — aktuelle Version

Jede Iteration hat Reste hinterlassen. Der tote Code wurde nie entfernt, weil die Migrations-Übergänge fließend waren. Parallel entstand eine Layout-Customization-Feature (LayoutContext, useResponsiveLayout, etc.), die ebenfalls nie in Produktion ging.

Die CSS-Strategie ist inkonsistent: manche Komponenten nutzen Tailwind, andere komponentenspezifische `.css`-Dateien. Das Projekt hat Tailwind 4.2.1 bereits vollständig installiert und konfiguriert.

## Goals / Non-Goals

**Goals:**
- Alle toten Dateien restlos entfernen
- CSS vollständig auf Tailwind umstellen (keine komponentenspezifischen `.css`-Dateien mehr, außer `index.css`)
- Tests die ausschließlich toten Code testen, entfernen
- `game-web-spec.md` auf den aktuellen Stand bringen

**Non-Goals:**
- Funktionalität der lebenden Komponenten verändern
- Canvas-Rendering-Code anfassen
- Lobby-Komponenten anfassen
- Game-Logic oder Backend anfassen
- Neue Features einführen

## Decisions

### Entscheidung 1: Reihenfolge der Löschung (Phase 1)

**Gewählt:** Löschen von innen nach außen (Leaf-First). Zuerst Dateien löschen, die nichts anderes importieren, dann deren Eltern.

**Warum:** Verhindert, dass TypeScript-Fehler durch hängende Imports den Build unterbrechen. Nach Phase 1 muss `pnpm build` und `pnpm lint` fehlerfrei laufen.

**Reihenfolge:**
1. Tote CSS-Dateien (keine Abhängigkeiten)
2. Tote Leaf-Komponenten (HandDisplay, FaceUpCards, etc.)
3. Tote Container-Komponenten (PlayerHand, GameContainer, etc.)
4. Layout-System von innen: layoutTypes/layoutPresets/layoutCalculations → useViewportSize/useLayoutPreferences → useResponsiveLayout → LayoutContext → LayoutCustomizationPanel
5. gameHitTest, zoomCompensation, useToastManager
6. Tests bereinigen

### Entscheidung 2: CSS-Migration-Strategie (Phase 2)

**Gewählt:** Inline-Tailwind-Klassen direkt in JSX-className-Attributen. Keine CSS-Module, keine Styled Components.

**Warum:** Das Projekt verwendet Tailwind bereits durchgehend in den Lobby-Komponenten. Tailwind 4 hat kein separates Config-File mehr — alles über `@import "tailwindcss"` in index.css. Inline-Klassen sind das idiomatische Pattern.

**Nicht gewählt:** CSS-Module (`.module.css`) — wäre konsistenter mit der bestehenden `cardButtons.module.css`, aber diese ist bereits tot. Tailwind ist der erklärte Standard.

### Entscheidung 3: Umgang mit komplexem Dialog-CSS

Dialoge haben komplexe Styles (Overlays, Grid-Layouts, farbliche Zustände). Migration-Ansatz:

- **Overlay-Pattern** → `fixed inset-0 bg-black/70 flex items-center justify-center z-50`
- **Modal-Box** → `bg-[#1a1a2e] border border-[#4a4a7a] rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto`
- **Farbige Zustände** (rot/grün/gelb) → Tailwind-Farbklassen (`bg-red-500`, `text-green-400`, etc.)
- **Komplexe Layouts** → `grid`, `flex` Tailwind-Klassen
- **Spielspezifische Farben** (z.B. Portal-Farben) → Tailwind `bg-[#hexvalue]` für One-Off-Werte

### Entscheidung 4: index.css und App.css

**index.css:** Behält `@import "tailwindcss"` und globale Resets (body, html, canvas scrollbar, box-sizing). Keine Komponenten-Styles.

**App.css:** Wird gelöscht. App.tsx hat keinen eigenen Style-Bedarf.

### Entscheidung 5: Components.css

`Components.css` (2004 Zeilen) wird nach Phase 1 wertlos, da alle Importeure tot sind. In Phase 2 wird es gelöscht.

Es enthält u.a. `:root { --card-aspect-ratio: ... }` — diese CSS-Variablen werden von Canvas-Code nicht genutzt (Canvas nutzt `cardLayoutConstants.ts`). Kein Migrationsbedarf.

### Entscheidung 6: game-web-spec.md aktualisieren

Die Spec enthält veraltete Komponentenlisten, tote Hook-Beschreibungen und ein falsches Architekturdiagramm. Sie wird als Teil des Changes vollständig aktualisiert.

## Risks / Trade-offs

**[Risiko: Übersehene CSS-Klassen]** → Mitigation: Nach jeder CSS-Datei-Deletion den visuellen Vergleich im Browser machen. Build + Lint müssen grün sein.

**[Risiko: Tests brechen durch entfernte Komponenten]** → Mitigation: Tests werden explizit bereinigt. Nach Phase 1 müssen alle verbliebenen Tests grün laufen (`make test-shared` + Vitest).

**[Risiko: Tailwind-Klassen für komplexe Styles unlesbar]** → Mitigation: Komplexe Klassen-Strings als Variable oder `cn()`-Helper extrahieren wenn nötig. Das Projekt hat bereits `clsx` verfügbar.

**[Risiko: Components.css enthält unentdeckte globale Klassen]** → Mitigation: Vor dem Löschen grep auf alle CSS-Klassen aus Components.css gegen lebende `.tsx`-Dateien. Keine Matches erwartet.

## Migration Plan

### Phase 1 (Toten Code löschen)

Rein mechanisch. Jede Datei löschen, Import-Referenzen entfernen, Build prüfen. Keine funktionalen Änderungen.

Rollback: `git revert` — keine Abhängigkeiten zu Phase 2.

### Phase 2 (CSS → Tailwind)

Eine Komponente nach der anderen. Pro Komponente:
1. CSS-Datei lesen
2. Alle CSS-Klassen auf Tailwind-Äquivalente mappen
3. `className`-Attribute in der Komponente aktualisieren
4. CSS-Datei-Import entfernen
5. CSS-Datei löschen
6. Visuell im Browser vergleichen

Empfohlene Reihenfolge (einfach → komplex):
1. `playerNameDisplay.css` (48 Zeilen, einfach)
2. `dialogModal.css` (88 Zeilen)
3. `ErrorBoundary.css` (143 Zeilen)
4. `Dialog.css` (175 Zeilen)
5. `Toast.css` (177 Zeilen)
6. `characterReplacementDialog.css` (134 Zeilen)
7. `discardCardsDialog.css` (219 Zeilen)
8. `characterActivationDialog.css` (253 Zeilen)
9. `activatedCharacterDetailView.css` (262 Zeilen)
10. `App.css` + `Components.css` (nach Test-Bereinigung)

Rollback: Pro Komponente eigenständig revertierbar.

## Open Questions

Keine. Scope und Approach sind klar.
