# touch-card-interaction Specification

## Purpose
TBD - created by archiving change interactive-card-buttons. Update Purpose after archive.
## Requirements
### Requirement: Touch Support for Card Selection
Cards SHALL respond to touch input on mobile and tablet devices, not just mouse.

#### Scenario: Touch tap to hover (preview)
- **WHEN** user taps a card on touch device
- **THEN** card shows hover state (elevation, shadow)
- **AND** visual feedback indicates card is interactive
- **AND** first tap acts as preview/hover

#### Scenario: Second touch tap to select
- **WHEN** user taps again on the same card (already hovered)
- **THEN** card is selected
- **AND** selection state is applied
- **AND** game logic processes the selection
- **AND** workflow is: tap (hover) → tap (select)

#### Scenario: Touch on different card
- **WHEN** user taps a different card while one is hovered
- **THEN** previous card's hover state is removed
- **AND** new card's hover state is applied
- **AND** selection is not triggered (only hover)

#### Scenario: Long press (optional alternative)
- **WHEN** user presses and holds on card for 500ms+
- **THEN** card is selected without requiring second tap (alternative UX)
- **AND** feedback is provided during long press
- **AND** selection occurs when threshold is reached

### Requirement: Pointer Events Unified Handling
Mouse and touch events SHALL be handled with a unified pointer event system.

#### Scenario: Single handler for mouse and touch
- **WHEN** user interacts via mouse or touch
- **THEN** single event handler (pointerdown, pointerup, pointermove) processes both
- **AND** no conflict between mouse and touch handlers
- **AND** cross-platform behavior is consistent

#### Scenario: Pointer move for hover on touch
- **WHEN** user hovers finger near card (without touching)
- **THEN** pointermove events are detected (if supported)
- **AND** hover state is applied
- **AND** visual feedback is shown

### Requirement: Touch Doesn't Prevent Scroll
Touch interactions on cards SHALL not prevent document/viewport scrolling.

#### Scenario: Swipe to scroll still works
- **WHEN** user swipes on touch device (not tapping a card)
- **THEN** page/board scrolling works normally
- **AND** card interactions don't block scroll gestures
- **AND** preventDefault() is used judiciously

#### Scenario: Card tap doesn't scroll page
- **WHEN** user taps a card specifically
- **THEN** card is selected
- **AND** accidental scrolling is prevented during tap
- **AND** scroll behavior is natural (not overly blocked)

### Requirement: Mobile-Friendly Touch Targets
Card interactive areas SHALL meet accessibility minimum for touch.

#### Scenario: Touch targets are at least 44x44px
- **WHEN** card is rendered on mobile device
- **THEN** interactive hit area is at least 44×44 points (iOS) or 48×48dp (Android)
- **AND** padding/margins ensure minimum target size
- **AND** easy to tap without accidental presses

#### Scenario: Visual feedback is immediate on touch
- **WHEN** user touches card
- **THEN** visual feedback (hover state) appears immediately
- **AND** feedback is fast enough to feel responsive
- **AND** lag is not perceptible to user

### Requirement: Pointer Type Detection
The system SHALL detect pointer type (mouse vs touch) for appropriate feedback.

#### Scenario: Hover effect only for mouse
- **WHEN** user has mouse (not touch)
- **THEN** hover effect is applied on mouse move
- **AND** smooth hover animations work
- **AND** pointer state is tracked correctly

#### Scenario: Touch fallback when no hover
- **WHEN** user is on touch device
- **AND** pointer type is touch
- **THEN** hover state on touch is different from mouse hover (if needed)
- **AND** two-tap selection workflow is used instead of single-click

