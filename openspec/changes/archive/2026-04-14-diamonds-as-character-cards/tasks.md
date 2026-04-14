## 1. Typdefinition

- [x] 1.1 `shared/src/game/types.ts`: `PlayerState.diamonds: number` entfernen, `PlayerState.diamondCards: CharacterCard[]` hinzufügen

## 2. Game-Logic (index.ts)

- [x] 2.1 Setup: `diamonds: 0` → `diamondCards: []` in der Spieler-Initialisierung
- [x] 2.2 `activatePortalCard`: Diamant-Erwerb (`player.diamonds += entry.card.diamonds`) auf `drawCards`-Logik umstellen — N Karten vom `characterDeck` ziehen (mit Reshuffle-Guard) und in `player.diamondCards` pushen
- [x] 2.3 `activatePortalCard`: Diamant-Ausgabe für `decreaseWithPearl` (`player.diamonds -= diamondsToSpend`) umstellen — N Karten aus `player.diamondCards` entfernen → `characterDiscardPile`
- [x] 2.4 `activatePortalCard`: Diamant-Ausgabe für `diamond`-Kostenkomponenten (`player.diamonds -= diamondCosts`) umstellen — N Karten aus `player.diamondCards` entfernen → `characterDiscardPile`
- [x] 2.5 `activatePortalCard`: Validierung `player.diamonds + bonusDiamonds < diamondsToSpend` auf `player.diamondCards.length` umstellen
- [x] 2.6 `activateSharedCharacter`: gleiche Anpassungen wie 2.2–2.5 für den Irrlicht-Move
- [x] 2.7 `tradeForDiamond`-Move: `player.diamonds += 1` → 1 Karte vom `characterDeck` ziehen (mit Reshuffle-Guard) und in `player.diamondCards` pushen
- [x] 2.8 TypeScript-Fehler durch Umbenennung bereinigen (alle verbleibenden `player.diamonds`-Referenzen)

## 3. Gameover / Endgame

- [x] 3.1 `index.ts` Gameover-Logik: `diamonds`-Feld in Ranking-Objekt auf `diamondCards.length` umstellen (falls für Tiebreaker genutzt)
- [x] 3.2 `EndgameResultsDialog.tsx`: `diamonds: number`-Prop auf `diamondCards.length` aus dem Spielzustand umstellen

## 4. UI-Komponenten

- [x] 4.1 `CanvasGameBoard.tsx`: `me?.diamonds` → `me?.diamondCards.length` (Zeilen 183, 371, 388, 895)
- [x] 4.2 `PlayerStatusBadge.tsx`: `playerState.diamonds` → `playerState.diamondCards.length`
- [x] 4.3 `PlayerStatusDialog.tsx`: `playerState.diamonds` → `playerState.diamondCards.length`
- [x] 4.4 `CharacterActivationDialog.tsx`: `diamonds`-Prop-Übergabe auf `player.diamondCards.length` umstellen (im Aufrufer)
- [x] 4.5 `ActivatedCharacterDetailView.tsx`: `card.diamonds` prüfen — bezieht sich auf `diamondsReward` der Karte (nicht Player-State), bleibt unverändert

## 5. fix-diamond-cost-payment anpassen

- [x] 5.1 `openspec/changes/fix-diamond-cost-payment/tasks.md`: Tasks die `player.diamonds` referenzieren auf `player.diamondCards.length` aktualisieren

## 6. Verifikation

- [x] 6.1 Karte mit `diamondsReward=1` aktivieren → `player.diamondCards.length` steigt um 1, `characterDeck` schrumpft um 1
- [x] 6.2 `decreaseWithPearl` nutzen → Karte wandert von `player.diamondCards` in `characterDiscardPile`
- [x] 6.3 `tradeTwoForDiamond` nutzen → Karte kommt vom `characterDeck`, landet in `player.diamondCards`
- [x] 6.4 Alle bestehenden Shared-Tests laufen durch (`make test-shared`)
