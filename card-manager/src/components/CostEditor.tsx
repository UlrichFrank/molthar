import type { Cost } from '../lib/types';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { COST_TYPES } from '../lib/constants';

interface CostEditorProps {
  cost: Cost;
  onUpdate: (cost: Cost) => void;
}

export function CostEditor({ cost, onUpdate }: CostEditorProps) {
  const costInfo = COST_TYPES.find(c => c.type === cost.type);

  const handleTypeChange = (type: Cost['type']) => {
    const newCost: Cost = { type };
    switch (type) {
      case 'identicalValues':
        newCost.count = 2;
        break;
      case 'multipleIdenticalValues':
        newCost.counts = [2, 2];
        newCost.specificValues = [null, null];
        break;
      case 'exactValues':
        newCost.expected = [1, 2, 3];
        break;
      case 'sum':
        newCost.target = 10;
        break;
      case 'run':
        newCost.length = 3;
        break;
      case 'allEven':
      case 'allOdd':
        newCost.count = 3;
        break;
    }
    onUpdate(newCost);
  };

  const updateField = (field: string, value: any) => {
    onUpdate({ ...cost, [field]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Kostentyp
        </label>
        <Select value={cost.type} onValueChange={(value) => handleTypeChange(value as Cost['type'])}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {COST_TYPES.map((t) => (
              <SelectItem key={t.type} value={t.type}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">{costInfo?.description}</p>
      </div>

      {/* Dynamic fields based on cost type */}
      {cost.type === 'identicalValues' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Anzahl
            </label>
            <Input
              type="number"
              min={1}
              value={cost.count || 2}
              onChange={(e) => updateField('count', parseInt(e.target.value) || 2)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Wert (1-8, optional)
            </label>
            <Input
              type="number"
              min={0}
              max={8}
              value={cost.specificValue || ''}
              onChange={(e) => updateField('specificValue', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Leer = beliebig"
            />
          </div>
        </div>
      )}

      {cost.type === 'sum' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Zielsumme
            </label>
            <Input
              type="number"
              min={1}
              value={cost.target || 10}
              onChange={(e) => updateField('target', parseInt(e.target.value) || 10)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Kartenanzahl (optional)
            </label>
            <Input
              type="number"
              min={1}
              value={cost.cardCount || ''}
              onChange={(e) => updateField('cardCount', e.target.value ? parseInt(e.target.value) : null)}
              placeholder="Leer = beliebig"
            />
          </div>
        </div>
      )}

      {cost.type === 'run' && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Reihelänge
          </label>
          <Input
            type="number"
            min={2}
            value={cost.length || 3}
            onChange={(e) => updateField('length', parseInt(e.target.value) || 3)}
          />
        </div>
      )}

      {(cost.type === 'allEven' || cost.type === 'allOdd') && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Anzahl
          </label>
          <Input
            type="number"
            min={1}
            value={cost.count || 3}
            onChange={(e) => updateField('count', parseInt(e.target.value) || 3)}
          />
        </div>
      )}

      {cost.type === 'exactValues' && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Werte (komma-getrennt, z.B. 1,2,3)
          </label>
          <Input
            type="text"
            value={cost.expected?.join(',') || ''}
            onChange={(e) => {
              const values = e.target.value
                .split(',')
                .map(v => parseInt(v.trim()))
                .filter(v => !isNaN(v) && v >= 1 && v <= 8);
              updateField('expected', values);
            }}
          />
        </div>
      )}

      {cost.type === 'multipleIdenticalValues' && (
        <>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Anzahlen (komma-getrennt, z.B. 2,2)
            </label>
            <Input
              type="text"
              value={cost.counts?.join(',') || ''}
              onChange={(e) => {
                const counts = e.target.value
                  .split(',')
                  .map(v => parseInt(v.trim()))
                  .filter(v => !isNaN(v) && v >= 1);
                updateField('counts', counts);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Werte (komma-getrennt, 0 = beliebig, z.B. 0,4)
            </label>
            <Input
              type="text"
              value={cost.specificValues?.map(v => v || 0).join(',') || ''}
              onChange={(e) => {
                const values = e.target.value
                  .split(',')
                  .map(v => {
                    const n = parseInt(v.trim());
                    return (isNaN(n) || n === 0) ? null : n;
                  });
                updateField('specificValues', values);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
