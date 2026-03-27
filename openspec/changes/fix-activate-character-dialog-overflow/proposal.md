## Why

The "Activate Character" dialog (CharacterActivationDialog.tsx) overflows its container on most screen sizes. The dialog content includes a large character card image, cost requirements display, and hand card selection buttons, which together exceed the available viewport height and width. This makes the dialog partially off-screen or requires excessive scrolling on mobile and tablet devices.

## What Changes

- Reduce font sizes and padding in the dialog to fit standard mobile/tablet viewports
- Scale down the character card preview image in the dialog
- Optimize spacing between dialog sections (title, character card, cost, hand cards)
- Ensure all dialog content remains visible without scrolling on screens ≥600px wide
- Maintain readability and usability on all supported devices (iPhone 5+, tablets, desktop)

## Capabilities

### New Capabilities

- `character-activation-dialog-responsive-sizing`: Dialog layout that adapts font sizes, padding, and image scaling to fit within viewport constraints across all device sizes.

### Modified Capabilities

<!-- No existing capability specs are being modified; this is a layout fix within an existing component. -->

## Impact

- **Affected Code:** `game-web/src/components/CharacterActivationDialog.tsx` and its stylesheet
- **Affected Styles:** CSS module or Tailwind classes for dialog container, title, image, cost display, and button grid
- **Testing:** Update component tests to verify dialog fits within common viewport dimensions
- **User Impact:** Improved mobile/tablet UX; no breaking changes to functionality or API
