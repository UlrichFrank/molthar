## 1. Rendering — gameRender.ts

- [x] 1.1 `game-web/src/lib/gameRender.ts`: Konstanten für Diamond-Kartendarstellung definieren: `DIAMOND_CARD_W = 28`, `DIAMOND_CARD_H = 36`, `DIAMOND_CARD_GAP = 4`
- [x] 1.2 `game-web/src/lib/gameRender.ts`: `drawPlayerPortal` — Emoji-Schleife (`ctx.fillText('💎', ...)`) ersetzen durch Schleife mit `drawImageOrFallback(ctx, 'Charakterkarte Hinten.png', x, diamondY, DIAMOND_CARD_W, DIAMOND_CARD_H)`
- [x] 1.3 `game-web/src/lib/gameRender.ts`: X-Position der Karten berechnen: `diamondX + i * (DIAMOND_CARD_W + gap)`, wobei `gap` bei `portal.diamonds > 6` auf 2 reduziert wird um Überlauf zu vermeiden
- [x] 1.4 `game-web/src/lib/gameRender.ts`: Entfernen der `ctx.fillStyle`, `ctx.font`, `ctx.textAlign`, `ctx.textBaseline`-Setzungen die nur für den Emoji-Render nötig waren

## 2. Verifikation

- [ ] 2.1 Manuelle Prüfung: Spieler mit 0 Diamanten → keine Karten im Portal-Bereich sichtbar
- [ ] 2.2 Manuelle Prüfung: Spieler mit 1–4 Diamanten → korrekte Anzahl Kartenrückseiten, nebeneinander, kein Abschneiden
- [ ] 2.3 Manuelle Prüfung: Spieler mit 6+ Diamanten → Karten überlappen und bleiben im sichtbaren Bereich
- [ ] 2.4 Manuelle Prüfung: Aktivierungsdialog-Diamant-Anzeige (HTML-Teil) bleibt unverändert
