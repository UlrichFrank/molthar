import type { CharacterCard, PearlCard } from '@portale-von-molthar/shared';

/** Task 4.5: shared `<img src>` conventions, matching the existing dialog components. */
export function pearlImageSrc(card: PearlCard): string {
  if (card.isJoker) return '/assets/PerlenkarteJoker.png';
  return `/assets/Perlenkarte${card.value}${card.hasRefreshSymbol ? '-neu' : ''}.png`;
}

export const PEARL_BACK_IMAGE_SRC = '/assets/Perlenkarte Hinten.png';

export function characterImageSrc(card: CharacterCard): string {
  return `/assets/${encodeURIComponent(card.imageName)}`;
}

export const CHARACTER_BACK_IMAGE_SRC = `/assets/${encodeURIComponent('Charakterkarte Hinten.png')}`;
