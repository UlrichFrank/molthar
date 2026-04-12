## Why

Wenn ein Spieler die Verbindung verliert (Browser geschlossen, Netzwerkausfall o.ä.) läuft das Spiel für die anderen Spieler einfach weiter — ohne Hinweis. Der aktive Spieler kann keinen Zug machen, alle anderen warten ohne zu wissen warum. Ein sichtbarer Hinweis verhindert Verwirrung und unnötiges Warten.

## What Changes

- boardgame.io stellt über `matchData` den Verbindungsstatus jedes Spielers bereit — dieser wird ausgelesen
- Ein Dialog erscheint automatisch wenn der aktive Spieler (oder ein beliebiger anderer Spieler) offline ist
- Der Dialog zeigt eine rotierende Sanduhr-Animation und den Namen des abwesenden Spielers
- Der Dialog schließt sich automatisch wenn der Spieler wieder verbunden ist
- Für den abwesenden Spieler selbst erscheint kein Dialog (er sieht ohnehin nichts)

## Capabilities

### New Capabilities
- `player-disconnect-indicator`: Dialog mit Sanduhr-Animation der anzeigt wenn ein Spieler nicht erreichbar ist, und automatisch verschwindet wenn die Verbindung wiederhergestellt ist

### Modified Capabilities

*(keine bestehenden Spec-Capabilities betroffen)*

## Impact

- `game-web/src/components/CanvasGameBoard.tsx` — `matchData` auswerten, Disconnect-Dialog rendern
- `game-web/src/components/PlayerDisconnectDialog.tsx` — neue Komponente (Sanduhr, Spielername, Wartetext)
- Keine Backend-Änderungen — boardgame.io liefert den Verbindungsstatus bereits über `matchData` an das Board
