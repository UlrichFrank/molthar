## Phase 1 — Toten Code löschen

### 1.1 Tote CSS-Dateien löschen

- [ ] 1.1.1 `game-web/src/styles/Accessibility.css` löschen
- [ ] 1.1.2 `game-web/src/styles/Animations.css` löschen
- [ ] 1.1.3 `game-web/src/styles/cardButtons.module.css` löschen
- [ ] 1.1.4 `game-web/src/styles/costPaymentDialog.css` löschen
- [ ] 1.1.5 `game-web/src/styles/layoutCustomization.css` löschen
- [ ] 1.1.6 `game-web/src/styles/responsiveLayout.css` löschen

### 1.2 Tote Leaf-Komponenten löschen

- [ ] 1.2.1 `game-web/src/components/HandDisplay.tsx` löschen
- [ ] 1.2.2 `game-web/src/components/FaceUpCards.tsx` löschen
- [ ] 1.2.3 `game-web/src/components/OpponentPortals.tsx` löschen
- [ ] 1.2.4 `game-web/src/components/DiscardButton.tsx` löschen
- [ ] 1.2.5 `game-web/src/components/TurnIndicatorDisplay.tsx` löschen
- [ ] 1.2.6 `game-web/src/components/CardInfo.tsx` löschen
- [ ] 1.2.7 `game-web/src/components/ErrorDisplay.tsx` löschen
- [ ] 1.2.8 `game-web/src/components/GameLog.tsx` löschen

### 1.3 Tote Container-Komponenten löschen

- [ ] 1.3.1 `game-web/src/components/PlayerHand.tsx` löschen
- [ ] 1.3.2 `game-web/src/components/GameStartScreen.tsx` löschen
- [ ] 1.3.3 `game-web/src/components/GameFinishedScreen.tsx` löschen
- [ ] 1.3.4 `game-web/src/components/ResponsiveGameBoard.tsx` löschen (inkl. Import von `responsiveLayout.css` bereits durch 1.1.6 entfernt)
- [ ] 1.3.5 `game-web/src/components/GameContainer.tsx` löschen
- [ ] 1.3.6 `game-web/src/components/LayoutCustomizationPanel.tsx` löschen

### 1.4 Totes Layout-Customization-System löschen

- [ ] 1.4.1 `game-web/src/lib/layoutTypes.ts` löschen
- [ ] 1.4.2 `game-web/src/lib/layoutPresets.ts` löschen
- [ ] 1.4.3 `game-web/src/lib/layoutCalculations.ts` löschen
- [ ] 1.4.4 `game-web/src/hooks/useViewportSize.ts` löschen
- [ ] 1.4.5 `game-web/src/hooks/useLayoutPreferences.ts` löschen
- [ ] 1.4.6 `game-web/src/hooks/useResponsiveLayout.ts` löschen
- [ ] 1.4.7 `game-web/src/contexts/LayoutContext.tsx` löschen

### 1.5 Weitere tote Utilities und Hooks löschen

- [ ] 1.5.1 `game-web/src/lib/gameHitTest.ts` löschen
- [ ] 1.5.2 `game-web/src/lib/zoomCompensation.ts` löschen
- [ ] 1.5.3 `game-web/src/hooks/useToastManager.ts` löschen

### 1.6 Tests bereinigen

- [ ] 1.6.1 `game-web/src/test/accessibility.test.ts` löschen (testet ausschließlich totes Layout-System)
- [ ] 1.6.2 `game-web/src/test/layout.test.ts` löschen (testet ausschließlich totes Layout-System)
- [ ] 1.6.3 `game-web/src/test/errorDisplay.recovery.test.tsx` löschen (testet ausschließlich ErrorDisplay)
- [ ] 1.6.4 `game-web/src/test/gameStartScreen.resume.test.tsx` löschen (testet ausschließlich GameStartScreen)
- [ ] 1.6.5 `game-web/src/test/App.test.tsx` bereinigen: ErrorDisplay-bezogene Describe-Blöcke entfernen; verbleibende Tests prüfen
- [ ] 1.6.6 `make test-shared` ausführen — alle Tests müssen grün sein
- [ ] 1.6.7 TypeScript-Kompilierung prüfen: `cd game-web && pnpm run type-check` fehlerfrei

## Phase 2 — CSS auf Tailwind migrieren

### 2.1 Einfache Komponenten migrieren

- [ ] 2.1.1 `PlayerNameDisplay.tsx` auf Tailwind migrieren, `playerNameDisplay.css` löschen
- [ ] 2.1.2 `CanvasGameBoard.tsx` Dialog-Overlay (aus `dialogModal.css`) auf Tailwind migrieren, `dialogModal.css` löschen
- [ ] 2.1.3 `ErrorBoundary.tsx` auf Tailwind migrieren, `ErrorBoundary.css` löschen

### 2.2 ConfirmDialog migrieren

- [ ] 2.2.1 `ConfirmDialog.tsx` auf Tailwind migrieren, `Dialog.css` löschen

### 2.3 Toast migrieren

- [ ] 2.3.1 `Toast.tsx` auf Tailwind migrieren, `Toast.css` löschen

### 2.4 Dialog-Komponenten migrieren

- [ ] 2.4.1 `CharacterReplacementDialog.tsx` auf Tailwind migrieren, `characterReplacementDialog.css` löschen
- [ ] 2.4.2 `DiscardCardsDialog.tsx` auf Tailwind migrieren, `discardCardsDialog.css` löschen
- [ ] 2.4.3 `CharacterActivationDialog.tsx` auf Tailwind migrieren, `characterActivationDialog.css` löschen
- [ ] 2.4.4 `ActivatedCharacterDetailView.tsx` auf Tailwind migrieren, `activatedCharacterDetailView.css` löschen

### 2.5 Verbleibende CSS-Dateien aufräumen

- [ ] 2.5.1 `App.css` löschen, Import in `App.tsx` entfernen (keine Styles mehr nötig)
- [ ] 2.5.2 `Components.css` löschen (nach Phase 1 keine Importeure mehr)
- [ ] 2.5.3 `index.css` auf das Minimum reduzieren: nur `@import "tailwindcss"` + globale Resets

### 2.6 Verifikation

- [ ] 2.6.1 `make test-shared` — alle Tests grün
- [ ] 2.6.2 TypeScript-Kompilierung prüfen: `cd game-web && pnpm run type-check` fehlerfrei
- [ ] 2.6.3 Manuell testen: Alle Dialoge sehen korrekt aus (CharacterActivation, CharacterReplacement, DiscardCards, ConfirmDialog)
- [ ] 2.6.4 Manuell testen: Toast-Notifications erscheinen korrekt
- [ ] 2.6.5 Manuell testen: ErrorBoundary rendert korrekt bei Fehler
- [ ] 2.6.6 Manuell testen: PlayerNameDisplay erscheint korrekt
- [ ] 2.6.7 Manuell testen: ActivatedCharacterDetailView erscheint korrekt
