## Context

The CharacterActivationDialog is a modal overlay that appears when a player clicks a portal character to activate it. The dialog contains:
1. Character selection grid (thumbnails of available characters)
2. Cost section (cost summary + detailed description + diamond bonus info)
3. Hand card grid (pearl cards for payment selection)
4. Action buttons (Activate / Cancel)

Current state:
- Dialog has responsive breakpoints at 500px media query
- Mobile devices < 500px use: 80px character cards, 60px hand cards, 0.75rem padding, clamp() for fonts
- Desktop ≥ 500px use: 100px character cards, 70px hand cards, 1rem padding, larger clamp() values
- Dialog has `max-height: calc(100vh - 2rem)` with overflow-y: auto (scrolling allowed)

The issue: On small screens (320-480px), content still exceeds available space. Players see scrolling is required, or bottom sections are cut off. The character card preview and hand cards are too large for cramped viewports.

## Goals / Non-Goals

**Goals:**
- Reduce padding, font sizes, and card dimensions on small screens (< 500px)
- Ensure all dialog sections are visible without scrolling on screens 600px+ wide
- Maintain clear visual hierarchy and readability on all devices
- Preserve card functionality (clickable, visual feedback, cost info)
- Support common viewport sizes: 320px (iPhone SE), 375px (iPhone 6-8), 414px (iPhone 11), 480px (small tablet), 600px+ (standard tablet/desktop)

**Non-Goals:**
- Redesign the dialog layout or component structure
- Add new features (e.g., collapsible sections, pagination)
- Change dialog content or interaction patterns
- Modify game logic or cost validation
- Remove visual polish (animations, hover effects, gradients)

## Decisions

### Decision 1: Aggressive padding reduction on small screens
**Approach:** Reduce padding from 0.75rem to 0.5rem on mobile (< 500px); reduce section margins from 1.5rem to 0.75rem.

**Rationale:**
- On 320px viewport, 1.5rem side padding = 48px total = 272px content width. Hand card grid with 60px cards + gaps takes ~200px with 3-4 columns. Padding is the easy win.
- Section margins (between character selection, cost, hand) are visual separators but not critical to functionality.

**Alternative considered:**
- Keep padding, reduce card dimensions more aggressively. Downsides: hand cards become too small to click reliably on touch, cost text becomes hard to read.

### Decision 2: Scale character card thumbnails smaller on mobile
**Approach:**
- Mobile (< 500px): 70px character cards (down from 80px), grid: repeat(auto-fit, minmax(70px, 1fr))
- Keep aspect-ratio: 59/92 (card aspect) so proportions remain correct
- Reduce gap from 0.75rem to 0.5rem

**Rationale:**
- 70px vs 80px saves ~14% space per card. With 2-4 character choices, saves meaningful dialog width.
- Aspect ratio preserved ensures card images scale proportionally.
- Touch targets remain adequate (70x108px with aspect ratio).

**Alternative considered:**
- Reduce to 60px. Downsides: touch targets become too small (60x92px), card names/costs become unreadable in overlay.

### Decision 3: Scale hand card buttons smaller on mobile
**Approach:**
- Mobile (< 500px): minmax(55px, 1fr) hand cards (down from 60px), min-height: 60px (down from 70px), padding: 0.25rem
- Desktop (≥ 500px): minmax(70px, 1fr), min-height: 80px, padding: 0.5rem
- Adjust card-value font: clamp(1rem, 4vw, 1.5rem) (down from clamp(1.2rem, 5vw, 1.8rem))

**Rationale:**
- Hand cards are the most space-consuming element. Reducing from 70px to 60px saves ~14% width.
- min-height reduction from 70px to 60px saves vertical space without losing touch target (60px is still adequate for touch).
- Smaller font for card values reduces layout jitter and improves fit.

**Alternative considered:**
- Use 2-row fixed layout instead of auto-fill grid. Downsides: poor UX for large hands (5+ cards), no longer responsive.

