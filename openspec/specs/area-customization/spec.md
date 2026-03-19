# area-customization Specification

## Purpose
TBD - created by archiving change responsive-game-board-layout-web. Update Purpose after archive.
## Requirements
### Requirement: Save custom layout preferences
Players SHALL be able to customize board area sizes and save those preferences for later use on the same device.

#### Scenario: Player adjusts area and saves custom layout
- **WHEN** player opens layout customization UI
- **AND** adjusts the player hand area to 50% width
- **AND** adjusts face-up card area height to 35%
- **AND** clicks "Save Layout"
- **THEN** the new preferences are saved to localStorage
- **AND** the next time the browser loads the game, the custom layout is applied
- **AND** changes persist across multiple sessions

#### Scenario: User saves layout with a custom name
- **WHEN** player customizes layout and clicks "Save As"
- **THEN** system shows a dialog prompting for custom name (e.g., "Compact", "Spacious")
- **AND** player enters a name and confirms
- **THEN** layout is saved with that name in localStorage
- **AND** appears in a list of saved layouts

#### Scenario: Layout preferences specific to orientation
- **WHEN** player saves a custom layout in portrait orientation
- **AND** later rotates device to landscape
- **THEN** system loads a different saved layout for landscape (if one exists)
- **OR** loads default landscape preset if no custom landscape layout saved

### Requirement: Load saved layout preferences
The system SHALL remember and restore layout preferences when the browser is refreshed or the game is relaunched.

#### Scenario: Load saved layout on app launch
- **WHEN** app launches and player previously saved custom layout
- **THEN** system checks localStorage for saved layout matching current orientation
- **AND** applies the saved layout automatically
- **AND** player sees their preferred layout without additional steps

#### Scenario: Switch between saved layouts
- **WHEN** player opens layout menu and selects a different saved layout
- **THEN** board immediately updates to the selected layout
- **AND** game continues without interruption or state loss
- **AND** selected layout is marked as active in the menu

#### Scenario: Load layout after page refresh
- **WHEN** user refreshes browser or closes/reopens game tab
- **THEN** system loads the most recently used layout from localStorage
- **AND** layout applies before game board renders
- **AND** user sees consistent layout across sessions

#### Scenario: Load layout after orientation change
- **WHEN** device rotates from portrait to landscape (or vice versa)
- **THEN** system checks for saved layout for new orientation
- **AND** if custom layout saved for that orientation, applies it
- **AND** if no custom layout exists, uses default preset for new orientation
- **AND** transition is smooth and doesn't disrupt gameplay

### Requirement: Reset layout to defaults
Players SHALL have options to reset individual areas or entire layouts back to defaults without manual adjustment.

#### Scenario: Reset single area to default
- **WHEN** player right-clicks an area or finds reset button in area settings
- **AND** clicks "Reset Area"
- **THEN** that area reverts to default size and position for current orientation
- **AND** other areas retain their custom sizes
- **AND** changes take effect immediately without needing to save

#### Scenario: Reset entire layout to default
- **WHEN** player clicks "Reset All Layouts" in settings menu
- **THEN** all saved custom layouts are deleted from localStorage
- **AND** system returns to using default presets
- **AND** on next app launch, default layout is used for all orientations

#### Scenario: Reset with confirmation dialog
- **WHEN** player clicks reset button
- **THEN** system shows confirmation dialog ("This will reset your layout. Continue?")
- **AND** player can cancel to keep current layout
- **AND** if confirmed, reset happens immediately

### Requirement: Persist layout preferences across app updates
Saved layout preferences SHALL remain available after page reload, browser cache clear (where possible), or app updates.

#### Scenario: Layout preferences persist after page refresh
- **WHEN** user refreshes the browser/page
- **AND** app reloads from scratch
- **THEN** previously saved layouts are still in localStorage
- **AND** are loaded and applied as expected

#### Scenario: Layout preferences persist across sessions
- **WHEN** user closes browser and returns hours/days later
- **THEN** previously saved layouts are still available
- **AND** are applied when game is opened again

#### Scenario: Invalid or corrupt layout handled gracefully
- **WHEN** app updates and layout format changes
- **AND** saved layout is no longer compatible
- **THEN** system detects incompatibility and uses fallback logic
- **AND** automatically resets to default layout
- **AND** shows user notification that layout preferences were reset

### Requirement: Prevent invalid or illegible custom layouts
The system SHALL enforce minimum size constraints and validation rules to ensure all areas remain usable and readable.

#### Scenario: Enforce minimum area width
- **WHEN** player attempts to resize an area below 100px width (or minimum for that area)
- **THEN** system prevents the resize or snaps to minimum width
- **AND** shows tooltip indicating the minimum size requirement
- **AND** area cannot be made smaller than required minimum

#### Scenario: Enforce minimum area height
- **WHEN** player attempts to resize an area below 80px height
- **THEN** system prevents the resize, snapping to minimum
- **AND** provides visual feedback (tooltip, disabled state)

#### Scenario: Enforce touch target size for buttons
- **WHEN** player customizes layout
- **THEN** system ensures action buttons remain at least 44px (iOS) or 48px (Android) minimum
- **AND** prevents layout from reducing button size below accessibility standards

#### Scenario: Prevent text from becoming unreadable
- **WHEN** player customizes layout
- **THEN** system prevents font-sizes from dropping below 12px
- **AND** ensures sufficient line-height for readability
- **AND** warns if text would become illegible

#### Scenario: Validate layout totals don't exceed container
- **WHEN** player customizes layout with percentage-based areas
- **THEN** system validates that total percentages don't prevent rendering
- **AND** shows warning if layout is invalid (e.g., hand 60% + cards 60% = 120%)
- **AND** suggests adjustments to make layout valid

