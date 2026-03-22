import { useState } from 'react';
import type { Cost, CostComponent } from '../lib/types';
import { Button } from './ui/button';
import { CostComponentPreview } from './CostComponentPreview';
import { CostComponentEditor } from './CostComponentEditor';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface CostBuilderProps {
  cost: Cost;
  onUpdate: (cost: Cost) => void;
}

export function CostBuilder({ cost, onUpdate }: CostBuilderProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddComponent = (component: CostComponent) => {
    if (cost.length < 6) {
      onUpdate([...cost, component]);
    }
    setShowEditor(false);
  };

  const handleEditComponent = (component: CostComponent) => {
    if (editingIndex !== null) {
      const newCost = [...cost];
      newCost[editingIndex] = component;
      onUpdate(newCost);
      setEditingIndex(null);
    }
  };

  const handleDeleteComponent = (index: number) => {
    onUpdate(cost.filter((_, i) => i !== index));
  };

  const canAddMore = cost.length < 6;

  return (
    <div className="space-y-4">
      {/* Cost components list */}
      {cost.length > 0 ? (
        <div className="space-y-2">
          {cost.map((component, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-muted p-3 rounded border border-border"
            >
              <div className="flex-1">
                <CostComponentPreview component={component} />
              </div>
              <div className="flex gap-2 ml-4">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setEditingIndex(index)}
                  className="h-8 w-8"
                  title="Bearbeiten"
                >
                  <Edit2 size={16} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => handleDeleteComponent(index)}
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Löschen"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">
          Keine Kostenbausteine hinzugefügt
        </p>
      )}

      {/* Add button */}
      {canAddMore && (
        <Button
          onClick={() => {
            setEditingIndex(null);
            setShowEditor(true);
          }}
          variant="outline"
          className="w-full"
        >
          <Plus size={16} className="mr-2" />
          Baustein hinzufügen ({cost.length}/6)
        </Button>
      )}

      {cost.length >= 6 && (
        <p className="text-xs text-muted-foreground text-center">
          Maximum von 6 Bausteinen erreicht
        </p>
      )}

      {/* Editor modal */}
      {showEditor && (
        <CostComponentEditor
          component={undefined}
          onSave={handleAddComponent}
          onCancel={() => setShowEditor(false)}
        />
      )}

      {editingIndex !== null && (
        <CostComponentEditor
          component={cost[editingIndex]}
          onSave={handleEditComponent}
          onCancel={() => setEditingIndex(null)}
        />
      )}

      {/* Cost preview text */}
      {cost.length > 0 && (
        <div className="bg-muted/50 p-3 rounded border border-border text-sm">
          <p className="text-muted-foreground mb-1">Gesamtkosten:</p>
          <p className="text-foreground font-medium">
            {cost
              .map((c) => {
                const getText = (): string => {
                  switch (c.type) {
                    case 'number':
                      return `${c.value}`;
                    case 'nTuple':
                      return `${c.n}x gleiche Zahlen`;
                    case 'evenTuple':
                      return `${c.n}x gerade`;
                    case 'oddTuple':
                      return `${c.n}x ungerade`;
                    case 'sumTuple':
                      return `${c.n} Karten (Σ${c.sum})`;
                    case 'sumAnyTuple':
                      return `N Karten (Σ${c.sum})`;
                    case 'run':
                      return `${c.length}-Reihe`;
                    case 'diamond':
                      return '◆';
                    case 'drillingChoice':
                      return `3×${c.value1}|3×${c.value2}`;
                    default:
                      return '?';
                  }
                };
                return getText();
              })
              .join(' + ')}
          </p>
        </div>
      )}
    </div>
  );
}
