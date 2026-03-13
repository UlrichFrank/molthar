import type { Cost, CostComponent } from './types';

/**
 * Convert a single cost component to a human-readable text description
 */
export function costComponentToText(component: CostComponent): string {
  switch (component.type) {
    case 'number':
      return `${component.value}`;
    case 'nTuple':
      return `${component.n}x beliebig`;
    case 'evenTuple':
      return `${component.n}x Gerade`;
    case 'oddTuple':
      return `${component.n}x Ungerade`;
    case 'sumTuple':
      return `${component.n}x Summe ${component.sum}`;
    case 'sumAnyTuple':
      return `Summe ${component.sum}`;
    case 'run':
      return `${component.length}-Reihe`;
    case 'diamond':
      return `Diamant`;
    case 'drillingChoice':
      return `Drilling (${component.value1} oder ${component.value2})`;
    default:
      return 'Unbekannt';
  }
}

/**
 * Convert full cost array to human-readable description
 */
export function costToText(cost: Cost): string {
  if (cost.length === 0) {
    return 'Kostenlos';
  }
  if (cost.length === 1) {
    return costComponentToText(cost[0]);
  }
  return cost.map(c => costComponentToText(c)).join(' + ');
}

/**
 * Validate a cost component
 */
export function validateCostComponent(component: CostComponent): { valid: boolean; error?: string } {
  switch (component.type) {
    case 'number':
      if (![1, 2, 3, 4, 5, 6, 7, 8].includes(component.value)) {
        return { valid: false, error: 'Zahl muss zwischen 1-8 sein' };
      }
      break;
    case 'nTuple':
      if (component.n < 1) return { valid: false, error: 'n muss mindestens 1 sein' };
      break;
    case 'evenTuple':
    case 'oddTuple':
      if (component.n < 1) return { valid: false, error: 'n muss mindestens 1 sein' };
      break;
    case 'sumTuple':
      if (component.n < 1) return { valid: false, error: 'n muss mindestens 1 sein' };
      if (component.sum < 1) return { valid: false, error: 'Summe muss mindestens 1 sein' };
      break;
    case 'sumAnyTuple':
      if (component.sum < 1) return { valid: false, error: 'Summe muss mindestens 1 sein' };
      break;
    case 'run':
      if (component.length < 1) return { valid: false, error: 'Länge muss mindestens 1 sein' };
      break;
    case 'drillingChoice':
      if (![1, 2, 3, 4, 5, 6, 7, 8].includes(component.value1)) {
        return { valid: false, error: 'value1 muss zwischen 1-8 sein' };
      }
      if (![1, 2, 3, 4, 5, 6, 7, 8].includes(component.value2)) {
        return { valid: false, error: 'value2 muss zwischen 1-8 sein' };
      }
      break;
  }
  return { valid: true };
}

/**
 * Validate full cost array
 */
export function validateCost(cost: Cost): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (cost.length === 0) {
    errors.push('Mindestens ein Baustein erforderlich');
  }
  if (cost.length > 6) {
    errors.push('Maximal 6 Bausteine erlaubt');
  }

  cost.forEach((component, index) => {
    const validation = validateCostComponent(component);
    if (!validation.valid) {
      errors.push(`Baustein ${index + 1}: ${validation.error}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
