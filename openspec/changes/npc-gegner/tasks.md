## 1. Shared: Payment Solver

- [x] 1.1 `shared/src/game/botPaymentSolver.ts` anlegen mit `findValidPayments(hand, cost, abilities?)` — Brute-Force über alle Teilmengen, nutzt `validateCost()` aus `costCalculation.ts`
- [x] 1.2 `chooseBestPayment(combinations, strategy, hand?)` implementieren für alle 5 Strategien (random, greedy, diamond, efficient, aggressive)
- [x] 1.3 `shared/src/game/botPaymentSolver.test.ts` anlegen mit Tests für findValidPayments (einfache Kosten, Diamanten, keine gültige Kombination) und chooseBestPayment (alle Strategien)
- [x] 1.4 Typen für `NpcStrategy` (`'random' | 'greedy' | 'diamond' | 'efficient' | 'aggressive'`) und `NpcSlotConfig` (`{ playerIndex: number, strategy: NpcStrategy, name: string }`) in `shared/src/game/types.ts` ergänzen
- [x] 1.5 Payment Solver und neue Typen aus `shared/src/index.ts` exportieren

## 2. Backend: Bot-Klassen

- [x] 2.1 `backend/src/bots/enumerate.ts` anlegen — `enumerateMoves(G, ctx, playerID)` gibt alle gültigen Züge zurück (takePearlCard 4 Slots + blind, takeCharacterCard, replacePearlSlots, endTurn)
- [x] 2.2 `activatePortalCard`-Optionen zu enumerate hinzufügen — nutzt `findValidPayments()` um alle bezahlbaren Kombinationen zu listen
- [x] 2.3 `backend/src/bots/IrrnisBot.ts` — RandomBot aus boardgame.io/ai mit `enumerate` aus 2.1
- [x] 2.4 `backend/src/bots/GierBot.ts` — custom Bot-Subklasse: aktiviert bezahlbare Karte mit max. Punkten; sonst höchste Perle
- [x] 2.5 `backend/src/bots/EdelsteinBot.ts` — priorisiert Karten mit meisten Diamanten; Perlenwahl passend zur Zielkarte
- [x] 2.6 `backend/src/bots/WendelinBot.ts` — wählt nach Punkte/Aufwand-Ratio; Zahlung erhält beste Restkarten
- [x] 2.7 `backend/src/bots/RalfBot.ts` — bevorzugt rote Fähigkeiten; greift Führenden an; Fallback auf GierBot-Logik
- [x] 2.8 `backend/src/bots/index.ts` — Factory `createBot(strategy: NpcStrategy)` die die richtige Klasse zurückgibt

## 3. Backend: BotRunner

- [x] 3.1 `backend/src/bot-runner.ts` anlegen — Klasse `BotRunner` mit `attachMatch(matchID, npcSlots)` und `detachMatch(matchID)`
- [x] 3.2 Pro NPC-Slot: boardgame.io `Client` mit `SocketIO({ server: 'http://localhost:PORT' })` erzeugen, starten, credentials aus Auto-Join nutzen
- [x] 3.3 Store-Subscription implementieren: prüft ob `ctx.currentPlayer` ein NPC-Slot ist → wartet 1000–2500ms → `Step(client, bot)` → zwischen Aktionen 800–1500ms warten
- [x] 3.4 Reconnect-Logik: bei Verbindungsverlust nach 3s erneut verbinden
- [x] 3.5 Cleanup bei Gameover: Store-Subscription erkennt `gameover` → `client.stop()` für alle Bots des Matches
- [x] 3.6 `BotRunner.scanExistingMatches(lobbyClient)` — beim Server-Start alle Matches mit `npcSlots` in setupData laden und Bots neu starten
- [x] 3.7 `server-bgio.ts` anpassen: BotRunner-Singleton nach Server-Start initialisieren, `scanExistingMatches()` aufrufen; Polling alle 5s für neue Matches

## 4. Lobby UI: Match-Erstellung mit NPC-Konfiguration

- [x] 4.1 `CreateMatch.tsx` umbauen: Slot-basierte Ansicht statt einfacher Spielerzahl-Auswahl — Gesamt 2–5, jeder Slot toggle Mensch/NPC
- [x] 4.2 Strategie-Dropdown pro NPC-Slot mit allen 5 Optionen (Fantasy-Name + kurzer Descriptor)
- [x] 4.3 Validierung: "Erstellen" deaktiviert wenn kein menschlicher Slot vorhanden
- [x] 4.4 `LobbyScreen.tsx`: `npcSlots`-State verwalten; `createMatch()` erweitern — nach `createMatch` für jeden NPC-Slot `joinMatch()` aufrufen mit NPC-Name als playerName
- [x] 4.5 `npcSlots` in `setupData` beim `createMatch`-Aufruf übergeben (`lobbyClient.createMatch(..., { setupData: { withSpecialCards, npcSlots } })`)

## 5. Lobby UI: WaitingRoom anpassen

- [x] 5.1 `WaitingRoom.tsx`: `humanPlayerCount` als Prop hinzufügen (Gesamtspieler minus NPC-Slots)
- [x] 5.2 Polling-Logik anpassen: wartet auf `joinedCount >= humanPlayerCount` statt `totalPlayers`
- [x] 5.3 `LobbyScreen.tsx`: `humanPlayerCount` berechnen und an WaitingRoom übergeben

## 6. i18n

- [x] 6.1 Übersetzungsschlüssel für NPC-Strategienamen und Lobby-UI in DE/EN/FR ergänzen (Strategie-Labels, "NPC"-Bezeichnung, Tooltip-Texte)

## 7. Tests & Verifikation

- [ ] 7.1 Manueller Test: Solo-Spiel (1 Mensch + 1 NPC) mit jeder Strategie durchspielen
- [ ] 7.2 Manueller Test: Server-Neustart während NPC-Spiel → Bots reconnecten
- [ ] 7.3 Manueller Test: 2 Menschen + 1 NPC — WaitingRoom wartet korrekt auf beide Menschen
- [x] 7.4 Unit-Tests Payment Solver grün: `cd shared && pnpm test -- --run botPaymentSolver.test.ts`
