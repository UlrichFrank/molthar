## Why

Der `PlayerStatusBadge` wird als HTML-Overlay über dem Canvas positioniert und überlappt die Hand-Spielkarten des Spielers. Das beeinträchtigt die Lesbarkeit und potenziell die Klickbarkeit der Karten. Statt das Layout zu verschieben wird der Badge durch ein kleines Icon am Bildschirmrand ersetzt, das beim Klick den bereits vorhandenen `PlayerStatusDialog` öffnet.

## What Changes

- `PlayerStatusBadge` wird durch ein neues `PlayerStatusIcon` ersetzt: ein kleines Symbol-Button am Canvas-Rand, zentriert auf den jeweiligen Spielerbereich
- Der `PlayerStatusDialog` bleibt unverändert — er wird weiterhin per Klick auf das Icon geöffnet
- Aktiver-Zug-Indikator (gelber Glüheffekt) bleibt am Icon sichtbar
- Der explizit sichtbare Action-Counter (z.B. `3/4`) entfällt aus der Daueranzeige — er ist im Dialog einsehbar

**Icon-Positionen:**
- Eigener Spieler: unterer Canvas-Rand, horizontal zentriert auf die Spielerzone
- Gegner links: linker Canvas-Rand, vertikal zentriert auf die linke Opponent-Zone
- Gegner oben-links/rechts: oberer Canvas-Rand, horizontal zentriert auf jeweilige Top-Zone
- Gegner rechts: rechter Canvas-Rand, vertikal zentriert auf die rechte Opponent-Zone

## Capabilities

### New Capabilities

- `player-status-icon`: Kleines Icon am Canvas-Rand (statt vollständigem Badge), das den `PlayerStatusDialog` öffnet; zeigt Aktiv-Zug-Status per Leuchteffekt

### Modified Capabilities

- `player-status-badge`: Wird durch `player-status-icon` ersetzt; bisherige Badge-Funktionalität entfällt

## Impact

- `game-web/src/components/PlayerStatusBadge.tsx` — wird zu `PlayerStatusIcon` umgebaut oder ersetzt
- `game-web/src/components/CanvasGameBoard.tsx` — Icon-Positionierung statt Badge-Positionierung
- `game-web/src/components/PlayerStatusDialog.tsx` — unverändert
