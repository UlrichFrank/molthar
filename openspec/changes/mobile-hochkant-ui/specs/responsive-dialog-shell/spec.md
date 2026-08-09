## ADDED Requirements

### Requirement: Adaptive Dialog-Präsentation

Alle Spieldialoge SHALL eine gemeinsame Shell verwenden, die auf Desktop-Viewports (≥768px) als zentriertes Modal und auf mobilen Viewports (<768px) als am unteren Rand verankertes Bottom-Sheet erscheint. Der Dialog-*Inhalt* SHALL für beide Präsentationen identisch (geteilt) bleiben.

#### Scenario: Bottom-Sheet auf dem Handy
- **WHEN** ein Dialog bei einer Viewport-Breite unter 768px geöffnet wird
- **THEN** erscheint er als Bottom-Sheet, das an der Unterkante verankert ist

#### Scenario: Zentriertes Modal auf dem Desktop
- **WHEN** ein Dialog bei einer Viewport-Breite ab 768px geöffnet wird
- **THEN** erscheint er als zentriertes Modal wie bisher

### Requirement: Content-orientierte Höhe statt Viewport-Deckelung

Das Bottom-Sheet SHALL sich an seinem Inhalt orientieren und nur dann intern scrollen, wenn der Inhalt die verfügbare Höhe übersteigt; kurze Dialoge SHALL nicht künstlich auf Viewport-Höhe aufgezogen werden.

#### Scenario: Kurzer Dialog erzeugt keinen Scroll
- **WHEN** ein Dialog mit wenig Inhalt am Handy geöffnet wird
- **THEN** ist das Bottom-Sheet nur so hoch wie sein Inhalt und erzeugt keinen Scrollbalken

#### Scenario: Langer Dialog scrollt innerhalb des Sheets
- **WHEN** der Dialoginhalt höher ist als die verfügbare Sheet-Höhe
- **THEN** scrollt ausschließlich der Inhaltsbereich des Sheets, nicht die Seite dahinter

### Requirement: Abdeckung aller bestehenden Dialoge

Die Shell SHALL für alle bestehenden Spieldialoge gelten (u. a. Charakter-Aktivierung/Bezahlung, Handkarten abwerfen, gegnerische Handkarte stehlen, gegnerischen Charakter entfernen, Portal-Charakter tauschen, gespielte Perle zurücknehmen, Charakter-Vorschau, Charakter-Detailansicht, Endgame-Ergebnis, Disconnect).

#### Scenario: Bezahl-Dialog als Sheet
- **WHEN** der Spieler am Handy einen Charakter aktiviert und der Bezahl-Dialog erscheint
- **THEN** wird die `PaymentSelection` in einem Bottom-Sheet durchgeführt, ohne dass die Seite dahinter scrollt
