# Character Activation Dialog Responsive Sizing

## Overview

This capability defines responsive sizing and layout behavior for the character activation dialog, ensuring it functions correctly and remains usable across all screen sizes — from small mobile phones (320px) to large desktop displays.

## Requirements

### Requirement: Dialog fits within viewport on small screens
The dialog container and all content SHALL fit within the viewport without horizontal scrolling on screens 320px or wider, and without vertical scrolling on screens 600px or wider (when dialog has typical content: 1-4 character choices, 5-8 hand cards).

#### Scenario: Small screen (320px) layout
- **WHEN** dialog is displayed on a 320px wide screen (iPhone SE)
- **THEN** all dialog content is visible without horizontal overflow
- **AND** vertical scrolling may be necessary only for unusually large hands (8+ cards)

#### Scenario: Medium screen (600px) layout
- **WHEN** dialog is displayed on a 600px wide screen (tablet in portrait)
- **THEN** all dialog content is visible without any scrolling
- **AND** visual hierarchy is maintained (title, sections, buttons all clearly visible)

#### Scenario: Large screen (1200px) layout
- **WHEN** dialog is displayed on a 1200px wide screen (desktop/tablet landscape)
- **THEN** dialog is centered and readable with adequate whitespace
- **AND** font sizes and card dimensions are proportional and not excessively large

### Requirement: Character card thumbnails scale responsively
Character card thumbnail dimensions SHALL scale based on viewport width to conserve horizontal space while maintaining touch target adequacy.

#### Scenario: Mobile character card size
- **WHEN** dialog is displayed on screens < 500px wide
- **THEN** character card thumbnails are 70px wide (down from 80px)
- **AND** touch target remains adequate (≥ 60px for touch accuracy)

#### Scenario: Desktop character card size
- **WHEN** dialog is displayed on screens ≥ 500px wide
- **THEN** character card thumbnails are 100px wide
- **AND** card aspect ratio (59:92) is preserved

### Requirement: Hand card buttons scale responsively
Hand card selection buttons SHALL scale based on viewport to fit comfortably in the grid while remaining clickable on touch devices.

#### Scenario: Mobile hand card layout
- **WHEN** dialog is displayed on screens < 500px wide
- **THEN** hand card buttons are minmax(55px, 1fr) with min-height 60px
- **AND** grid gap is 0.4rem (reduced from standard 0.75rem)
- **AND** padding is 0.25rem (reduced from standard 0.5rem)

#### Scenario: Desktop hand card layout
- **WHEN** dialog is displayed on screens ≥ 500px wide
- **THEN** hand card buttons are minmax(70px, 1fr) with min-height 80px
- **AND** grid gap is 0.75rem
- **AND** padding is 0.5rem

#### Scenario: Hand card value readability
- **WHEN** hand card button displays card value (number 1-8)
- **THEN** font size scales via clamp(1rem, 4vw, 1.5rem) to remain readable across all screen sizes
- **AND** minimum readable size is ≈11px on 320px screens, maximum ≈18px on large screens

### Requirement: Padding and margins adjusted for small screens
Dialog padding and section margins SHALL be reduced on small screens to conserve vertical and horizontal space.

#### Scenario: Small screen padding
- **WHEN** dialog is displayed on screens < 500px wide
- **THEN** dialog outer padding is 0.5rem (reduced from 0.75rem)
- **AND** section margins (between character selection, cost, hand) are 0.75rem (reduced from 1.5rem)
- **AND** cost-section padding is 0.5rem (reduced from 0.75rem)
- **AND** hand-grid padding is 0.5rem (reduced from 0.75rem)

#### Scenario: Large screen padding
- **WHEN** dialog is displayed on screens ≥ 500px wide
- **THEN** dialog outer padding is 1.5rem-2rem as per original design
- **AND** section margins are 1.5rem
- **AND** section padding is 1rem

### Requirement: Font sizes scale responsively
Text content including titles, labels, and descriptions SHALL use responsive clamp() sizing to adapt to screen constraints.

#### Scenario: Mobile heading sizes
- **WHEN** dialog is displayed on screens < 500px wide
- **THEN** h2 (dialog title) uses clamp(1.2rem, 5vw, 1.8rem)
- **AND** h3 (section headers) uses clamp(0.9rem, 4vw, 1.1rem)
- **AND** cost-description uses clamp(0.75rem, 2vw, 0.9rem)

