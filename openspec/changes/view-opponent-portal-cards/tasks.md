## 1. canvasRegions.ts — Region-Erzeugung entkoppeln

- [x] 1.1 In `canvasRegions.ts` den `isActive`-Guard für `opponent-portal-card` entfernen: die Regions werden für ALLE belegten Portal-Slots aller `neighborOpponents` erzeugt, unabhängig von `isActive` und `actionCount`
- [x] 1.2 Den Irrlicht-Filter (`if (!isIrrlicht) continue`) ebenfalls entfernen, sodass alle Portal-Karten Regions bekommen (nicht nur irrlicht-fähige)

## 2. CanvasGameBoard — Klick-Handler entkoppeln

- [x] 2.1 Den `opponent-portal-card`-Case aus `handleCardClick` (innerhalb `isActive`) herauslösen und direkt neben `opponent-activated-character` als eigenen `else if`-Zweig außerhalb von `isActive` platzieren
- [x] 2.2 Im neuen Handler: wenn `isActive && isIrrlicht(entry.card)` → bisheriges `dialog.openActivationDialog(...)` aufrufen; sonst → neuen lokalen State für Detail-View setzen

## 3. CanvasGameBoard — Detail-View State und Rendering

- [x] 3.1 Lokalen State `activeOpponentPortalCard: { playerId: string; slotIndex: number } | null` anlegen
- [x] 3.2 Den Lookup des Portal-Entry aus State berechnen: `const activeOpponentPortalCardData = activeOpponentPortalCard ? G.players?.[activeOpponentPortalCard.playerId]?.portal[activeOpponentPortalCard.slotIndex] ?? null : null`
- [x] 3.3 Eine dritte `<ActivatedCharacterDetailView>`-Instanz im JSX rendern mit `character={activeOpponentPortalCardData}` und `onClose={() => setActiveOpponentPortalCard(null)}`
- [x] 3.4 Escape-Key-Handler in `useEffect` um `if (activeOpponentPortalCard !== null) setActiveOpponentPortalCard(null)` ergänzen

## 4. Qualitätssicherung

- [x] 4.1 TypeScript-Typen prüfen: `cd game-web && pnpm run type-check` ohne Fehler
