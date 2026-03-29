## MODIFIED Requirements

### Requirement: Komponentenarchitektur
Das System SHALL ausschließlich aktive, in der Produktions-Codebasis verwendete Komponenten enthalten. Tote Komponenten aus früheren Architektur-Iterationen SHALL entfernt sein.

#### Scenario: Komponentenhierarchie entspricht dem tatsächlichen Render-Tree
- **WHEN** die Komponentenhierarchie von `App.tsx` traversiert wird
- **THEN** entspricht sie genau dem folgenden Baum — keine weiteren Komponenten existieren im `components/`-Verzeichnis

```
App.tsx
└─ LobbyScreen
     ├─ MatchList
     ├─ CreateMatch
     └─ WaitingRoom
          └─ (boardgame.io Client → CanvasGameBoard)
               ├─ ActivatedCharacterDetailView
               ├─ CharacterReplacementDialog
               ├─ CharacterActivationDialog
               ├─ DiscardCardsDialog
               ├─ ConfirmDialog
               ├─ PlayerNameDisplay
               └─ Toast (via ErrorBoundary wrapper)
```

#### Scenario: Keine toten Komponenten im Repository
- **WHEN** das Verzeichnis `game-web/src/components/` gelesen wird
- **THEN** existieren keine der folgenden Dateien mehr: GameContainer, ResponsiveGameBoard, HandDisplay, FaceUpCards, PlayerHand, OpponentPortals, DiscardButton, TurnIndicatorDisplay, LayoutCustomizationPanel, GameLog, CardInfo, GameStartScreen, GameFinishedScreen, ErrorDisplay

---

### Requirement: CSS-Strategie — Tailwind Only
Das System SHALL ausschließlich Tailwind-CSS-Utility-Klassen für komponentenspezifisches Styling verwenden. Komponentenspezifische `.css`-Dateien (außer `index.css`) SHALL nicht existieren.

#### Scenario: Keine komponentenspezifischen CSS-Dateien
- **WHEN** das Verzeichnis `game-web/src/styles/` gelesen wird
- **THEN** existiert keine der folgenden CSS-Dateien mehr: dialogModal.css, Dialog.css, characterActivationDialog.css, characterReplacementDialog.css, discardCardsDialog.css, activatedCharacterDetailView.css, playerNameDisplay.css, Toast.css, ErrorBoundary.css, App.css, Components.css

#### Scenario: index.css enthält nur globale Styles
- **WHEN** `game-web/src/index.css` gelesen wird
- **THEN** enthält die Datei ausschließlich: Tailwind-Direktiven (`@import "tailwindcss"`), globale CSS-Resets (body, html, box-sizing) und Canvas-spezifische Resets — keine Komponenten-Klassen

#### Scenario: Komponenten nutzen className mit Tailwind-Klassen
- **WHEN** eine Dialog- oder UI-Komponente gerendert wird
- **THEN** sind alle Styles über `className`-Attribute mit Tailwind-Klassen definiert — keine externen CSS-Klassen außer Tailwind-generierten

---

### Requirement: Kein totes Layout-Customization-System
Das System SHALL kein Layout-Customization-Subsystem enthalten, da dieses nie in Produktion verwendet wurde.

#### Scenario: Keine Layout-Customization-Dateien im Repository
- **WHEN** das Repository nach Layout-Customization-Code durchsucht wird
- **THEN** existieren keine der folgenden Dateien: LayoutContext.tsx, useResponsiveLayout.ts, useLayoutPreferences.ts, useViewportSize.ts, layoutCalculations.ts, layoutPresets.ts, layoutTypes.ts, LayoutCustomizationPanel.tsx

---

### Requirement: Keine toten Utilities und Hooks
Das System SHALL keine Utility-Dateien oder Hooks enthalten, die von keiner lebenden Komponente importiert werden.

#### Scenario: Keine toten Utility-Dateien
- **WHEN** `game-web/src/lib/` gelesen wird
- **THEN** existieren weder `gameHitTest.ts` noch `zoomCompensation.ts`

#### Scenario: Keine toten Hooks
- **WHEN** `game-web/src/hooks/` gelesen wird
- **THEN** existiert weder `useToastManager.ts` noch `useViewportSize.ts`

---

## REMOVED Requirements

### Requirement: Layout-Customization-Panel
**Reason:** Das Feature wurde entwickelt aber nie in den aktiven Render-Tree integriert. LayoutCustomizationPanel wird von keiner lebenden Komponente verwendet. Das gesamte Layout-Subsystem ist toter Code.
**Migration:** Entfällt. Das Feature ist nicht in Produktion. Canvas-Skalierung erfolgt über ResizeObserver in CanvasGameBoard.

### Requirement: Responsive Layout-Hooks
**Reason:** useResponsiveLayout, useLayoutPreferences, useViewportSize sind ausschließlich für das entfernte Layout-Customization-System. CanvasGameBoard verwendet einen eigenen ResizeObserver.
**Migration:** Entfällt. Keine Ersatz-API nötig.
