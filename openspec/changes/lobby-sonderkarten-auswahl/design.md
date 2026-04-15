## Context

boardgame.io v0.50 unterstützt `setupData` als optionalen zweiten Parameter für `setup()` und als Feld in `lobbyClient.createMatch()`. Der Wert ist frei definierbar und wird serverseitig mit dem Match gespeichert. Er kann auch über `lobbyClient.getMatch()` bzw. `listMatches()` abgerufen werden (im `matchData`-Feld je nach Version) — für die Modus-Anzeige in der Lobby und im Wartezimmer.

Aktuell filtern die Karten-Loader alle Karten ohne Einschränkung. Das neue `isSpecial`-Flag in `cards.json` wird genutzt, um das Basis- und das Sonderkarten-Set zu trennen.

## Goals / Non-Goals

**Goals:**
- Toggle „Mit Sonderkarten" in `CreateMatch`-Komponente, Default: **aus** (Basisspiel)
- `setupData: { withSpecialCards: boolean }` an `createMatch` übergeben
- `setup(ctx, setupData)` filtert Karten: ohne Sonderkarten nur `isSpecial !== true`
- `G.withSpecialCards` für UI-Anzeige im laufenden Spiel/Wartezimmer
- `WaitingRoom` zeigt aktiven Spielmodus an
- `MatchList` zeigt je Spiel „Basis" oder „Mit Sonderkarten" an

**Non-Goals:**
- Nachrägliche Änderung des Modus während eines laufenden Spiels
- Feingranulare Auswahl einzelner Sonderkarten
- Validierung auf Serverseite (`validateSetupData`) in dieser Phase

## Decisions

**`isSpecial` in `cards.json` statt eigenem Dateiset**
Einfachster Ansatz: Ein Boolean-Flag pro Karte. Kein zweites Kartendeck nötig. Beim Setup wird gefiltert. Alternativ: separates JSON — abgelehnt, da es Datenduplizierung erzeugt.

**`G.withSpecialCards` im GameState**
Der Wert aus `setupData` wird in `GameState` übernommen, damit das Frontend (Wartezimmer, Board) den Modus ohne zusätzliche API-Calls kennt. Wird einmalig in `setup()` gesetzt und nie geändert.

**Welche Karten sind initial Sonderkarten?**
Joker-Perlenkarte und „Tischlein deck dich" (Charakterkarte41) erhalten `isSpecial: true`. Alle bisherigen 40 Charakterkarten bleiben im Basisset. Zukünftige Sonderkarten können per Flag ergänzt werden.

**Default: ohne Sonderkarten**
Der Toggle startet auf `false` (Basisspiel), damit bestehende Spielgruppen nicht überrascht werden.

## Risks / Trade-offs

- [`listMatches` gibt `setupData` zurück?] → In boardgame.io v0.50 ist `setupData` im Match-Objekt über `getMatch` verfügbar; `listMatches` enthält es möglicherweise nicht direkt. Wenn nicht verfügbar, wird der Modus nicht in der Spielliste angezeigt (graceful degradation). Im Wartezimmer wird `G.withSpecialCards` aus dem Spielzustand genutzt (über boardgame.io-Client).
- [Alte laufende Spiele ohne `withSpecialCards` in G] → `G.withSpecialCards` mit `?? false` absichern.
