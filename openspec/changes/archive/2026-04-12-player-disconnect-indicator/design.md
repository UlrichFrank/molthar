## Context

boardgame.io übermittelt im Multiplayer-Modus den Verbindungsstatus aller Spieler über das `matchData`-Prop an das Board. Jeder Eintrag hat optional `isConnected: boolean`. Dieses Prop ist bereits in `CanvasGameBoardProps` vorhanden (wurde für die Namensanzeige eingeführt). Es sind keine Backend-Änderungen nötig.

Aktuell: Wenn der aktive Spieler offline geht, passiert auf der UI der anderen Spieler nichts — das Spiel hängt stumm.

## Goals / Non-Goals

**Goals:**
- Erkenne wenn ein Spieler nicht verbunden ist (`matchData[i].isConnected === false`)
- Zeige einen nicht-schließbaren Dialog mit rotierender Sanduhr und Spielername
- Dialog verschwindet automatisch wenn der Spieler zurückkommt
- Gilt für alle Spieler (nicht nur den aktiven), da boardgame.io alle Verbindungsstatus liefert

**Non-Goals:**
- Kein automatischer Kick nach Timeout
- Keine Unterscheidung zwischen "kurz offline" und "dauerhaft weg"
- Kein eigener Reconnect-Button (boardgame.io reconnectet automatisch)
- Kein Dialog für den Spieler selbst (er hat keinen Browser mehr)

## Decisions

### 1. Welche Spieler zeigen den Dialog?

**Entscheidung:** Alle verbundenen Spieler sehen den Dialog wenn irgendein anderer Spieler offline ist. Es wird der erste offline-Spieler angezeigt (nach playerOrder sortiert). Falls mehrere offline sind: nur einer angezeigt (z.B. "Warte auf Ulrich...").

**Alternativen verworfen:**
- *Nur bei aktivem Spieler*: Andere können ebenfalls offline gehen, ohne den Spielfluss zu unterbrechen

### 2. Sanduhr-Animation

**Entscheidung:** CSS-Keyframe-Animation (rotate 360°) auf einem ⏳-Emoji oder einem SVG-Spinner. Kein externes Paket. Inline-`<style>`-Tag oder Tailwind-Animation-Klasse (`animate-spin`).

**Alternativen verworfen:**
- *GIF*: Zusätzliches Asset, aufwändiger
- *Lottie*: Zu schwer für diesen Use Case

### 3. Priorität gegenüber anderen Dialogs

**Entscheidung:** Der Disconnect-Dialog wird über allen anderen Dialogen gerendert (`zIndex: 300`, höher als bestehende Dialoge bei `zIndex: 200`). Er blockiert Interaktion — sinnvoll, da ohne den fehlenden Spieler sowieso keine Aktion möglich ist.

### 4. Name des fehlenden Spielers

**Entscheidung:** Name wird aus `matchData` gelesen (`matchData.find(p => !p.isConnected)?.name`). Da `matchData` bereits die echten Lobby-Namen enthält, ist kein Fallback auf `G.players` nötig.

## Risks / Trade-offs

- **boardgame.io `isConnected` Latenz**: Es kann einige Sekunden dauern bis boardgame.io einen Disconnect erkennt. Der Dialog erscheint daher mit leichter Verzögerung. → Akzeptiert, kein Workaround nötig.
- **Falsch-Positive beim Seitenladen**: Beim ersten Render ist `isConnected` evtl. kurz `false` für alle. → Mitigation: Dialog erst nach 2 Sekunden anzeigen (`useEffect` mit Timeout), damit kurze Ladeflicker ignoriert werden.
