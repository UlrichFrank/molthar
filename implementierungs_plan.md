# Detaillierter Implementierungsplan: Die Portale von Molthar

Dieser Plan beschreibt die schrittweise Umsetzung der digitalen Adaption des Kartenspiels "Die Portale von Molthar" sowie die Entwicklung einer Webanwendung zur Verwaltung der Spielkarten.

## Phase 1: Vervollständigung der Kern-Spielelogik (Engine)
Das Regelwerk muss vollständig von der `GameEngine` abgebildet werden, bevor das UI finalisiert wird.

- [ ] **Charakterkarten & Kostenprüfung:**
  - Implementierung der echten Kosten-Kombinationen (Paare, Drillinge, definierte Summen, Reihen).
  - Validierungslogik in `activateCharacter`, die sicherstellt, dass die gewählten Perlenkarten (inkl. Diamanten als Modifikatoren) die Kosten exakt decken.
- [ ] **Spezialfähigkeiten:**
  - System zur Ausführung von roten (einmaligen) und blauen (dauerhaften) Fähigkeiten implementieren.
  - Besondere Regeln für das "Irrlicht" (kann auch von Nachbarn aktiviert werden) einbauen.
- [ ] **Tauschsymbol-Regel:**
  - Logik hinzufügen: Wenn eine Perlenkarte mit Tauschsymbol das Feld auffüllt, müssen beide offene Charaktere in der Mitte abgeworfen und erneuert werden.
- [ ] **Rundenende & Handkartenlimit:**
  - Zustand/Event implementieren, das den Spieler zwingt, bei mehr als 5 Handkarten am Ende seines Zuges Karten abzuwerfen.
- [ ] **Spielende-Bedingung:**
  - Punktezähler: Logik, die triggert, sobald ein Spieler 12 Machtpunkte durch aktivierte Charaktere erreicht.
  - Trigger für die letzte Runde (jeder Spieler bis zum rechten Nachbarn des Startspielers kommt noch einmal dran) einbauen.

## Phase 2: Überarbeitung der Benutzeroberfläche (UI / UX)
Die App muss auf iPhone (kompakt), iPad (großflächig) und Mac (Fenstermodus) gut aussehen und bedienbar sein.

- [ ] **Geräteübergreifendes Layout (Responsive Design):**
  - Einsatz von adaptiven Layouts (z. B. `ViewThatFits` oder `GeometryReader`), um das Spielfeld abhängig von der Bildschirmgröße (Size Classes) dynamisch aufzubauen.
  - **iPhone:** Scrolling-zentriert, Gegner nur als kompakte Avatare/Leisten, Fokus auf die eigene Hand und die Mitte.
  - **iPad/Mac:** Mehr Platz ermöglicht die permanente Anzeige aller gegnerischen Portale am oberen Rand oder an den Seiten, ähnlich einem echten Spieltisch.
- [ ] **Spieler-Darstellung & Sichtbarkeit:**
  - **Aktiver Spieler (Turn Indicator):** Eindeutige visuelle Hervorhebung, wessen Zug gerade läuft (z.B. pulsierender Rahmen, farbliche Markierung des Namens, "Am Zug"-Indikator).
  - **Lokaler Spieler:** 
    - Portal ist unten zentriert und groß dargestellt.
    - Eigene Handkarten sind offen und interagierbar.
    - Aktivierte Charakterkarten sind übersichtlich nebeneinander aufgereiht.
  - **Gegnerische Spieler:**
    - Handkarten werden als verdeckte Kartenrückseiten (Stapel oder gefächert) dargestellt. Die Anzahl der Handkarten ist immer klar ersichtlich (z.B. 4 verdeckte Karten), der Inhalt bleibt geheim.
    - Portale der Gegner sind verkleinert sichtbar.
    - Aktivierte Charakterkarten der Gegner sind offen sichtbar (da sie Punkte bringen und teils Fähigkeiten haben), evtl. in einer Scrollview.
- [ ] **Animationen:**
  - Kartenbewegungen (Ziehen vom Stapel, Ausspielen aufs Portal, Abwerfen) flüssig animieren, um den Spielfluss nachvollziehbar zu machen.

## Phase 3: Startbildschirm, Lobby und Netzwerkkodierung
Um das Spiel gegen andere zu spielen, braucht es ein Setup.

- [ ] **Startbildschirm (Main Menu):**
  - Menü zur Auswahl des Spielmodus: "Lokal gegen KI" oder "Lokales Netzwerk".
- [ ] **Lobby-System System:**
  - Ansicht zum Hinzufügen von KI-Gegnern (inkl. Schwierigkeitsgraden, falls geplant).
  - Ansicht für den Host, um ein lokales Spiel (MultipeerConnectivity) zu eröffnen.
  - Ansicht für Clients, um Spielen im Netzwerk beizutreten.
- [ ] **Netzwerk-Synchronisierung:**
  - Austausch von `GameAction`-Intents vom Client zum Host.
  - Broadcasting des neuen `GameState` vom Host an alle Clients.

## Phase 4: Computergenger (KI)
- [ ] **Heuristische Bewertung:**
  - Die KI muss den Spielzustand bewerten: Kann ich einen starken Charakter aktivieren? Fehlen mir bestimmte Karten (Ziehen-Aktion)?
- [ ] **Verzögertes Spielverhalten:**
  - Wenn die KI am Zug ist, sollen Aktionen mit 1-2 Sekunden Verzögerung ausgeführt werden, damit menschliche Spieler nachvollziehen können, was passiert ist.

## Phase 5: WebApp zur Kartenverwaltung
Zur flexiblen Verwaltung der Spielkarten (insbesondere der komplexen Fähigkeiten und Kosten der 54 Charaktere) bauen wir ein separates Web-Tool.

- [ ] **Technologie-Stack:**
  - HTML, Vanilla CSS für ein ansprechendes, modernes Design (Dark Mode, sauberes Grid, keine Framework-Überladung).
  - React (via Vite) als Unterbau, falls dynamische Formulare komplexer werden, alternativ pures Vanilla JavaScript für maximale Leichtgewichtigkeit.
- [ ] **Funktionen:**
  - **Übersichts-Dashboard:** Liste aller Charaktere mit Filtermöglichkeiten nach Machtpunkten, Belohnungen etc.
  - **Karteneditor:** Formular zum Anlegen/Bearbeiten von:
    - Name und Bild-Referenz.
    - Machtpunkte und Diamanten-Belohnung.
    - **Kosten-Definition:** Ein strukturiertes Feld (z.B. JSON-Builder), um Kosten wie "3x Wert X" oder "Summe 10" abzubilden.
    - **Fähigkeiten-Definition:** Dropdown und Parameter für rote und blaue Fähigkeiten.
  - **Export:**
    - Die WebApp exportiert die Kartendaten als strukturierte `cards.json`.
- [ ] **Integration in die Swift-App:**
  - Das Swift-Projekt liest beim Start die generierte JSON-Datei ein. Dadurch lassen sich Werte für Balancing-Zwecke anpassen, ohne den Swift-Code neu kompilieren zu müssen.
