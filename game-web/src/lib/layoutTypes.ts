/**
 * Layout configuration types for responsive game board.
 * Supports percentage-based sizing, absolute constraints, aspect ratios,
 * and flexible positioning for all game board areas.
 */

export type ContentMode = 'contain' | 'cover' | 'fill';
export type VerticalPosition = 'top' | 'center' | 'bottom';
export type HorizontalPosition = 'left' | 'center' | 'right';

/**
 * Constraints for sizing a layout area with min/max bounds.
 */
export interface SizeConstraints {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  aspectRatio?: number; // width:height ratio
}

/**
 * Configuration for a single board area (hand, deck, face-up cards, etc.)
 */
export interface LayoutArea {
  id: string;
  name: string;

  // Percentage-based sizing (0-100)
  widthPercent?: number;
  heightPercent?: number;

  // Absolute sizing in pixels
  width?: number;
  height?: number;

  // Constraints and aspect ratio
  constraints: SizeConstraints;

  // Positioning
  verticalPosition: VerticalPosition;
  horizontalPosition: HorizontalPosition;

  // Image display mode
  contentMode: ContentMode;
}

/**
 * A complete layout preset for a specific orientation/device size.
 */
export interface LayoutPreset {
  id: string;
  name: string;
  orientation: 'portrait' | 'landscape';
  breakpoint?: 'mobile' | 'tablet' | 'desktop'; // Optional categorization
  areas: Record<string, LayoutArea>;
  createdAt: number;
  isDefault: boolean;
}

/**
 * Calculated dimensions for a layout area after applying all constraints.
 */
export interface CalculatedAreaSize {
  width: number;
  height: number;
  x: number;
  y: number;
}

/**
 * Layout calculation result for the entire board.
 */
export interface CalculatedLayout {
  containerWidth: number;
  containerHeight: number;
  areas: Record<string, CalculatedAreaSize>;
}
