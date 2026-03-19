## ADDED Requirements

### Requirement: Scale images proportionally without distortion
Card images and artwork displayed in board areas SHALL scale to fit available space using CSS `object-fit` while maintaining their original aspect ratio. Images SHALL NOT be stretched, squeezed, or distorted.

#### Scenario: Image fits within area maintaining aspect ratio
- **WHEN** a card image (e.g., 200×300px native) is placed in an area with 150px width
- **THEN** the image scales proportionally to fit (100×150px logical size)
- **AND** the image is centered within available space using `object-fit: contain`
- **AND** no distortion, stretching, or aspect ratio change occurs

#### Scenario: Image larger than available space
- **WHEN** a card image is larger than containing area
- **THEN** the image scales down to fit proportionally using `object-fit: contain`
- **AND** empty space around the image is visible (letterboxing/pillarboxing)
- **AND** entire image remains visible

#### Scenario: Image smaller than available space
- **WHEN** a card image is smaller than containing area
- **THEN** the image displays at native size or scales up proportionally using `object-fit: contain`
- **AND** no upscaling occurs (image stays sharp)
- **OR** if upscaling is desired, image scales proportionally maintaining aspect ratio

#### Scenario: Background image fills area without distortion
- **WHEN** a board background image with `aspect-ratio: 16 / 9` is placed in a container
- **THEN** the image fills the container maintaining 16:9 ratio using `object-fit: cover`
- **AND** image edges may be cropped to fill space
- **AND** no distortion occurs—aspect ratio is preserved

### Requirement: Scale text and UI elements responsively
Text labels, icons, buttons, and UI controls within board areas SHALL scale proportionally as the area and viewport resize, maintaining readability and touch target sizes.

#### Scenario: Font size scales with viewport width
- **WHEN** a player name label has `font-size: clamp(12px, 5vw, 24px)`
- **THEN** text size increases/decreases with viewport width
- **AND** text remains readable (minimum 12px on tiny screens, max 24px on large screens)
- **AND** text never clips or causes layout reflow

#### Scenario: Icon size respects accessibility minimum
- **WHEN** action icons (pass, play card, undo) have `width: clamp(24px, 8vw, 44px)`
- **THEN** icons scale with viewport but remain touchable (≥ 44px on most devices)
- **AND** icons never become too small to tap (< 32px)

#### Scenario: Padding and spacing scale with area size
- **WHEN** padding between elements is defined as `gap: clamp(4px, 2vw, 16px)`
- **THEN** spacing scales with viewport width
- **AND** visual balance and hierarchy maintained
- **AND** content doesn't feel cramped or too spread out

### Requirement: Support multiple content display modes for images
The system SHALL support different scaling strategies (contain, cover, fill) for different types of imagery.

#### Scenario: Card image displayed with "contain" mode
- **WHEN** a card in the hand uses `object-fit: contain`
- **THEN** the entire card image is always visible within bounds
- **AND** aspect ratio is preserved
- **AND** margins/padding appear around the card if needed

#### Scenario: Background image displayed with "cover" mode
- **WHEN** game board background uses `object-fit: cover`
- **THEN** image covers entire board area, cropping edges if necessary
- **AND** aspect ratio is maintained (no distortion)
- **AND** no empty space is visible

#### Scenario: Custom image display with percentage sizing
- **WHEN** an image element has `width: 100%` and `height: auto` with `aspect-ratio: auto`
- **THEN** image displays at its native aspect ratio
- **AND** scales to fill container width, height adapts proportionally
- **AND** no distortion occurs
