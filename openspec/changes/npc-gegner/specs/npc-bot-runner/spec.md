## ADDED Requirements

### Requirement: BotRunner startet Bot-Clients für NPC-Spieler
Der BotRunner SHALL pro NPC-Slot einen boardgame.io `Client` via SocketIO starten, der sich mit dem eigenen Server verbindet und als der entsprechende Spieler agiert.

#### Scenario: Bot-Client verbindet beim Match-Start
- **WHEN** ein Match mit NPC-Slots erstellt wird und der BotRunner das Match erkennt
- **THEN** verbindet sich ein Bot-Client für jeden NPC-Slot mit dem Server als dessen playerID

#### Scenario: BotRunner erkennt neue Matches beim Server-Start
- **WHEN** der Server neu startet und persistierte Matches mit npcSlots existieren
- **THEN** startet der BotRunner Bot-Clients für alle NPC-Slots dieser Matches

### Requirement: BotRunner reagiert auf Zugwechsel mit menschlicher Verzögerung
Wenn ein NPC an der Reihe ist, SHALL der BotRunner 1000–2500ms warten und dann `Step(client, bot)` aufrufen. Zwischen mehreren Aktionen desselben Zugs SHALL der BotRunner 800–1500ms warten.

#### Scenario: NPC-Zug mit Verzögerung
- **WHEN** boardgame.io meldet dass der aktuelle Spieler ein NPC ist
- **THEN** wartet der BotRunner 1000–2500ms und führt dann einen Zug aus

#### Scenario: Mehrere Aktionen pro Zug
- **WHEN** der NPC noch Aktionen übrig hat (actionCount < maxActions)
- **THEN** wartet der BotRunner 800–1500ms und führt die nächste Aktion aus

#### Scenario: Zug beenden nach allen Aktionen
- **WHEN** der NPC alle Aktionen verbraucht hat
- **THEN** dispatcht der BotRunner `endTurn`

### Requirement: BotRunner reconnectet bei Verbindungsverlust
Wenn ein Bot-Client die Verbindung verliert, SHALL der BotRunner nach 3s erneut versuchen zu verbinden.

#### Scenario: Reconnect nach Disconnect
- **WHEN** ein Bot-Client die SocketIO-Verbindung verliert
- **THEN** versucht der BotRunner nach 3s erneut zu verbinden

### Requirement: BotRunner räumt ab bei Match-Ende
Wenn ein Match beendet wird (gameover oder terminated), SHALL der BotRunner die zugehörigen Bot-Clients stoppen.

#### Scenario: Cleanup bei Gameover
- **WHEN** der Spielzustand `gameover` gesetzt wird
- **THEN** stoppt der BotRunner alle Bot-Clients dieses Matches und gibt Ressourcen frei
