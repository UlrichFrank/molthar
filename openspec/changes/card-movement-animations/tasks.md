## 1. Infrastruktur — FlyingCard-Typen und Hilfsfunktionen

- [ ] 1.1 Neue Datei `game-web/src/lib/cardAnimations.ts` erstellen: Typ `FlyingCard` mit Feldern `id`, `imageName`, `from: {x,y}`, `to: {x,y}`, `startTime: number`, `duration: number`, `isThrowing: boolean`
- [ ] 1.2 Easing-Funktion `easeInOutCubic(t: number): number` in `cardAnimations.ts` implementieren
- [ ] 1.3 Funktion `getThrowTarget(from: {x,y}, canvasW: number, canvasH: number): {x,y}` implementieren — berechnet Auswurfpunkt am gegenüberliegenden Rand
- [ ] 1.4 Funktion `stepFlyingCards(cards: FlyingCard[], now: number): FlyingCard[]` implementieren — gibt nur noch aktive Karten zurück (abgelaufene entfernen)
- [ ] 1.5 Funktion `drawFlyingCards(ctx, cards: FlyingCard[], now: number, imageCache)` in `cardAnimations.ts` implementieren — interpoliert Position mit Easing, zeichnet Karte mit `drawImage`

## 2. State-Diff — Bewegungserkennung

- [ ] 2.1 Typ `CardMoveEvent` in `cardAnimations.ts` definieren: `{ imageName: string, from: {x,y}, to: {x,y} | null }` (`to: null` = Auswurf)
- [ ] 2.2 Funktion `diffGameState(prev: GameState, next: GameState, playerId: string, regions: CanvasRegion[]): CardMoveEvent[]` implementieren — erkennt Änderungen in Handkarten, Portal, Aktiviert, Auslage für alle Spieler

## 3. CanvasGameBoard — Integration

- [ ] 3.1 `prevGRef = useRef<GameState | null>(null)` in `CanvasGameBoard.tsx` hinzufügen
- [ ] 3.2 `flyingCardsRef = useRef<FlyingCard[]>([])` hinzufügen
- [ ] 3.3 `useEffect([G])`: `diffGameState(prevGRef.current, G, playerID, regions)` aufrufen, neue `FlyingCard`-Objekte erzeugen und zu `flyingCardsRef.current` hinzufügen (max 5 gesamt); dann `prevGRef.current = G` setzen
- [ ] 3.4 Im rAF-Loop nach dem normalen Zeichnen: `drawFlyingCards(ctx, flyingCardsRef.current, performance.now(), imageCache)` aufrufen und `flyingCardsRef.current = stepFlyingCards(...)` aktualisieren

## 4. Mitspieler-Positionierung

- [ ] 4.1 Hilfsfunktion `getOpponentCardWorldPos(playerIdx: number, zone: 'hand'|'portal'|'activated'|'deck', cardIdx: number): {x,y}` in `canvasRegions.ts` oder `cardAnimations.ts` ergänzen — nutzt bestehende Rotationsmatrix-Logik der Opponent-Zonen
- [ ] 4.2 `diffGameState` für Mitspieler-Handkarten, Mitspieler-Portal und Mitspieler-Aktiviert erweitern (nutzt 4.1)

## 5. Verifikation

- [ ] 5.1 Manuell testen: lokaler Spieler zieht Perlkarte → Fluganimation von Deck zur Hand sichtbar
- [ ] 5.2 Manuell testen: Charakterkarte aktivieren → Karte fliegt von Portal zu Aktiviert
- [ ] 5.3 Manuell testen: Handkarte verwerfen → Karte fliegt zum gegenüberliegenden Rand hinaus
- [ ] 5.4 Manuell testen: Mitspieler-Zug → Animation in deren rotierter Zone korrekt positioniert
- [ ] 5.5 Manuell testen: `rehandCards` (alle Handkarten neu) → max 5 Animationen gleichzeitig
