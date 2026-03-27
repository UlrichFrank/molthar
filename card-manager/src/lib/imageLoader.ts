// Image loader utilities
import { naturalSort } from './utils';

export async function loadAvailableImages(): Promise<string[]> {
  try {
    // Load image manifest from public folder
    const response = await fetch('/assets-manifest.json');
    const data = await response.json();
    return (data.images || []).sort(naturalSort);
  } catch (error) {
    console.error('Failed to load image manifest:', error);
    return [];
  }
}

export async function loadImageAsDataUrl(filename: string): Promise<string> {
  try {
    const response = await fetch(`/assets/${filename}`);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(`Failed to load image ${filename}:`, error);
    return '';
  }
}

export function getImageUrl(filename: string): string {
  return `/assets/${filename}`;
}

export async function findUnreferencedCharacterImages(existingImageNames: string[]): Promise<string[]> {
  try {
    const allImages = await loadAvailableImages();
    const characterImagePattern = /^Charakterkarte\d+\.png$/i;
    const referencedSet = new Set(existingImageNames);
    
    return allImages
      .filter(image => characterImagePattern.test(image) && !referencedSet.has(image))
      .sort(naturalSort);
  } catch (error) {
    console.error('Error finding unreferenced character images:', error);
    return [];
  }
}
