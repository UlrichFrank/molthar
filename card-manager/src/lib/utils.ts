import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function naturalSort(a: string, b: string): number {
  // Split strings into parts (text and numbers)
  const aParts = a.split(/(\d+)/);
  const bParts = b.split(/(\d+)/);
  
  // Compare each part
  for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
    const aPart = aParts[i];
    const bPart = bParts[i];
    
    // If both are numbers, compare numerically
    if (/^\d+$/.test(aPart) && /^\d+$/.test(bPart)) {
      const diff = parseInt(aPart, 10) - parseInt(bPart, 10);
      if (diff !== 0) return diff;
    } else {
      // Otherwise, compare as strings
      const cmp = aPart.localeCompare(bPart);
      if (cmp !== 0) return cmp;
    }
  }
  
  // If all parts matched, shorter string comes first
  return aParts.length - bParts.length;
}
