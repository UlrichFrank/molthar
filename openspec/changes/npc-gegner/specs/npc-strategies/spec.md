## ADDED Requirements

### Requirement: IrrnisBot wählt zufällige gültige Züge
IrrnisBot (Strategie: `random`) SHALL aus allen gültigen Zügen einen zufällig auswählen. Für die Zahlung wird eine zufällige gültige Kombination gewählt.

#### Scenario: Zufälliger Zug bei verfügbaren Optionen
- **WHEN** IrrnisBot an der Reihe ist und mehrere Züge möglich sind
- **THEN** wird einer der gültigen Züge zufällig ausgeführt (keine Präferenz)

#### Scenario: Zufällige Zahlung
- **WHEN** IrrnisBot eine Charakterkarte aktivieren kann und mehrere Zahlungskombinationen existieren
- **THEN** wird eine zufällige gültige Kombination als Zahlung gewählt

### Requirement: GierBot aktiviert sofort jede bezahlbare Karte
GierBot (Strategie: `greedy`) SHALL in jeder Aktion zuerst prüfen ob eine Charakterkarte im Portal aktivierbar ist. Wenn ja, aktiviert er die mit den meisten Machtpunkten. Sonst nimmt er die höchste verfügbare Perlenkarte aus den Slots. Hat er keine Charakterkarte im Portal, nimmt er zuerst eine Charakterkarte.

#### Scenario: Aktivierung wenn möglich
- **WHEN** GierBot eine Charakterkarte im Portal hat, die er bezahlen kann
- **THEN** aktiviert er sie (bevorzugt die mit den meisten Machtpunkten)

#### Scenario: Höchste Perle nehmen
- **WHEN** GierBot keine aktivierbare Charakterkarte hat
- **THEN** nimmt er die Perlenkarte mit dem höchsten Wert aus den sichtbaren Slots

#### Scenario: Charakterkarte nehmen wenn Portal leer
- **WHEN** GierBot kein Portal-Karte hat und noch Aktionen übrig
- **THEN** nimmt er eine Charakterkarte aus dem Display (bevorzugt die mit den meisten Machtpunkten)

### Requirement: EdelsteinBot priorisiert diamantenreiche Karten
EdelsteinBot (Strategie: `diamond`) SHALL Charakterkarten mit hoher Diamantzahl bevorzugen. Bei der Aktivierung wählt er die Karte mit den meisten Diamanten (bei Gleichstand: meiste Machtpunkte). Bei der Perlenauswahl wählt er Perlen, die zur Zielkarte passen (deren Kosten er erfüllen möchte).

#### Scenario: Diamantenreiche Karte bevorzugen
- **WHEN** EdelsteinBot mehrere aktivierbare Karten hat
- **THEN** aktiviert er die mit den meisten Diamanten

#### Scenario: Perlen passend zur Zielkarte sammeln
- **WHEN** EdelsteinBot eine Zielkarte im Portal hat
- **THEN** wählt er Perlenkarten, die den Kosten der Zielkarte entsprechen (sofern verfügbar)

#### Scenario: Fallback auf höchste Perle
- **WHEN** keine Perlen zur Zielkarte passen
- **THEN** nimmt EdelsteinBot die höchste verfügbare Perle

### Requirement: WendelinBot maximiert Punkte pro Aufwand
WendelinBot (Strategie: `efficient`) SHALL die Zielkarte mit dem besten Punkte/Aktivierungsaufwand-Verhältnis wählen. "Aufwand" ist die Anzahl der Perlenwerte die zur Kostensatisfaktion fehlen. Bei Aktivierung wählt er die Zahlungskombination, die die wertvollsten Handkarten für zukünftige Züge erhält.

#### Scenario: Beste Ratio wählen
- **WHEN** WendelinBot mehrere Charakterkarten im Display sieht
- **THEN** nimmt er die Karte mit dem besten Machtpunkte/Aktivierungsaufwand-Verhältnis

#### Scenario: Zahlung erhält beste Restkarten
- **WHEN** WendelinBot eine Karte aktiviert und mehrere Zahlungskombinationen möglich sind
- **THEN** wählt er die Kombination, bei der die verbleibende Hand den höchsten Gesamtwert hat

#### Scenario: Perlen für Zielkarte sammeln
- **WHEN** WendelinBot an der Reihe ist und Perlenkarten nimmt
- **THEN** bevorzugt er Perlen, die spezifisch die fehlenden Kosten seiner Zielkarte erfüllen

### Requirement: RalfBot priorisiert rote Fähigkeiten und angreift Führenden
RalfBot (Strategie: `aggressive`) SHALL Charakterkarten mit roten Fähigkeiten (persistent: false) bevorzugen, insbesondere `discardOpponentCharacter` und `stealOpponentHandCard`. Bei der Auswahl des Ziels für rote Fähigkeiten wählt er den Spieler mit den meisten Machtpunkten. Sonst verhält er sich wie GierBot.

#### Scenario: Karte mit roter Fähigkeit bevorzugen
- **WHEN** RalfBot zwischen einer normalen Karte und einer mit roter Fähigkeit wählen kann
- **THEN** bevorzugt er die Karte mit roter Fähigkeit

#### Scenario: Angriff auf Führenden
- **WHEN** RalfBot `discardOpponentCharacter` oder `stealOpponentHandCard` auslöst
- **THEN** zielt er auf den Spieler mit den meisten Machtpunkten

#### Scenario: Fallback auf greedy
- **WHEN** keine Karte mit roter Fähigkeit verfügbar oder aktivierbar ist
- **THEN** verhält sich RalfBot wie GierBot
