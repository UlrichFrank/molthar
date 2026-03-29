## ADDED Requirements

### Requirement: Fähigkeitsgesteuerte Kostenmodifikatoren
Das Spiel SHALL Kostenvalidierungs-Modifikationen durch Charakter-Fähigkeiten unterstützen. Wenn ein Spieler eine aktive Fähigkeit hat, die Perlenwert-Anforderungen verändert, SHALL das Kostenvalidierungssystem diese Modifikationen anwenden.

#### Scenario: Wildcard-Fähigkeit onesCanBeEights
- **WHEN** ein Spieler mit der Fähigkeit onesCanBeEights versucht, einen Charakter zu aktivieren
- **THEN** kann jede 1-Perle in der Hand des Spielers für die Kostenvalidierung wie eine 8-Perle behandelt werden
- **AND** für die Bezahlung verwendete 1-Perlen-Karten kommen auf den Ablagestapel

#### Scenario: Wildcard-Fähigkeit threesCanBeAny
- **WHEN** ein Spieler mit der Fähigkeit threesCanBeAny versucht, einen Charakter zu aktivieren
- **THEN** kann jede 3-Perle in der Hand des Spielers einen beliebigen Wert (1–8) für die Kostenvalidierung darstellen
- **AND** verschiedene 3-Perlen in derselben Hand können in einer einzigen Kostenprüfung unterschiedliche Werte repräsentieren
- **AND** das Spiel akzeptiert die Kosten als gültig, wenn eine gültige Zuordnung von 3-Perlen zu geforderten Werten existiert
- **AND** für die Bezahlung verwendete 3-Perlen-Karten kommen auf den Ablagestapel

#### Scenario: Diamant-Modulations-Fähigkeit decreaseWithPearl
- **WHEN** ein Spieler mit der Fähigkeit decreaseWithPearl versucht, einen Charakter zu aktivieren
- **THEN** kann jeder Diamant des Spielers den Wert einer Perle um 1 reduzieren (z.B. 7 wird zu 6)
- **AND** es ist nur ein Diamant pro Perlenkarte erlaubt (mehrere Diamanten stapeln sich nicht auf einer Karte)
- **AND** der Wert 0 kann nicht erzeugt werden (Mindestwert ist 1)
- **AND** für die Modulation verwendete Diamanten kommen auf den Ablagestapel

#### Scenario: Kostenvalidierung mit mehreren Modifikatoren
- **WHEN** ein Spieler sowohl die Fähigkeit onesCanBeEights als auch threesCanBeAny aktiv hat
- **THEN** werden beide Modifikatoren gleichzeitig während der Kostenvalidierung angewendet
- **AND** 1-Perlen können als 8er behandelt werden UND 3-Perlen können einen beliebigen Wert annehmen – in derselben Kostenprüfung
- **AND** die Validierung ist erfolgreich, wenn eine gültige Kombination existiert

#### Scenario: Wildcard-Substitution bei komplexen Kostenkombinationen
- **WHEN** eine Kostenkomponente ein gemischtes Muster erfordert (z.B. „Summe von 3 Perlen = 10")
- **THEN** werden Wildcards vor dem Musterabgleich angewendet
- **AND** wenn eine 3-Perle vorhanden ist, kann sie einen beliebigen Einzelwert ersetzen, um die geforderte Summe zu erreichen
- **AND** die Validierung prüft die substituierten Werte, nicht die ursprünglichen Perlen

### Requirement: Unterstützung gedruckter Perlenwerte
Das Spiel SHALL auf Charakterkarten aufgedruckte Perlenwerte erkennen und anwenden (durch manuelle Auswahl durch den Spieler). Wenn ein Spieler einen Charakter mit aufgedruckten Perlenwerten hat, können diese Werte echte Handkarten bei der Kostenvalidierung ersetzen.

#### Scenario: Charakterkarte mit aufgedrucktem Perlenwert
- **WHEN** ein Spieler einen Charakter aktiviert, der einen aufgedruckten Perlenwert hat (z.B. „Diese Karte hat eine 5-Perle")
- **THEN** kann die aufgedruckte Perle zur Erfüllung von Kostenanforderungen verwendet werden
- **AND** die aufgedruckte Perle verbraucht keine Handkarte; nur die tatsächlich ausgespielten Perlen aus der Hand werden gezählt
- **AND** eine Kostenkomponente wird erfüllt durch: ausgewählte Handperlen + manuelle Auswahl aus aufgedruckten Perlen der aktivierten Karten

#### Scenario: Aufgedruckte Perle mit Wildcard
- **WHEN** eine Charakterkarte einen aufgedruckten „?"-Wildcard hat
- **THEN** kann der Wildcard während der Kostenvalidierung einen beliebigen Perlenwert (1–8) repräsentieren
- **AND** verschiedene Wildcards in derselben Kostenprüfung können unterschiedliche Werte repräsentieren
- **AND** das Spiel findet eine gültige Wildcard-Wertzuweisung, sofern eine existiert

### Requirement: Schnittstelle der Kostenvalidierung
Das Spiel SHALL die Kostenvalidierung um einen Fähigkeits-Modifikator-Kontext erweitern. Die Funktion validateCostPayment SHALL optionale Fähigkeitsmodifikatoren unterstützen.

#### Scenario: Kostenvalidierung mit Fähigkeitsmodifikatoren
- **WHEN** validateCostPayment mit Fähigkeitsmodifikatoren aufgerufen wird
- **THEN** wendet die Funktion Wildcard- und Modulationsregeln an, bevor sie die Kostenanforderungen prüft
- **AND** die Funktion gibt true zurück, wenn eine gültige Perlenkombination mit angewandten Modifikatoren existiert
- **AND** ohne Modifikatoren verhält sich die Funktion wie zuvor (abwärtskompatibel)

#### Scenario: Keine Modifikatoren angegeben
- **WHEN** validateCostPayment ohne Fähigkeitsmodifikatoren aufgerufen wird
- **THEN** wird der Standard-Perlenabgleich angewendet (keine Wildcards, keine Diamant-Modulation)
- **AND** die Funktion verhält sich exakt wie vor der Fähigkeits-Implementierung
