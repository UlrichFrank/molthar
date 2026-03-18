/**
 * Zoom Compensation System
 * 
 * Detects browser zoom level and adjusts card scaling to maintain constant size.
 * - Fenster-Resize: Karten skalieren (responsive)
 * - Browser-Zoom: Karten bleiben gleich groß
 */

export function initZoomCompensation(): void {
  // Set initial zoom scale
  updateZoomScale();

  // Update on window resize (cards scale)
  window.addEventListener('resize', updateZoomScale);

  // Some browsers fire zoom on wheel events
  document.addEventListener('wheel', (e) => {
    if (e.ctrlKey) {
      // Zoom detected, will be updated in the next paint frame
      requestAnimationFrame(updateZoomScale);
    }
  });

  // Keyboard zoom (Ctrl+/Ctrl-/Ctrl0)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '0')) {
      requestAnimationFrame(updateZoomScale);
    }
  });

  // Periodically check zoom level (some browsers don't fire events reliably)
  setInterval(updateZoomScale, 500);
}

function updateZoomScale(): void {
  // Calculate zoom level
  const zoomLevel = detectZoomLevel();

  // Inverse scale: if zoom is 1.2 (120%), we scale down to 1/1.2 = 0.833
  const inverseScale = 1 / zoomLevel;

  // Set CSS variable
  document.documentElement.style.setProperty('--zoom-scale', inverseScale.toString());
}

function detectZoomLevel(): number {
  // Method 1: Use devicePixelRatio (most reliable)
  // This reflects both screen DPI and browser zoom
  const baseDevicePixelRatio = 1; // Standard baseline
  const currentDevicePixelRatio = window.devicePixelRatio || 1;
  
  // On most systems, zoom doesn't change devicePixelRatio
  // Instead, we calculate it from element measurements

  // Method 2: Create a test element and measure it
  const testEl = document.createElement('div');
  testEl.style.width = '1in'; // 96px at 100% zoom
  testEl.style.position = 'fixed';
  testEl.style.left = '0';
  testEl.style.visibility = 'hidden';
  
  document.body.appendChild(testEl);
  const measuredWidth = testEl.offsetWidth;
  document.body.removeChild(testEl);

  // 1 inch = 96px at 100% zoom
  // If zoom is 120%, 1 inch = 115.2px
  const zoomLevel = measuredWidth / 96;

  return zoomLevel;
}
