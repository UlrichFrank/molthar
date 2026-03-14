import { useState } from 'react';
import type { CostComponent } from '../lib/types';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Button } from './ui/button';

const COMPONENT_TYPES = [
  { value: 'number', label: 'Einzelne Zahl (1-8)' },
  { value: 'nTuple', label: 'N-Tupel gleicher Zahlen (nur n einstellbar)' },
  { value: 'evenTuple', label: 'N-Tupel gerade Zahlen' },
  { value: 'oddTuple', label: 'N-Tupel ungerade Zahlen' },
  { value: 'sumTuple', label: 'N-Tupel mit Gesamtsumme' },
  { value: 'sumAnyTuple', label: 'Beliebig-Tupel mit Summe' },
  { value: 'run', label: 'Zahlenreihe (z.B. 3-Reihe)' },
  { value: 'diamond', label: 'Diamant' },
  { value: 'drillingChoice', label: 'Drilling (3x Wert1 ODER 3x Wert2)' },
];

interface CostComponentEditorProps {
  component?: CostComponent;
  onSave: (component: CostComponent) => void;
  onCancel: () => void;
}

export function CostComponentEditor({
  component,
  onSave,
  onCancel,
}: CostComponentEditorProps) {
  const [type, setType] = useState<CostComponent['type']>(
    component?.type || 'number'
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get initial values based on component or defaults
  const getInitialValue = (field: string, defaultValue: any = ''): any => {
    if (!component) return defaultValue;
    return (component as any)[field] ?? defaultValue;
  };

  const [values, setValues] = useState<Record<string, any>>({
    value: getInitialValue('value', 1),
    n: getInitialValue('n', 2),
    sum: getInitialValue('sum', 10),
    length: getInitialValue('length', 3),
    value1: getInitialValue('value1', 1),
    value2: getInitialValue('value2', 2),
  });

  const handleValueChange = (field: string, value: any) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const validateAndSave = () => {
    const newErrors: Record<string, string> = {};

    switch (type) {
      case 'number': {
        const num = parseInt(values.value);
        if (isNaN(num) || num < 1 || num > 8) {
          newErrors.value = 'Wert muss zwischen 1 und 8 sein';
        } else {
          onSave({ type: 'number', value: num as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 });
        }
        break;
      }

      case 'nTuple': {
        const n = parseInt(values.n);
        if (isNaN(n) || n < 1) {
          newErrors.n = 'N muss eine positive Zahl sein';
        } else {
          onSave({ type: 'nTuple', n });
        }
        break;
      }

      case 'evenTuple': {
        const n = parseInt(values.n);
        if (isNaN(n) || n < 1) {
          newErrors.n = 'N muss eine positive Zahl sein';
        } else {
          onSave({ type: 'evenTuple', n });
        }
        break;
      }

      case 'oddTuple': {
        const n = parseInt(values.n);
        if (isNaN(n) || n < 1) {
          newErrors.n = 'N muss eine positive Zahl sein';
        } else {
          onSave({ type: 'oddTuple', n });
        }
        break;
      }

      case 'sumTuple': {
        const n = parseInt(values.n);
        const sum = parseInt(values.sum);
        if (isNaN(n) || n < 1) {
          newErrors.n = 'N muss eine positive Zahl sein';
        }
        if (isNaN(sum) || sum < 1) {
          newErrors.sum = 'Summe muss eine positive Zahl sein';
        }
        if (Object.keys(newErrors).length === 0) {
          onSave({ type: 'sumTuple', n, sum });
        }
        break;
      }

      case 'sumAnyTuple': {
        const sum = parseInt(values.sum);
        if (isNaN(sum) || sum < 1) {
          newErrors.sum = 'Summe muss eine positive Zahl sein';
        } else {
          onSave({ type: 'sumAnyTuple', sum });
        }
        break;
      }

      case 'run': {
        const length = parseInt(values.length);
        if (isNaN(length) || length < 2) {
          newErrors.length = 'Länge muss mindestens 2 sein';
        } else {
          onSave({ type: 'run', length });
        }
        break;
      }

      case 'diamond': {
        onSave({ type: 'diamond' });
        break;
      }

      case 'drillingChoice': {
        const v1 = parseInt(values.value1);
        const v2 = parseInt(values.value2);
        if (isNaN(v1) || v1 < 1 || v1 > 8) {
          newErrors.value1 = 'Wert 1 muss zwischen 1 und 8 sein';
        }
        if (isNaN(v2) || v2 < 1 || v2 > 8) {
          newErrors.value2 = 'Wert 2 muss zwischen 1 und 8 sein';
        }
        if (v1 === v2) {
          newErrors.value2 = 'Werte müssen unterschiedlich sein';
        }
        if (Object.keys(newErrors).length === 0) {
          onSave({ type: 'drillingChoice', value1: v1, value2: v2 });
        }
        break;
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background border border-border rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold text-foreground mb-4">
          {component ? 'Baustein bearbeiten' : 'Neuer Baustein'}
        </h2>

        <div className="space-y-4">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Baustein-Typ
            </label>
            <Select value={type} onValueChange={(v) => setType(v as CostComponent['type'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COMPONENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type-specific fields */}
          {type === 'number' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Zahl (1-8)
              </label>
              <Input
                type="number"
                min={1}
                max={8}
                value={values.value}
                onChange={(e) => handleValueChange('value', e.target.value)}
              />
              {errors.value && <p className="text-xs text-destructive mt-1">{errors.value}</p>}
            </div>
          )}

          {type === 'nTuple' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Anzahl (N)
              </label>
              <Input
                type="number"
                min={1}
                value={values.n}
                onChange={(e) => handleValueChange('n', e.target.value)}
              />
              {errors.n && <p className="text-xs text-destructive mt-1">{errors.n}</p>}
            </div>
          )}

          {(type === 'evenTuple' || type === 'oddTuple') && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Anzahl (N)
              </label>
              <Input
                type="number"
                min={1}
                value={values.n}
                onChange={(e) => handleValueChange('n', e.target.value)}
              />
              {errors.n && <p className="text-xs text-destructive mt-1">{errors.n}</p>}
            </div>
          )}

          {type === 'sumTuple' && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Anzahl (N)
                </label>
                <Input
                  type="number"
                  min={1}
                  value={values.n}
                  onChange={(e) => handleValueChange('n', e.target.value)}
                />
                {errors.n && <p className="text-xs text-destructive mt-1">{errors.n}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Summe
                </label>
                <Input
                  type="number"
                  min={1}
                  value={values.sum}
                  onChange={(e) => handleValueChange('sum', e.target.value)}
                />
                {errors.sum && <p className="text-xs text-destructive mt-1">{errors.sum}</p>}
              </div>
            </>
          )}

          {type === 'sumAnyTuple' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Summe
              </label>
              <Input
                type="number"
                min={1}
                value={values.sum}
                onChange={(e) => handleValueChange('sum', e.target.value)}
              />
              {errors.sum && <p className="text-xs text-destructive mt-1">{errors.sum}</p>}
            </div>
          )}

          {type === 'run' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Länge der Reihe
              </label>
              <Input
                type="number"
                min={2}
                value={values.length}
                onChange={(e) => handleValueChange('length', e.target.value)}
              />
              {errors.length && <p className="text-xs text-destructive mt-1">{errors.length}</p>}
            </div>
          )}

          {type === 'drillingChoice' && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Wert 1 (1-8)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={8}
                  value={values.value1}
                  onChange={(e) => handleValueChange('value1', e.target.value)}
                />
                {errors.value1 && <p className="text-xs text-destructive mt-1">{errors.value1}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Wert 2 (1-8)
                </label>
                <Input
                  type="number"
                  min={1}
                  max={8}
                  value={values.value2}
                  onChange={(e) => handleValueChange('value2', e.target.value)}
                />
                {errors.value2 && <p className="text-xs text-destructive mt-1">{errors.value2}</p>}
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-2 justify-end mt-6">
            <Button variant="outline" onClick={onCancel}>
              Abbrechen
            </Button>
            <Button onClick={validateAndSave}>
              Speichern
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
