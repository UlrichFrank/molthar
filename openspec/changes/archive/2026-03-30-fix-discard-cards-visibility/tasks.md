## 1. Bug Fix

- [x] 1.1 In `game-web/src/lib/canvasRegions.ts` Zeile 205: Bedingung von `if (G.requiresHandDiscard)` ändern zu `if (G.requiresHandDiscard && actionCount >= maxActions)`

## 2. Verifikation

- [X] 2.1 Manuell testen: Karten bis über Handlimit ziehen, dann prüfen dass "Discard Cards" erst nach letzter Aktion erscheint
- [X] 2.2 Manuell testen: Aktionszähler zeigt normal während `requiresHandDiscard` gesetzt und Aktionen noch übrig