### Decision 4: Tighten cost-section padding and font sizes
**Approach:**
- Mobile: padding 0.5rem (down from 0.75rem), gap 0.3rem between cost description and diamond bonus
- Cost-description font: clamp(0.75rem, 2vw, 0.9rem) (down from clamp(0.8rem, 2vw, 0.95rem))
- h3 in cost-section: reduce margin-bottom to 0.3rem (from 0.5rem)

**Rationale:**
- Cost section is compact info. Reducing padding from 0.75rem to 0.5rem saves 1.5rem per side (3rem total on 320px = significant).
- Smaller margins between h3 and description text reduce vertical space without hurting readability.

**Alternative considered:**
- Combine cost and diamond info into single line (e.g., "Cost: 3+1 | 💎 2 available"). Downside: harder to parse, less clear hierarchy.

### Decision 5: Adjust hand-grid gap and padding
**Approach:**
- Mobile: gap 0.4rem (down from 0.5rem), padding 0.5rem (down from 0.75rem)
- Desktop: gap 0.75rem (down from 1rem), padding 1rem

**Rationale:**
- Smaller gaps between cards reduce overall grid width without affecting card sizes.
- Padding reduction saves space on narrower viewports.

### Decision 6: Title and header font sizes
**Approach:**
- h2 (dialog title): clamp(1.2rem, 5vw, 1.8rem) (down from clamp(1.3rem, 5vw, 1.8rem))
- h3 (section headers): clamp(0.9rem, 4vw, 1.1rem) (down from clamp(1rem, 4vw, 1.2rem))

**Rationale:**
- Slightly smaller minimum font sizes reduce title/header height, especially on very small screens.
- clamp() still scales up on larger screens, preserving desktop readability.

### Decision 7: Action buttons padding
**Approach:**
- Mobile: padding 0.4rem 0.6rem (down from 0.6rem 0.8rem)
- Font: clamp(0.75rem, 3vw, 0.95rem) (down from clamp(0.85rem, 3vw, 1rem))

**Rationale:**
- Smaller button padding saves vertical space at bottom of dialog.
- Buttons remain clickable (min ~36px height on small screens).

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| **Touch targets become too small** | Hand cards min-height 60px (9.6mm), character cards 70px width (11.2mm). Both exceed WCAG AA 24-44dp (mobile). Acceptable risk. |
| **Font sizes become harder to read** | clamp() min values tested with readable base (0.9rem h3, 0.75rem descriptions). Font sizes still larger than typical UI text. Test on actual devices. |
| **Card image aspect ratios distort** | Character cards use aspect-ratio CSS property. Aspect ratio preserved (59/92). Not a risk. |
| **Dialog still overflows on ultra-small screens (< 320px)** | Only affects very old/small devices (iPhone 4, etc.). Acceptable trade-off; target is iPhone SE+ (375px+). Dialog will scroll if absolutely necessary. |
| **Visual polish reduced** | Hover effects, gradients, borders preserved. Only spacing/sizing reduced. No visual downgrade. |
| **Hand card value font smaller** | clamp(1rem, 4vw, 1.5rem) still readable on 320px (≈1.1rem). Trade-off acceptable. |

## Migration Plan

1. **Modify CSS:** Update `/game-web/src/styles/characterActivationDialog.css` with reduced padding, font sizes, card dimensions per decisions above.
2. **Test locally:**
   - Test on DevTools mobile emulation (320px, 375px, 414px, 480px, 600px+)
   - Test on actual mobile device if available (iPhone SE, standard Android phone)
   - Verify all content visible without scrolling on 600px+ screens
   - Verify hand grid doesn't exceed dialog width on 320px screens
3. **Update tests:** Verify CharacterActivationDialog test doesn't rely on specific sizing assumptions.
4. **No deployment rollback needed:** CSS change is style-only; can be reverted quickly if issues arise.

## Open Questions

1. **Should we add a horizontal scroll on very small screens (< 320px)?** Current plan: allow vertical scroll; horizontal scroll disabled.
2. **Should hand cards be 2-row fixed layout on mobile?** Current plan: no; responsive auto-fill grid scales better.
3. **Should we collapse cost-description on mobile?** Current plan: no; cost info is essential for player decision-making.