#### Scenario: Desktop heading sizes
- **WHEN** dialog is displayed on screens ≥ 500px wide
- **THEN** font sizes scale to larger clamp() maximums for better desktop visibility
- **AND** no fixed font sizes are used (all use clamp() or responsive units)

### Requirement: Dialog remains functional across all devices
Dialog interaction and cost validation SHALL work identically across all screen sizes with no functional degradation.

#### Scenario: Character selection on mobile
- **WHEN** user clicks character card thumbnail on 320px screen
- **THEN** character is selected (visual feedback visible)
- **AND** cost section updates to show selected character's cost
- **AND** hand cards are available for selection

#### Scenario: Cost payment validation on small screen
- **WHEN** user selects hand cards to pay cost on mobile
- **THEN** cost validation runs correctly
- **AND** validation UI feedback (selected state, error message) is visible
- **AND** Activate button enables only when payment is valid

#### Scenario: Button accessibility on touch
- **WHEN** user touches buttons (Activate, Cancel, character cards, hand cards) on touch device
- **THEN** touch target size is adequate (≥ 44x44 logical pixels / ~9mm)
- **AND** visual feedback (hover/focus state) is visible
- **AND** button responds correctly to touch input

### Requirement: Cost information remains readable
Cost section text and layout SHALL remain clear and readable even when space is constrained.

#### Scenario: Cost summary on mobile
- **WHEN** dialog displays cost information on 320px screen
- **THEN** cost summary (e.g., "Cost: 3+1") is visible
- **AND** detailed cost description (e.g., "3 cards + 1 card OR 2 identical pairs") is visible below
- **AND** diamond bonus info (if applicable) is visible
- **AND** no truncation occurs without explicit overflow styling

#### Scenario: Cost description truncation prevention
- **WHEN** cost-description text is long (e.g., "Two identical pairs of pearl cards (both same value) OR three cards of same value")
- **THEN** text wraps naturally within available width
- **AND** no text is cut off or hidden
- **AND** overflow-x is hidden to prevent horizontal scroll

### Requirement: Scrolling behavior is appropriate
Dialog scrolling SHALL only occur when necessary and SHALL be intuitive to users.

#### Scenario: No scroll on standard content
- **WHEN** dialog has typical content (1-4 characters, 5-8 hand cards) on 600px+ screen
- **THEN** dialog fits fully in viewport without scrolling
- **AND** users do not expect scroll

#### Scenario: Scroll on small screen with large hand
- **WHEN** dialog is on 320px screen with large hand (10+ cards)
- **THEN** dialog allows vertical scrolling
- **AND** scroll is smooth and necessary (content genuinely exceeds height)
- **AND** all sections remain accessible via scroll

#### Scenario: Scroll on very small screen
- **WHEN** dialog is on screen < 320px (extremely rare edge case)
- **THEN** dialog may scroll vertically to fit content
- **AND** horizontal scroll is never needed (dialog respects max-width and wrapping)

### Requirement: Diamantanzahl-Prop im Aktivierungsdialog
Der `CharacterActivationDialog` SHALL die verfügbare Diamantenanzahl als `number` entgegennehmen. Der Aufrufer berechnet diesen Wert als `player.diamondCards.length`.

#### Scenario: Diamantenanzahl wird korrekt übergeben
- **WHEN** der Aktivierungsdialog geöffnet wird
- **THEN** erhält der Dialog `diamonds={player.diamondCards.length}` als Prop
- **AND** die interne Validierungslogik des Dialogs bleibt unverändert

### Requirement: Diamantkosten-Sektion responsive dargestellt
Die neue Diamantkosten-Sektion im Aktivierungsdialog SHALL das gleiche visuelle Muster wie bestehende Sektionen verwenden und auf allen Bildschirmgrößen korrekt dargestellt werden.

#### Scenario: Diamantkosten-Sektion auf kleinen Bildschirmen
- **WHEN** der Dialog auf einem Bildschirm < 500px angezeigt wird
- **THEN** ist die Diamantkosten-Sektion vollständig sichtbar ohne horizontales Scrollen
- **AND** der Toggle-Button hat eine ausreichende Touch-Target-Größe (≥ 44px Höhe)

#### Scenario: Diamantkosten-Sektion auf großen Bildschirmen
- **WHEN** der Dialog auf einem Bildschirm ≥ 500px angezeigt wird
- **THEN** ist die Diamantkosten-Sektion visuell konsistent mit den anderen Sektionen des Dialogs
