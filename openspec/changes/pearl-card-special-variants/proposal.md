## Why

Die Perlenkarten mit Wert 3, 4 und 5 verwenden als Kartenbild `Perlenkarte3-neu.png`, `Perlenkarte4-neu.png` bzw. `Perlenkarte5-neu.png`. Diese Bilder werden aktuell nicht korrekt geladen und angezeigt:

1. `imageLoaderV2.ts` lädt die `-neu`-Bilder nicht vor — das Canvas fällt auf den Fallback-Renderer zurück.
2. `gameRender.ts` wählt das Bild falsch anhand von `hasRefreshSymbol` statt anhand des Kartenwerts.
3. `DiscardCardsDialog` und `CharacterActivationDialog` verwenden immer `Perlenkarte${value}.png` — für Wert 3/4/5 das falsche Bild.

## What Changes

- `imageLoaderV2.ts`: `Perlenkarte3-neu.png`, `Perlenkarte4-neu.png`, `Perlenkarte5-neu.png` zum Preload-Katalog hinzufügen.
- Bildauswahl überall auf wertbasierte Logik umstellen: Wert 3, 4 oder 5 → `-neu`-Variante, sonst Standardname. `hasRefreshSymbol` wird für die Bildauswahl nicht verwendet.
- Betrifft: `gameRender.ts` (2 Stellen), `DiscardCardsDialog.tsx`, `CharacterActivationDialog.tsx`.

## Capabilities

### New Capabilities

_(keine neuen Capabilities)_

### Modified Capabilities

_(keine spec-level Änderungen — reine Bugfix-Implementierung)_

## Impact

- `game-web/src/lib/imageLoaderV2.ts` — 3 fehlende Bildnamen ergänzen
- `game-web/src/lib/gameRender.ts` — Bildauswahl für Perlenkarten auf wertbasierte Logik umstellen (2 Stellen)
- `game-web/src/components/DiscardCardsDialog.tsx` — `getImageSrc` auf wertbasierte Logik umstellen
- `game-web/src/components/CharacterActivationDialog.tsx` — `getImageSrc` auf wertbasierte Logik umstellen

---

**Zur Information — aktueller Perlenkarten-Bestand:**
- 7 Kopien je Wert 1–8 = **56 Perlenkarten** insgesamt
- Alle 8 Werte gleich oft vertreten (je 7×)
- Wert 3/4/5: erste Kopie hat `hasRefreshSymbol=true` + `hasSwapSymbol=true`
- Werte 1/2/6/7/8: erste Kopie hat nur `hasSwapSymbol=true`
