## 1. Viewport-Weiche & Gerüst

- [x] 1.1 `useIsMobile`-Hook (`matchMedia('(max-width: 767px)')`, live auf Resize) in `game-web/src/hooks/` anlegen
- [x] 1.2 Board-Einstiegspunkt so umbauen, dass er bei mobil `MobileGameBoard`, sonst `CanvasGameBoard` rendert — identische Props (`G`, `ctx`, `moves`, `events`, `playerID`, `isActive`, `matchData`)
- [x] 1.3 Ordner `game-web/src/components/mobile/` + leere `MobileGameBoard`-Shell mit `100dvh`-Spaltenlayout (fixe Statusleiste / Scrollbereich / Hand-Dock / Aktionsleiste)
- [x] 1.4 Sicherstellen, dass der Desktop-Pfad (`CanvasGameBoard`) unverändert bleibt (Regressionscheck)

## 2. Responsive Dialog-Shell (geteiltes Fundament)

- [x] 2.1 `styles/dialogs.css` + `GameDialog`-Shell um mobile Präsentation erweitern: Bottom-Sheet <768px, zentriertes Modal ≥768px
- [x] 2.2 Content-orientierte Höhe: kurzer Dialog ohne Scroll, langer Dialog scrollt nur intern (kein Seiten-Scroll dahinter)
- [x] 2.3 Alle bestehenden Dialoge auf die Shell heben und am Handy prüfen: Aktivierung/Bezahlung, Handkarten abwerfen, Handkarte stehlen, Gegner-Charakter entfernen, Portal-Tausch, Perle zurücknehmen, Charakter-Vorschau, Charakter-Detail, Endgame-Ergebnis, Disconnect
- [x] 2.4 Desktop-Regression der Dialoge gegen bestehende Dialog-Specs prüfen

## 3. Statusleiste „Variante C"

