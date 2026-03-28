## Why

Das `game-web`-Frontend hat über mehrere Iterationen (lokales DOM-Board → boardgame.io → Canvas-Board) massiven Ballast angesammelt: ~26 tote Dateien mit ~3400 Zeilen Code, der nie ausgeführt wird. Gleichzeitig sind die noch aktiven CSS-Dateien als Pro-Komponenten-Einzeldateien organisiert statt als kohärente, wiederverwendbare Tailwind-Klassen.

## What Changes

- **BREAKING** ~13 tote React-Komponenten werden gelöscht (GameContainer, ResponsiveGameBoard, HandDisplay, FaceUpCards, PlayerHand, OpponentPortals, DiscardButton, TurnIndicatorDisplay, LayoutCustomizationPanel, GameLog, CardInfo, GameStartScreen, GameFinishedScreen)
- **BREAKING** Das komplette Layout-Customization-Subsystem wird entfernt (LayoutContext, useResponsiveLayout, useLayoutPreferences, useViewportSize, layoutTypes, layoutPresets, layoutCalculations)
- Tote Hooks und Lib-Dateien werden gelöscht (useToastManager, gameHitTest, zoomCompensation)
- 6 tote CSS-Dateien werden gelöscht (Accessibility.css, Animations.css, cardButtons.module.css, costPaymentDialog.css, layoutCustomization.css, responsiveLayout.css)
- Tests die ausschließlich tote Komponenten testen werden entfernt oder bereinigt
- 6 komponentenspezifische Dialog/View-CSS-Dateien werden auf Tailwind-Utility-Klassen migriert und gelöscht: dialogModal.css, Dialog.css, characterActivationDialog.css, characterReplacementDialog.css, discardCardsDialog.css, activatedCharacterDetailView.css
- playerNameDisplay.css wird auf Tailwind migriert und gelöscht
- Toast.css wird auf Tailwind migriert und gelöscht
- ErrorBoundary.css wird auf Tailwind migriert und gelöscht
- App.css wird auf Tailwind migriert und gelöscht
- index.css behält nur Tailwind-Direktiven und globale Canvas/Scrollbar-Resets

## Capabilities

### New Capabilities

Keine.

### Modified Capabilities

- `game-web-spec`: Interaktionsschicht und Styling-Architektur — CSS-Strategie wechselt von komponentenspezifischen CSS-Dateien zu Tailwind-Utility-Klassen

## Impact

### Phase 1 — Toten Code löschen

**Zu löschende Komponenten:**
- `game-web/src/components/GameContainer.tsx`
- `game-web/src/components/ResponsiveGameBoard.tsx`
- `game-web/src/components/HandDisplay.tsx`
- `game-web/src/components/FaceUpCards.tsx`
- `game-web/src/components/PlayerHand.tsx`
- `game-web/src/components/OpponentPortals.tsx`
- `game-web/src/components/DiscardButton.tsx`
- `game-web/src/components/TurnIndicatorDisplay.tsx`
- `game-web/src/components/LayoutCustomizationPanel.tsx`
- `game-web/src/components/GameLog.tsx`
- `game-web/src/components/CardInfo.tsx`
- `game-web/src/components/GameStartScreen.tsx`
- `game-web/src/components/GameFinishedScreen.tsx`

**Zu löschende Contexts:**
- `game-web/src/contexts/LayoutContext.tsx`

**Zu löschende Hooks:**
- `game-web/src/hooks/useResponsiveLayout.ts`
- `game-web/src/hooks/useLayoutPreferences.ts`
- `game-web/src/hooks/useViewportSize.ts`
- `game-web/src/hooks/useToastManager.ts`

**Zu löschende Lib-Dateien:**
- `game-web/src/lib/gameHitTest.ts`
- `game-web/src/lib/zoomCompensation.ts`
- `game-web/src/lib/layoutCalculations.ts`
- `game-web/src/lib/layoutPresets.ts`
- `game-web/src/lib/layoutTypes.ts`

**Zu löschende CSS:**
- `game-web/src/styles/Accessibility.css`
- `game-web/src/styles/Animations.css`
- `game-web/src/styles/cardButtons.module.css`
- `game-web/src/styles/costPaymentDialog.css`
- `game-web/src/styles/layoutCustomization.css`
- `game-web/src/styles/responsiveLayout.css`

**Tests bereinigen:**
- `game-web/src/test/accessibility.test.ts` — löschen (testet ausschließlich totes Layout-System)
- `game-web/src/test/layout.test.ts` — löschen (testet ausschließlich totes Layout-System)
- `game-web/src/test/App.test.tsx` — ErrorDisplay-Tests entfernen (nur noch tote Komponente)
- `game-web/src/test/errorDisplay.recovery.test.tsx` — löschen (testet nur ErrorDisplay, toter Code)
- `game-web/src/test/gameStartScreen.resume.test.tsx` — löschen (testet toten GameStartScreen)

### Phase 2 — CSS auf Tailwind migrieren

**Zu migrieren und danach löschen:**
- `game-web/src/styles/dialogModal.css` → Tailwind-Klassen in `CanvasGameBoard.tsx`
- `game-web/src/styles/Dialog.css` → Tailwind-Klassen in `ConfirmDialog.tsx`
- `game-web/src/styles/characterActivationDialog.css` → Tailwind-Klassen in `CharacterActivationDialog.tsx`
- `game-web/src/styles/characterReplacementDialog.css` → Tailwind-Klassen in `CharacterReplacementDialog.tsx`
- `game-web/src/styles/discardCardsDialog.css` → Tailwind-Klassen in `DiscardCardsDialog.tsx`
- `game-web/src/styles/activatedCharacterDetailView.css` → Tailwind-Klassen in `ActivatedCharacterDetailView.tsx`
- `game-web/src/styles/playerNameDisplay.css` → Tailwind-Klassen in `PlayerNameDisplay.tsx`
- `game-web/src/styles/Toast.css` → Tailwind-Klassen in `Toast.tsx`
- `game-web/src/styles/ErrorBoundary.css` → Tailwind-Klassen in `ErrorBoundary.tsx`
- `game-web/src/styles/App.css` → Tailwind-Klassen in `App.tsx` (oder löschen)
- `game-web/src/styles/Components.css` → nur noch ErrorDisplay importiert es; nach ErrorDisplay-Löschung entfällt es
- `game-web/src/index.css` — behält Tailwind-Direktiven + globale Canvas-Resets

**Keine Änderungen an:**
- Game Logic (shared, backend)
- boardgame.io-Integration
- Canvas-Rendering-Code (gameRender.ts, canvasRegions.ts)
- Lobby-Komponenten (LobbyScreen, MatchList, CreateMatch, WaitingRoom)
