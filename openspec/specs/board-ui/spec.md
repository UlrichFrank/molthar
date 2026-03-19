# Board UI Specification

## Purpose
Visual playfield composition and interactive board behavior for the browser-based Molthar game table.

## Requirements

### Requirement: Table Layout
The web client SHALL present the playfield as a shared table with a central market and portal zones arranged around it.

#### Scenario: Render the main board
- GIVEN a player has entered an active game session
- WHEN the board is rendered
- THEN the center of the table shows the shared market for two character cards and four pearl cards
- AND the local player's portal area is rendered at the bottom
- AND opponent portal areas are rendered around the remaining sides according to player count

### Requirement: Local Player Portal Information
The web client SHALL show the local player's actionable portal state.

#### Scenario: Show the local player's resources
- GIVEN the local player is viewing the game board
- WHEN the player portal area is rendered
- THEN the interface shows the player's hand, portal cards, power points, and diamonds
- AND activated characters are visually separated from inactive portal cards
- AND turn actions are available from the same portal area when it is that player's turn

### Requirement: Opponent Portal Placement
The web client SHALL orient opponent portal regions according to the table spec.

#### Scenario: Render a four- or five-player table
- GIVEN the game has multiple opponents
- WHEN the board draws opponent portal areas
- THEN left and right opponents are rendered beside the market
- AND upper opponents are rendered above the market
- AND each opponent area uses the portal orientation expected from the local player's perspective

### Requirement: Pointer-Based Board Interaction
The web client SHALL support direct selection of market cards, portal targets, hand cards, and board actions.

#### Scenario: Select game elements on the board
- GIVEN the active player is interacting with the board
- WHEN the player clicks or taps a visible market card, hand card, portal slot, or action control
- THEN the interface updates selection state for that object
- AND the next valid move uses the selected object as input

#### Scenario: Distinguish click from drag
- GIVEN the player interacts with the canvas board
- WHEN the pointer movement stays below the drag threshold
- THEN the interaction is treated as a click selection
- AND when the movement exceeds the threshold it is treated as a drag-style interaction

### Requirement: Board Artwork and Zones
The web client SHOULD follow the table composition described by the board specification assets.

#### Scenario: Apply the specified board composition
- GIVEN the board artwork assets are available
- WHEN the board background and zones are rendered
- THEN the center area uses the Auslage presentation
- AND the local player's portal uses the wardrobe-style portal artwork
- AND unused opponent zones fall back to neutral scroll-style artwork rather than active portals
