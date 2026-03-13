// Image loader utilities
export async function loadAvailableImages(): Promise<string[]> {
  try {
    const response = await fetch('/assets/');
    const html = await response.text();
    
    const imageRegex = /href="([^"]+\.(jpg|jpeg|png|webp))"/gi;
    const images: Set<string> = new Set();
    let match;
    
    while ((match = imageRegex.exec(html)) !== null) {
      images.add(match[1]);
    }
    
    return Array.from(images).sort();
  } catch (error) {
    console.error('Failed to load images from /assets:', error);
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
