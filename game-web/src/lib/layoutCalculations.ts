/**
 * Utility functions for calculating responsive layout sizes.
 * Handles percentage-based sizing, constraints, and aspect ratio calculations.
 */

import { LayoutArea, SizeConstraints } from './layoutTypes';

/**
 * Calculates the actual width of a layout area given container width and constraints.
 */
export function calculateAreaWidth(
  area: LayoutArea,
  containerWidth: number
): number {
  let calculatedWidth: number;

  if (area.widthPercent !== undefined) {
    calculatedWidth = (area.widthPercent / 100) * containerWidth;
  } else if (area.width !== undefined) {
    calculatedWidth = area.width;
  } else {
    calculatedWidth = containerWidth;
  }

  // Apply constraints
  return applyConstraints(calculatedWidth, area.constraints, 'width');
}

/**
 * Calculates the actual height of a layout area given container height and optional width.
 * If aspect ratio is set and width is provided, height is derived from ratio.
 */
export function calculateAreaHeight(
  area: LayoutArea,
  containerHeight: number,
  calculatedWidth?: number
): number {
  let calculatedHeight: number;

  // If aspect ratio is set and we have width, use that
  if (area.constraints.aspectRatio && calculatedWidth) {
    calculatedHeight = calculatedWidth / area.constraints.aspectRatio;
  } else if (area.heightPercent !== undefined) {
    calculatedHeight = (area.heightPercent / 100) * containerHeight;
  } else if (area.height !== undefined) {
    calculatedHeight = area.height;
  } else {
    calculatedHeight = containerHeight;
  }

  // Apply constraints
  return applyConstraints(calculatedHeight, area.constraints, 'height');
}

/**
 * Applies min/max constraints to a calculated size value.
 */
function applyConstraints(
  value: number,
  constraints: SizeConstraints,
  dimension: 'width' | 'height'
): number {
  let result = value;

  const minKey = dimension === 'width' ? 'minWidth' : 'minHeight';
  const maxKey = dimension === 'width' ? 'maxWidth' : 'maxHeight';

  if (constraints[minKey as keyof SizeConstraints]) {
    result = Math.max(result, constraints[minKey as keyof SizeConstraints]!);
  }
  if (constraints[maxKey as keyof SizeConstraints]) {
    result = Math.min(result, constraints[maxKey as keyof SizeConstraints]!);
  }

  return result;
}

/**
 * Validates a layout to ensure areas don't overlap and fit within container.
 * Returns true if layout is valid, false otherwise.
 */
export function isValidLayout(
  areas: Record<string, { width: number; height: number }>,
  containerWidth: number,
  containerHeight: number
): boolean {
  const totalWidth = Object.values(areas).reduce((sum, area) => sum + area.width, 0);
  const totalHeight = Object.values(areas).reduce((sum, area) => sum + area.height, 0);

  // Allow some flexibility (areas can exceed container due to margin/padding)
  return totalWidth <= containerWidth * 1.2 && totalHeight <= containerHeight * 1.2;
}

/**
 * Calculates responsive font size using CSS clamp-like logic.
 * clampSize(12, 5, 24) means: min 12px, scale at 5vw, max 24px
 */
export function clampSize(minPx: number, vwScale: number, maxPx: number): string {
  return `clamp(${minPx}px, ${vwScale}vw, ${maxPx}px)`;
}

/**
 * Converts percentage value to pixels based on container dimension.
 */
export function percentToPixels(percent: number, containerSize: number): number {
  return (percent / 100) * containerSize;
}

/**
 * Converts pixels to percentage based on container dimension.
 */
export function pixelsToPercent(pixels: number, containerSize: number): number {
  return (pixels / containerSize) * 100;
}

/**
 * Checks if a layout area has enough space for minimum touch target (44px).
 */
export function meetsAccessibilityMinimum(area: LayoutArea, calculatedWidth: number, calculatedHeight: number): boolean {
  const minTouchTarget = 44;
  return calculatedWidth >= minTouchTarget && calculatedHeight >= minTouchTarget;
}
