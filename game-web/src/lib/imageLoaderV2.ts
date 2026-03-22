/**
 * Image Loader V2 - Using Vite's import.meta.glob
 * Dynamically imports all images to ensure correct paths
 */

import { getAllCards } from '@portale-von-molthar/shared';

const imageCache = new Map<string, HTMLImageElement>();

/**
 * Encode space as %20 in URLs
 */
function encodeImagePath(filename: string): string {
  return `/assets/${encodeURIComponent(filename)}`;
}

/**
 * Load a single image
 */
export async function loadImage(filename: string): Promise<HTMLImageElement> {
  const key = encodeImagePath(filename);
  
  // Return from cache if already loaded
  if (imageCache.has(key)) {
    return imageCache.get(key)!;
  }

  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      imageCache.set(key, img);
      resolve(img);
    };
    img.onerror = () => {
      console.error(`Failed to load image: ${filename}`);
      reject(new Error(`Failed to load image: ${filename}`));
    };
    img.src = key;
  });
}

/**
 * Get cached image
 */
export function getImage(filename: string): HTMLImageElement | null {
  const key = encodeImagePath(filename);
  return imageCache.get(key) || null;
}

/**
 * Calculate scaled dimensions maintaining aspect ratio
 * Fills the maximum space without distortion (letterbox style)
 */
export function getScaledDimensions(
  img: HTMLImageElement | null,
  maxW: number,
  maxH: number
): { w: number; h: number } {
  // No image - return max dimensions
  if (!img || img.width === 0 || img.height === 0) {
    return { w: maxW, h: maxH };
  }

  const imageAspect = img.width / img.height;
  const containerAspect = maxW / maxH;

  // Image is wider than container - fit width
  if (imageAspect > containerAspect) {
    return { w: maxW, h: maxW / imageAspect };
  }
  // Image is taller than container - fit height
  else {
    return { w: maxH * imageAspect, h: maxH };
  }
}

/**
 * Preload all card images
 */
export async function preloadAllImages(): Promise<void> {
  // Static UI elements
  const staticFilenames = [
    // Game board backgrounds (preload first so they appear quickly)
    'Spielflaeche.png',
    'Auslage.png',
    'Kleiderschrank Portal.png',
    'Schriftrolle.png',
    
    // Opponent portals
    'Gegner Portal2.png',
    'Gegner Portal3.png',
    'Gegner Portal4.png',
    'Gegner Portal5.png',

    // Pearl cards
    'Perlenkarte Hinten.jpeg',
    'Perlenkarte1.jpeg',
    'Perlenkarte2.jpeg',
    'Perlenkarte3.jpeg',
    'Perlenkarte4.jpeg',
    'Perlenkarte5.jpeg',
    'Perlenkarte6.jpeg',
    'Perlenkarte7.jpeg',
    'Perlenkarte8.jpeg',

    // Portal images
    'Portal1.jpeg',
    'Portal2.jpeg',
    'Portal3.jpeg',
    'Portal4.jpeg',
    'Portal5.jpeg',
  ];

  // Dynamically load character card images from cards database
  const characterCardImages = new Set<string>();
  characterCardImages.add('Charakterkarte Hinten.jpeg'); // Back of card
  
  try {
    const allCards = getAllCards();
    allCards.forEach(card => {
      if (card.imageName) {
        characterCardImages.add(card.imageName);
      }
    });
  } catch (err) {
    console.warn('Failed to load character cards from database:', err);
    // Fallback to hardcoded list if database fails
    for (let i = 1; i <= 58; i++) {
      characterCardImages.add(`Charakterkarte${i}.jpeg`);
    }
  }

  const filenames = [...staticFilenames, ...Array.from(characterCardImages)];
  
  const promises = filenames.map((filename) => 
    loadImage(filename)
      .catch((err) => {
        console.warn(`Warning: Failed to preload image: ${filename}`);
        // Continue loading other images even if one fails
      })
  );

  await Promise.all(promises);
}

/**
 * Draw image on canvas with fallback to placeholder
 * @param rotation - Rotation in degrees (0, 90, 180, 270)
 */
export function drawImageOrFallback(
  ctx: CanvasRenderingContext2D,
  filename: string,
  x: number,
  y: number,
  w: number,
  h: number,
  label?: string,
  rotation: number = 0
) {
  const img = getImage(filename);

  if (img) {
    // Image loaded - calculate scaled dimensions maintaining aspect ratio
    const { w: scaledW, h: scaledH } = getScaledDimensions(img, w, h);
    
    // Center scaled image in the allocated space
    const offsetX = x + (w - scaledW) / 2;
    const offsetY = y + (h - scaledH) / 2;
    
    try {
      if (rotation !== 0) {
        ctx.save();
        const rad = (rotation * Math.PI) / 180;
        // Translate to center of zone, rotate, then draw image centered
        ctx.translate(offsetX + scaledW / 2, offsetY + scaledH / 2);
        ctx.rotate(rad);
        ctx.drawImage(img, -scaledW / 2, -scaledH / 2, scaledW, scaledH);
        ctx.restore();
      } else {
        ctx.drawImage(img, offsetX, offsetY, scaledW, scaledH);
      }
    } catch (e) {
      console.error(`Failed to draw image ${filename}:`, e);
      drawPlaceholder();
    }
  } else {
    // Fallback - draw placeholder box
    drawPlaceholder();
  }

  function drawPlaceholder() {
    // Gray background for missing images
    ctx.fillStyle = '#2d3748';
    ctx.fillRect(x, y, w, h);
    
    // Dark border
    ctx.strokeStyle = '#4a5568';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Draw label or "?" if image not found
    const displayLabel = label || '?';
    ctx.fillStyle = '#a0aec0';
    ctx.font = `bold ${Math.max(8, w / 6)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayLabel.substring(0, 10), x + w / 2, y + h / 2 - 5);
    
    // Add small indicator that image is missing
    if (!img) {
      ctx.fillStyle = '#fc8181';
      ctx.font = `bold ${Math.max(6, w / 8)}px Arial`;
      ctx.fillText('❌', x + w / 2, y + h / 2 + 8);
    }
  }
}
