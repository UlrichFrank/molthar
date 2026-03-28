## Phase 1 — Toten Code löschen

### 1.1 Tote CSS-Dateien löschen

- [x] 1.1.1 `game-web/src/styles/Accessibility.css` löschen
- [x] 1.1.2 `game-web/src/styles/Animations.css` löschen
- [x] 1.1.3 `game-web/src/styles/cardButtons.module.css` löschen
- [x] 1.1.4 `game-web/src/styles/costPaymentDialog.css` löschen
- [x] 1.1.5 `game-web/src/styles/layoutCustomization.css` löschen
- [x] 1.1.6 `game-web/src/styles/responsiveLayout.css` löschen

### 1.2 Tote Leaf-Komponenten löschen

- [x] 1.2.1 `game-web/src/components/HandDisplay.tsx` löschen
- [x] 1.2.2 `game-web/src/components/FaceUpCards.tsx` löschen
- [x] 1.2.3 `game-web/src/components/OpponentPortals.tsx` löschen
- [x] 1.2.4 `game-web/src/components/DiscardButton.tsx` löschen
- [x] 1.2.5 `game-web/src/components/TurnIndicatorDisplay.tsx` löschen
- [x] 1.2.6 `game-web/src/components/CardInfo.tsx` löschen
- [x] 1.2.7 `game-web/src/components/ErrorDisplay.tsx` löschen
- [x] 1.2.8 `game-web/src/components/GameLog.tsx` löschen

### 1.3 Tote Container-Komponenten löschen

- [x] 1.3.1 `game-web/src/components/PlayerHand.tsx` löschen
- [x] 1.3.2 `game-web/src/components/GameStartScreen.tsx` löschen
- [x] 1.3.3 `game-web/src/components/GameFinishedScreen.tsx` löschen
- [x] 1.3.4 `game-web/src/components/ResponsiveGameBoard.tsx` löschen (inkl. Import von `responsiveLayout.css` bereits durch 1.1.6 entfernt)
- [x] 1.3.5 `game-web/src/components/GameContainer.tsx` löschen
- [x] 1.3.6 `game-web/src/components/LayoutCustomizationPanel.tsx` löschen

### 1.4 Totes Layout-Customization-System löschen

- [x] 1.4.1 `game-web/src/lib/layoutTypes.ts` löschen
- [x] 1.4.2 `game-web/src/lib/layoutPresets.ts` löschen
- [x] 1.4.3 `game-web/src/lib/layoutCalculations.ts` löschen
- [x] 1.4.4 `game-web/src/hooks/useViewportSize.ts` löschen
- [x] 1.4.5 `game-web/src/hooks/useLayoutPreferences.ts` löschen
- [x] 1.4.6 `game-web/src/hooks/useResponsiveLayout.ts` löschen
- [x] 1.4.7 `game-web/src/contexts/LayoutContext.tsx` löschen

### 1.5 Weitere tote Utilities und Hooks löschen

- [x] 1.5.1 `game-web/src/lib/gameHitTest.ts` löschen
- [x] 1.5.2 `game-web/src/lib/zoomCompensation.ts` löschen
- [x] 1.5.3 `game-web/src/hooks/useToastManager.ts` löschen

### 1.6 Tests bereinigen

- [x] 1.6.1 `game-web/src/test/accessibility.test.ts` löschen (testet ausschließlich totes Layout-System)
- [x] 1.6.2 `game-web/src/test/layout.test.ts` löschen (testet ausschließlich totes Layout-System)
- [x] 1.6.3 `game-web/src/test/errorDisplay.recovery.test.tsx` löschen (testet ausschließlich ErrorDisplay)
- [x] 1.6.4 `game-web/src/test/gameStartScreen.resume.test.tsx` löschen (testet ausschließlich GameStartScreen)
- [x] 1.6.5 `game-web/src/test/App.test.tsx` bereinigen: ErrorDisplay-bezogene Describe-Blöcke entfernen; verbleibende Tests prüfen
- [x] 1.6.6 `make test-shared` ausführen — alle Tests müssen grün sein
- [x] 1.6.7 TypeScript-Kompilierung prüfen: `cd game-web && pnpm run type-check` fehlerfrei

## Phase 2 — CSS auf Tailwind migrieren

### 2.1 Einfache Komponenten migrieren

- [x] 2.1.1 `PlayerNameDisplay.tsx` auf Tailwind migrieren, `playerNameDisplay.css` löschen
- [x] 2.1.2 `CanvasGameBoard.tsx` Dialog-Overlay (aus `dialogModal.css`) auf Tailwind migrieren, `dialogModal.css` löschen
- [x] 2.1.3 `ErrorBoundary.tsx` auf Tailwind migrieren, `ErrorBoundary.css` löschen

### 2.2 ConfirmDialog migrieren

- [x] 2.2.1 `ConfirmDialog.tsx` war selbst toter Code (nicht importiert, kaputtes accessibility-Import) → gelöscht zusammen mit `Dialog.css` und den zugehörigen Tests

### 2.3 Toast migrieren

- [x] 2.3.1 `Toast.tsx` war selbst toter Code (nicht importiert) → gelöscht zusammen mit `Toast.css`, `useToast.ts` und `toast.test.tsx`

### 2.4 Dialog-Komponenten migrieren

- [x] 2.4.1 `CharacterReplacementDialog.tsx` auf Tailwind migrieren, `characterReplacementDialog.css` löschen
- [x] 2.4.2 `DiscardCardsDialog.tsx` auf Tailwind migrieren, `discardCardsDialog.css` löschen
- [x] 2.4.3 `CharacterActivationDialog.tsx` auf Tailwind migrieren, `characterActivationDialog.css` löschen
- [x] 2.4.4 `ActivatedCharacterDetailView.tsx` auf Tailwind migrieren, `activatedCharacterDetailView.css` löschen

### 2.5 Verbleibende CSS-Dateien aufräumen

- [x] 2.5.1 `App.css` bereinigt: tote Sections (GameContainer-Styles, btn, player-list etc.) entfernt; Lobby-Styles behalten (noch von LobbyScreen, MatchList, CreateMatch, WaitingRoom verwendet)
- [x] 2.5.2 `Components.css` löschen (nach Phase 1 keine Importeure mehr)
- [x] 2.5.3 `index.css` bereits minimal (Tailwind-Direktiven + globale Resets) — keine Änderung nötig

### 2.6 Verifikation

- [x] 2.6.1 `make test-shared` — alle Tests grün
- [x] 2.6.2 TypeScript-Kompilierung prüfen: `cd game-web && pnpm run type-check` fehlerfrei
- [ ] 2.6.3 Manuell testen: Alle Dialoge sehen korrekt aus (CharacterActivation, CharacterReplacement, DiscardCards, ConfirmDialog)
- [ ] 2.6.4 Manuell testen: Toast-Notifications erscheinen korrekt
- [ ] 2.6.5 Manuell testen: ErrorBoundary rendert korrekt bei Fehler
- [ ] 2.6.6 Manuell testen: PlayerNameDisplay erscheint korrekt
- [ ] 2.6.7 Manuell testen: ActivatedCharacterDetailView erscheint korrekt
