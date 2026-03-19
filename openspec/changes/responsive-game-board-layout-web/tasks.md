## 1. Layout Architecture and Utilities

- [ ] 1.1 Create TypeScript types for layout configuration (`LayoutPreset`, `LayoutArea`, `LayoutConstraints`)
- [ ] 1.2 Create React hook `useLayoutPreferences()` for loading/saving layouts from localStorage
- [ ] 1.3 Create utility functions for calculating responsive sizes (percentages, constraints, aspect ratios)
- [ ] 1.4 Create CSS module for base responsive layout styles and Grid/Flexbox patterns
- [ ] 1.5 Create Tailwind configuration extensions for custom breakpoints if needed

## 2. Layout Presets and Defaults

- [ ] 2.1 Define default layout preset for mobile portrait (≤ 640px)
- [ ] 2.2 Define default layout preset for mobile landscape (640-1024px, landscape)
- [ ] 2.3 Define default layout preset for tablet (768-1024px)
- [ ] 2.4 Define default layout preset for desktop (> 1024px)
- [ ] 2.5 Store presets in TypeScript constants or JSON files for easy updates

## 3. CSS Responsive Layout System

- [ ] 3.1 Create responsive CSS Grid layout for board areas (deck, hand, face-up cards, opponents)
- [ ] 3.2 Implement mobile-first CSS with media queries for sm (640px), md (768px), lg (1024px) breakpoints
- [ ] 3.3 Define Flexbox patterns for content within each area (cards, buttons, labels)
- [ ] 3.4 Use CSS `aspect-ratio` property for maintaining card and board proportions
- [ ] 3.5 Use CSS `clamp()` for responsive font sizes and padding (e.g., `clamp(12px, 5vw, 24px)`)
- [ ] 3.6 Add CSS custom properties (variables) for easy customization of sizes and spacing

## 4. Image and Content Scaling

- [ ] 4.1 Update all card image elements to use `object-fit: contain` with `width: 100%` and `height: auto`
- [ ] 4.2 Use CSS `aspect-ratio` property on card containers to prevent layout shift while images load
- [ ] 4.3 Implement responsive image sizing with min/max width constraints
- [ ] 4.4 Support different `object-fit` modes (contain, cover, fill) for different image types
- [ ] 4.5 Test image scaling across different viewport sizes (375px, 768px, 1920px)
- [ ] 4.6 Verify no distortion or aspect ratio changes on any device

## 5. CanvasGameBoard Refactoring

- [ ] 5.1 Refactor `CanvasGameBoard.tsx` component structure to use new CSS Grid layout
- [ ] 5.2 Replace hard-coded `width` and `height` styles with responsive CSS classes
- [ ] 5.3 Update opponent indicator display to use responsive Flexbox layout
- [ ] 5.4 Update action buttons area to scale with responsive layout and maintain touch targets (≥ 44px)
- [ ] 5.5 Update player hand display component to use responsive layout
- [ ] 5.6 Update face-up cards display to use responsive CSS Grid with dynamic columns
- [ ] 5.7 Update deck display to use responsive sizing with constraints
- [ ] 5.8 Test board on multiple viewport sizes without scrolling (except content overflow)

## 6. Responsive Hooks and Context

- [ ] 6.1 Create custom hook `useViewportSize()` to detect and provide current viewport dimensions
- [ ] 6.2 Create custom hook `useOrientation()` to detect portrait/landscape orientation
- [ ] 6.3 Create custom hook `useResponsiveLayout()` to determine and apply layout preset based on viewport
- [ ] 6.4 Add ResizeObserver or media query listeners to detect viewport changes
- [ ] 6.5 Ensure layout updates smoothly when viewport changes (no lag, < 300ms transition)

## 7. Layout Customization UI

- [ ] 7.1 Create `LayoutCustomizationPanel.tsx` component with sliders for adjusting area sizes
- [ ] 7.2 Implement size slider controls for each board area (hand, deck, face-up, opponents, actions)
- [ ] 7.3 Add real-time preview of layout changes as user adjusts sliders
- [ ] 7.4 Add "Save Layout" button to persist current layout to localStorage
- [ ] 7.5 Add "Save As" functionality to save layout with custom name
- [ ] 7.6 Implement validation to prevent invalid layouts (minimum sizes, touch targets)
- [ ] 7.7 Add helpful tooltips and error messages for validation failures

## 8. Layout Persistence and Management

- [ ] 8.1 Implement localStorage save/load for custom layout preferences
- [ ] 8.2 Store layouts separately for each orientation (portrait/landscape)
- [ ] 8.3 Add "Load Layout" menu to switch between saved layouts
- [ ] 8.4 Implement "Reset to Default" button for single area
- [ ] 8.5 Implement "Reset All Layouts" button to clear all customizations
- [ ] 8.6 Add delete functionality for removing saved layouts
- [ ] 8.7 Implement fallback to default layout if saved layout is corrupt or invalid
- [ ] 8.8 Add migration logic for future layout format changes

## 9. Testing and Validation

- [ ] 9.1 Test layout on mobile (iPhone 12, 13, 14, various screen sizes)
- [ ] 9.2 Test layout on tablet (iPad, Galaxy Tab)
- [ ] 9.3 Test layout on desktop at multiple resolutions (1024px, 1440px, 1920px, 2560px)
- [ ] 9.4 Test orientation change (portrait ↔ landscape) on mobile devices
- [ ] 9.5 Test window resize on desktop (smooth transition, no flickering)
- [ ] 9.6 Test responsive scaling of images (no distortion, correct aspect ratio)
- [ ] 9.7 Test touch targets are accessible (≥ 44px minimum on all devices)
- [ ] 9.8 Test game state preservation during layout transitions
- [ ] 9.9 Test layout customization save/load persists across page refresh
- [ ] 9.10 Test edge cases: minimum viewport (320px), maximum viewport (2560px)

## 10. Performance and Optimization

- [ ] 10.1 Profile layout rendering with browser DevTools (aim for 60 FPS)
- [ ] 10.2 Optimize CSS for paint/composite performance (avoid expensive property changes)
- [ ] 10.3 Use CSS `will-change` sparingly for animated layout transitions if needed
- [ ] 10.4 Verify no unnecessary re-renders in React when viewport changes
- [ ] 10.5 Test performance on low-end mobile devices (older iPhones, budget Android)
- [ ] 10.6 Ensure no layout shift (CLS) during image loading using aspect-ratio
- [ ] 10.7 Minimize JavaScript for layout calculations (prefer CSS)

## 11. Integration and Final Testing

- [ ] 11.1 Test game engine and networking are not affected by layout changes
- [ ] 11.2 Test game state preservation during layout transitions
- [ ] 11.3 Test full game flow on each device type (play complete game)
- [ ] 11.4 Verify all game actions work correctly across different layouts
- [ ] 11.5 Test custom layout preferences persist across app instances
- [ ] 11.6 Test reset functionality works correctly
- [ ] 11.7 Manual regression testing against old layout (if keeping as fallback)

## 12. Documentation and Polish

- [ ] 12.1 Document responsive layout system in code comments
- [ ] 12.2 Add JSDoc comments to layout hooks and utilities
- [ ] 12.3 Create README section on layout customization
- [ ] 12.4 Add in-game UI hints/tooltips for layout customization controls
- [ ] 12.5 Create user guide on how to customize and save layouts
- [ ] 12.6 Ensure reset functionality is discoverable in settings/UI
- [ ] 12.7 Final code review and cleanup
