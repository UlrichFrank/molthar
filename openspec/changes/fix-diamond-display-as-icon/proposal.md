## Why

Das Feature `diamonds-as-character-cards` hat Diamanten von einem einfachen Zähler (`diamonds: number`) zu einem Array echter Charakterkarten (`diamondCards: CharacterCard[]`) geändert. Die Render-Funktion `drawPlayerPortal` in `gameRender.ts` wurde jedoch nicht vollständig angepasst: Sie zeigt Diamanten weiterhin als Emoji-Icons (`💎`), obwohl Diamanten jetzt Charakterkarten sind und als Charakterkarten-Rückseiten dargestellt werden sollen — analog zur physischen Spielregel, wo Diamanten als verdeckte Charakterkarten gestapelt liegen.

## What Changes

- `drawPlayerPortal` zeichnet Diamanten als kleine Charakterkarten-Rückseiten (Bild `Charakterkarte Hinten.png`) statt als `💎`-Emoji
- `PlayerPortalData` übergibt die `diamondCards`-Anzahl (oder das Array) statt dem alten `diamonds: number`-Feld
- Gegner-Portal-Rendering (`drawOpponentPortals`) wird ebenfalls angepasst, falls es Diamanten darstellt

## Capabilities

### New Capabilities

### Modified Capabilities
- `diamonds-as-character-cards`: Die visuelle Darstellung von Diamanten als Charakterkarten-Rückseiten wird jetzt vollständig umgesetzt (die Datenmodell-Änderung war bereits implementiert, das Rendering fehlte)

## Impact

- `game-web/src/lib/gameRender.ts` — `PlayerPortalData.diamonds`-Feld und `drawPlayerPortal`-Render-Logik
- `game-web/src/components/CanvasGameBoard.tsx` — Aufruf von `drawPlayerPortal` mit korrekten Daten
- Gegner-Portale: prüfen ob `drawOpponentPortals` ebenfalls Diamanten darstellt und ggf. anpassen