- [x] 3.1 `MobileStatusBar` mit fester Spielerreihenfolge (eigener Spieler zuerst), Rang-Berechnung aus Machtpunkten aller Spieler
- [x] 3.2 Detailbox (Initiale, Name, `Rang N/5`, ★, 💎) + „am Zug"-Badge und Aktionszähler nur für den aktiven Spieler
- [x] 3.3 Avatare (farbcodierte Initiale + ★); Tippen verschiebt die Detailbox an die feste Position, Reihenfolge stabil
- [x] 3.4 Indikatoren: Goldring = eigener Spieler, grüner Punkt = am Zug; gleichzeitig darstellbar
- [x] 3.5 Einzeilige Skalierung bis 5 Spieler (4 Gegner) ohne Umbruch verifizieren — *Statusleiste seither auf eine zweizeilige Detailbox umgebaut (Zeile 1: Name + „am Zug"-Badge, Zeile 2: Rang + ★ + 💎 + Aktionszähler) und bis 5 Spieler gemessen: passt bei 360–414px Breite ohne Umbruch/Clipping. Die vorherige Flex-Shrink+Namens-Ellipsis-Variante war nur bis 2 Spieler live getestet. Eine echte 5-Spieler-Partie am Gerät (nicht nur Layout-Messung) steht weiterhin als Teil von 7.1 aus.*

## 4. Board-Zonen (Hand-Dock-Layout)

- [x] 4.1 Markt-Zone: 4 Perlenkarten (Wert, Tausch-/Auffüll-Symbol, Joker) + 2 Charakterkarten + Perlen-/Charakter-Nachziehstapel
- [x] 4.2 Portal-Zone: max. 2 Charakterslots, Diamantenanzeige, Zähler `aktiviert ×N ▸`
- [x] 4.3 Hand-Dock: aufgefächerte Perlenkarten, horizontal scrollbar bei Überlauf, Joker abgesetzt
- [x] 4.4 Fixe Aktionsleiste: „Zug beenden" (`endTurn`), „Perlen tauschen" (`replacePearlSlots`), kontextabhängige Aktionen
- [x] 4.5 Karten als real dimensionierte `<img>` (bestehende Assets), keine uniforme Board-Skalierung

## 5. Aktivierte-Karten-Raster

- [x] 5.1 Zähler `aktiviert ×N ▸` öffnet Bottom-Sheet (nutzt Shell aus Abschnitt 2)
- [x] 5.2 Scrollbares Raster, trägt 8–15 Karten ohne Layout-Bruch
- [x] 5.3 Tipp auf Rasterkarte öffnet Charakter-Detailansicht

## 6. Feature-Parität (jede Canvas-Interaktion braucht ein Handy-Zuhause)

- [x] 6.1 Perle nehmen (Markt) + Perlen-Slots ersetzen (`replacePearlSlots`)
- [x] 6.2 Charakterkarte aus Auslage/Deck nehmen inkl. Vorschau (`takeCharacterCard`, `CharacterTakePreviewDialog`)
- [x] 6.3 Charakter aktivieren mit `PaymentSelection` (Bezahl-Dialog) — Hand/Portal/Diamanten im Sheet erreichbar
- [x] 6.4 Portal-Slot antippen → Charakter-Vorschau; Portal-Charakter tauschen (`swapPortalCharacter`)
- [x] 6.5 Irrlicht/geteilte Aktivierung an Nachbar-Portalen (`activateSharedCharacter`)
- [x] 6.6 Gegner-Charakter entfernen; gegnerische Handkarte stehlen; gespielte Perle zurücknehmen
- [x] 6.7 Hand neu ziehen (`rehandCards`); Deck-Vorschau (`peekCharacterDeck`); 2-für-Diamant-Tausch (`tradeForDiamond`)
- [x] 6.8 Gegner-Detail (Portal/aktivierte) per Statusleisten-Tap als Sheet erreichbar
- [x] 6.9 Endgame-Ergebnisdialog und Disconnect-Dialog am Handy geprüft
- [x] 6.10 Reshuffle-/Pearl-Refresh-/Final-Round-Indikatoren am Handy sichtbar

*Hinweis zu Abschnitt 6: Alle Punkte sind über `useGameBoardCore` + `SharedGameDialogs` ans Mobile-Board angebunden (identischer Code-Pfad wie Canvas, siehe design.md D1). Live durchgeklickt wurden 6.1 (Perle nehmen) und 6.2 (Charakterkarte nehmen inkl. Vorschau-Dialog) sowie der Einstieg in 6.3 (Aktivierungsdialog öffnet, Handkarte auswählbar). 6.4–6.10 sind auf denselben Handlern verdrahtet, aber noch nicht einzeln am Gerät durchgeklickt — das ist Teil der ausstehenden Testpartie in 7.1.*

*Nachtrag (Review-Fixes nach diesem Stand): Markt-Zone bricht bei voller Spaltenzahl nicht mehr um (feste Grid-Spaltenzahl statt Flex-Wrap), Kartenbreiten kommen fluid vom jeweiligen Grid-/Flex-Track statt aus festen px-Werten, und das Kartenseitenverhältnis stimmt jetzt exakt mit den 666×1030px-Assets überein (`333 / 515` statt `59 / 92`, verzerrungsfrei mit `object-fit: fill`). Der Portal-„Tauschen"-Button ist auf dieselbe Bedingung gegatet wie in `canvasRegions.ts` (nur vor der ersten Aktion, `changeCharacterActions` aktiv). Safe-Area-Insets, z-index-Schichtung und sichtbare Schließen-Buttons sind für alle Sheets/Dialoge gesetzt, Escape schließt Detail-Overlays zentral in `useGameBoardCore`. Das Hand-Dock ist jetzt ein Fächer mit Kartenüberlappung statt einer flachen Reihe (8–9 Handkarten passen ohne horizontales Scrollen; `overflow-x: auto` bleibt als Sicherheitsnetz). Marktkarten (Perlen + beide Nachziehstapel) zeigen einen handlungsfähig/nicht-handlungsfähig-Zustand passend zu `core.canAct`; Charakterkarten aus der Auslage bleiben davon unberührt und immer antippbar (Vorschau). Das Gegner-Detail-Sheet zeigt zusätzlich eine Kopfzeile mit ★Machtpunkten, 💎Diamanten und der (verdeckten) Handkartenzahl. Alle diese Punkte sind strukturell/visuell umgesetzt, aber noch nicht Teil einer durchgängigen Testpartie am Gerät — das bleibt weiterhin 7.1.*

## 7. Abschluss & Verifikation

- [ ] 7.1 Durchgängige Testpartie im Hochformat bei 2, 3 und 5 Spielern (echtes Gerät/DevTools-Emulation) — *noch offen: nur Kurztest mit 2 Spielern (1 Mensch + 1 NPC) über Chrome-DevTools-Emulation gefahren. Seither kamen weitere strukturelle Fixes dazu (Markt-Grid, Kartengrößen/-seitenverhältnis, zweizeilige Statusleiste, Portal-Tausch-Gating, Hand-Dock-Fächer, Markt-Zustandsanzeige, Gegner-Sheet-Kopfzeile) — keiner davon wurde bisher in einer vollständigen Partie am Gerät durchgespielt. Insbesondere die 5-Spieler-Passung der Statusleiste (3.5) ist bislang nur gemessen, nicht live bespielt.*
- [x] 7.2 Wechsel über die 768px-Grenze während laufender Partie ohne Zustandsverlust — *verifiziert: Portal-Karte, Hand, Aktionszähler blieben beim Wechsel 390px → 1440px erhalten*
- [x] 7.3 `pnpm lint` + `type-check` in `game-web`; Desktop-Smoke-Test (Canvas unverändert) — *`tsc --noEmit` sauber; `eslint src/` zeigt ausschließlich vorbestehende Fehler (verifiziert per `git stash` gegen `main`), keine neuen aus dieser Änderung; Canvas-Board bei 1440×900 visuell prüft unverändert*
- [x] 7.4 i18n: alle neuen mobilen UI-Texte externalisiert (kein hartkodierter String) — *neue `mobile.*`-Keys in allen drei Locales (de/en-GB/fr) ergänzt*
