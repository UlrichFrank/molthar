## Context

Portale von Molthar läuft als boardgame.io Multiplayer-Spiel. Alle Spielzüge werden server-seitig validiert. Jeder Spieler verbindet sich als boardgame.io `Client` via SocketIO. Der Server verwaltet den gesamten Spielzustand.

boardgame.io 0.50 bietet eine `Bot`-Basisklasse sowie `RandomBot` und `MCTSBot` in `boardgame.io/ai`. `Step(client, bot)` lässt einen Bot einen Zug auf einem Client ausführen. Ein Bot-Client ist technisch identisch zu einem menschlichen Client — er verbindet sich als Spieler via SocketIO und dispatcht Moves.

Bestehende costCalculation.ts validiert ob eine gegebene Kartenmenge eine Kostenbedingung erfüllt (one-way). Eine Rückwärtssuche (welche Teilmengen der Hand erfüllen die Kosten?) existiert noch nicht.

## Goals / Non-Goals

**Goals:**
- NPC-Spieler agieren als vollwertige boardgame.io-Clients
- 5 unterscheidbare Strategien mit steigendem Schwierigkeitsgrad
- Menschlich wirkende Verzögerung bei NPC-Zügen
- Keine Änderung an Spiellogik oder Validierungscode
- Payment Solver als eigenständig testbares Modul in shared/

**Non-Goals:**
- MCTSBot / lernende KI
- NPC-Aktionslog im Frontend
- Matches ohne mindestens einen menschlichen Spieler
- Dynamische Schwierigkeit zur Laufzeit

## Decisions

### D1: Bot-Clients laufen server-seitig im Backend-Prozess

**Entscheidung:** Bot-Clients werden im Backend-Prozess (`bot-runner.ts`) als Node.js-`Client`-Instanzen gestartet, die sich via SocketIO mit dem eigenen Server verbinden.

**Alternativen:**
- *Separater Bot-Prozess*: Aufwändigere Orchestrierung, kein Mehrwert
- *Host-Client steuert NPCs*: Host-Abhängigkeit; fällt der Host-Browser weg, spielen keine NPCs mehr
- *Server-internes Move-Dispatching ohne Client*: boardgame.io unterstützt das nicht direkt ohne die interne API zu umgehen

**Rationale:** Einfachste Integration mit boardgame.io-Bordmitteln; Bot verhält sich exakt wie ein Mensch.

---

### D2: Regelbasierte Bots statt MCTSBot

**Entscheidung:** Alle 5 Strategien implementieren `Bot` mit eigener `play()`-Methode.

**Alternativen:**
- *MCTSBot*: Benötigt `enumerate()` mit allen gültigen `activatePortalCard`-Kombinationen. Bei Handgröße 7+ und komplexem Kostensystem sind das >256 Kombinationen × 1000 Iterationen × 50 Tiefe — zu langsam für einen spielbaren Gegner.

**Rationale:** Vorhersehbares Verhalten, einstellbarer Schwierigkeitsgrad, keine Laufzeitprobleme.

---

### D3: Payment Solver via Teilmengen-Enumeration

**Entscheidung:** `findValidPayments()` iteriert über alle 2^n Teilmengen der Hand und prüft jede mit dem bestehenden `validateCost()` aus `costCalculation.ts`.

**Alternativen:**
- *Constraint Solver / Backtracking*: Effizienter, aber deutlich komplexer; nicht nötig bei max. 8 Handkarten (2^8 = 256 Iterationen).

**Rationale:** Einfach, korrekt, nutzt bestehende Validierungslogik ohne Duplikation.

---

### D4: NPC-Slots werden beim Match-Erstellen automatisch gejoint

**Entscheidung:** Nach `lobbyClient.createMatch()` ruft das Frontend für jeden NPC-Slot sofort `lobbyClient.joinMatch()` auf. Der BotRunner erhält `npcSlots` aus `setupData` und verbindet sich.

**Alternativen:**
- *Server-seitiger Auto-Join nach Match-Erstellung*: Würde boardgame.io-Server-Code erfordern, der nach der Match-Erstellung Joins triggert — keine saubere Hook-Stelle in 0.50.

**Rationale:** Frontend kennt die NPC-Konfiguration bereits; Auto-Join ist einfach über die bestehende Lobby-API möglich.

---

### D5: Menschlich wirkende Verzögerung via setTimeout im BotRunner

**Entscheidung:** Pro Zug-Wechsel wartet der BotRunner 1000–2500ms (zufällig) bevor `Step()` aufgerufen wird. Zwischen mehreren Aktionen desselben Zugs weitere 800–1500ms.

**Rationale:** Ohne Verzögerung wirken NPC-Züge instantan und desorientierend. Der Spieler soll den Zustand verfolgen können.

---

### D6: BotRunner-Lifecycle über Server-Startup-Hook

**Entscheidung:** `server-bgio.ts` startet beim Boot einen `BotRunner`-Singleton. Dieser pollt beim Start alle offenen Matches mit `npcSlots` in `setupData` und verbindet Bot-Clients. Neue Matches werden über die Lobby-API erkannt (Polling alle 5s).

**Rationale:** boardgame.io 0.50 hat keinen Server-seitigen Match-Created-Hook. Polling ist zuverlässig und ausreichend bei geringer Match-Anzahl.

## Risks / Trade-offs

- **[Risiko] Bot-Client-Verbindung fällt weg** → BotRunner erkennt Disconnect im Store (state wird undefined) und reconnectet automatisch nach 3s.
- **[Risiko] Server-Neustart löscht Bot-Clients** → BotRunner scannt beim Start alle persistierten Matches und startet fehlende Bots neu (setupData bleibt erhalten).
- **[Trade-off] Polling für neue Matches** → 5s-Delay zwischen Match-Erstellung und Bot-Join. WaitingRoom zeigt NPC-Slots als "wartend" bis Join erfolgt — wird durch schnelles Polling kaschiert (2s im WaitingRoom-Check).
- **[Risiko] enumerate() für RandomBot muss vollständig sein** → Unvollständige enumerate()-Implementierung führt zu illegal moves. Muss gründlich getestet werden.

## Migration Plan

1. Deploy: shared-Build → Backend-Build → Deploy
2. Bestehende Matches (ohne `npcSlots` in setupData) funktionieren unverändert weiter
3. Kein Daten-Rollback nötig; `npcSlots` ist optional in setupData

## Open Questions

- Soll der BotRunner beim Match-Ende (gameover) die Bot-Clients explizit disconnecten, oder reicht es den GC walten zu lassen?
- Soll die Strategie im Frontend irgendwo während des Spiels sichtbar sein (z.B. als Tooltip beim NPC-Namen)?
