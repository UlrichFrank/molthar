## 1. Initiale Handkarten entfernen

- [ ] 1.1 In `shared/src/game/index.ts` den Block `// Deal initial pearl cards to players (3 cards each)` (die `for`-Schleife die 3 Karten je Spieler ausgibt) aus `setup` entfernen

## 2. Startspieler als ersten Zug festlegen

- [ ] 2.1 In `shared/src/game/index.ts` im `turn`-Block eine `order`-Eigenschaft hinzufügen mit:
  - `first: ({ G, ctx }: any) => { const idx = ctx.playOrder.indexOf(G.startingPlayer); return idx >= 0 ? idx : 0; }`
  - `next: ({ G, ctx }: any) => (ctx.playOrderPos + 1) % ctx.playOrder.length`

## 3. Tests anpassen

- [ ] 3.1 Alle Tests in `shared/src/game/` prüfen, ob sie einen nicht-leeren initialen Handkartenstand voraussetzen, und diese entsprechend anpassen (Hand leer lassen oder Karten explizit vor dem Testschritt hinzufügen)
