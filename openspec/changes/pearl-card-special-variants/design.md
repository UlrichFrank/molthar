## Context

Der Perlenkarten-Deck enthält 56 Karten (7× Wert 1–8). Die Karten mit Wert 3, 4, 5 haben je eine Sondervariante (`hasRefreshSymbol=true`), die das Refresh-Symbol trägt und ein eigenes Bild besitzt (`Perlenkarte3-neu.png` etc.). Die Canvas-Rendering-Logik in `gameRender.ts` wählt bereits korrekt zwischen Standard- und `-neu`-Bild. Zwei Stellen fehlen noch: Preloading und die Dialoge.

## Goals / Non-Goals

**Goals:**
- `-neu`-Bilder im Image-Preloader registrieren
- `DiscardCardsDialog` und `CharacterActivationDialog` zeigen das korrekte Bild je nach `hasRefreshSymbol`

**Non-Goals:**
- Änderungen an der Spiellogik oder dem Deck-Aufbau
- Neue Karten hinzufügen oder Anzahl ändern

## Decisions

- **Preloader**: `imageLoaderV2.ts` enthält eine statische Liste von Bildnamen. Drei Einträge hinzufügen: `'Perlenkarte3-neu.png'`, `'Perlenkarte4-neu.png'`, `'Perlenkarte5-neu.png'` — direkt nach den Standard-Perlenkarten.
- **Bildauswahl**: Alle Stellen, die den Dateinamen einer Perlenkarte ableiten, verwenden wertbasierte Logik: `` value === 3 || value === 4 || value === 5 ? `Perlenkarte${value}-neu.png` : `Perlenkarte${value}.png` ``. `hasRefreshSymbol` steuert nur die Spiellogik (Charakterkarten-Refresh), nicht die Bildauswahl.
- Betroffen: `gameRender.ts` (Zeilen mit `pearlImg`-Ableitung, 2 Stellen), `DiscardCardsDialog.tsx` (`getImageSrc`), `CharacterActivationDialog.tsx` (`getImageSrc`).

## Risks / Trade-offs

- Kein nennenswertes Risiko — reine Anzeige-Bugfixes ohne Spiellogik-Änderungen.
