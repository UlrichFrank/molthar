## 1. Konstanten anpassen (cardLayoutConstants.ts)

- [x] 1.1 `ACTIVATED_GRID_COLS` von 4 auf 3 setzen
- [x] 1.2 `ACTIVATED_MAX` (→ `ACTIVATED_PAGE_SIZE`) von 8 auf 6 setzen
- [x] 1.3 `ACTIVATED_CARD_W/H` auf Faktor 0.90 von CARD_W/H anpassen (war 0.75)
- [x] 1.4 Neue Konstanten für Pfeil-Rendering hinzufügen: `ACTIVATED_ARROW_SIZE`, `ACTIVATED_ARROW_MARGIN`, Farben für aktiv/inaktiv/hover

## 2. Region-System erweitern (canvasRegions.ts)

- [x] 2.1 Neuen RegionType `'activated-page-arrow'` mit Feldern `direction: 'prev' | 'next'` und `playerId: string | 'own'` definieren
- [x] 2.2 `buildRegions` um `ownActivatedPage: number` und `opponentActivatedPages: Record<string, number>` erweitern
- [x] 2.3 activated-character-Regionen auf aktive Seite einschränken (slice per page); absolute `id` beibehalten
- [x] 2.4 Pfeil-Regionen für eigenen Spieler registrieren (links + rechts neben Grid, vertikal zentriert)
- [x] 2.5 Pfeil-Regionen für Gegner-Bereiche registrieren (in virtuellen Koordinaten, korrekt rotiert)

## 3. Render-Funktionen (gameRender.ts)

- [x] 3.1 `drawActivatedCharacters` um `page`-Parameter erweitern; Karten-Slice entsprechend anpassen
- [x] 3.2 Neue Funktion `drawActivatedPageArrows(ctx, totalCount, currentPage, gridX, gridY, gridH)` implementieren: zeichnet linkes und rechtes Dreieck, Farbe abhängig von Klickbarkeit
- [x] 3.3 Hover-Zustand in `drawActivatedPageArrows` berücksichtigen (hoveredRegion-Parameter)
- [x] 3.4 `drawActivatedCharacters` und `drawActivatedPageArrows` in `drawOpponentZone` integrieren (mit OPP_SCALE und page-Parameter)

## 4. State & Interaktion (CanvasGameBoard.tsx)

- [x] 4.1 State `ownActivatedPage: 0 | 1` hinzufügen (Initialwert: 0)
- [x] 4.2 State `opponentActivatedPage: Record<string, 0 | 1>` hinzufügen
- [x] 4.3 `useEffect` für Auto-advance: wenn `activatedCharacters.length > ACTIVATED_PAGE_SIZE` und `ownActivatedPage === 0` → setze auf 1
- [x] 4.4 Rückfall-Reset: wenn `activatedCharacters.length <= ACTIVATED_PAGE_SIZE` und `ownActivatedPage === 1` → setze auf 0
- [x] 4.5 Click-Handler für `'activated-page-arrow'` Region: `direction` und `playerId` auswerten, entsprechende Page toggling
- [x] 4.6 `buildRegions`-Aufruf um page-Parameter erweitern
- [x] 4.7 Canvas-Render-Aufruf um page-Parameter erweitern
