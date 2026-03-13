import type { CostComponent } from '../lib/types';

interface CostComponentPreviewProps {
  component: CostComponent;
}

export function CostComponentPreview({ component }: CostComponentPreviewProps) {
  const getText = (): string => {
    switch (component.type) {
      case 'number':
        return `${component.value}`;
      
      case 'nTuple':
        return `${component.n}x beliebig (Wert ${component.value})`;
      
      case 'evenTuple':
        return `${component.n}x gerade Zahl`;
      
      case 'oddTuple':
        return `${component.n}x ungerade Zahl`;
      
      case 'sumTuple':
        return `${component.n}-Tupel mit Summe ${component.sum}`;
      
      case 'sumAnyTuple':
        return `N-Tupel mit Summe ${component.sum}`;
      
      case 'run':
        return `${component.length}-Reihe`;
      
      case 'diamond':
        return 'Diamant';
      
      case 'drillingChoice':
        return `Drilling (3x ${component.value1} ODER 3x ${component.value2})`;
      
      default:
        return 'Unbekannter Baustein';
    }
  };

  return (
    <span className="inline-block px-3 py-1 bg-muted text-muted-foreground rounded text-sm">
      {getText()}
    </span>
  );
}
