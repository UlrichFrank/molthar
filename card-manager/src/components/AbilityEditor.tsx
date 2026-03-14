import type { Ability, AbilityTiming } from '../lib/types';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from './ui/select';
import { ABILITY_INFO, ABILITY_TIMING_INFO } from '../lib/constants';

interface AbilityEditorProps {
  ability: Ability;
  onUpdate: (ability: Ability) => void;
}

export function AbilityEditor({ ability, onUpdate }: AbilityEditorProps) {
  const abilityInfo = ABILITY_INFO[ability.type];
  const timing = ability.timing || 'duringTurn'; // Default to 'duringTurn'

  const handleTypeChange = (type: string) => {
    const newAbility: Ability = { type: type as any, timing };
    if (type === 'providesVirtualPearl' || type === 'numberAddditionalCardActions') {
      newAbility.value = null;
    }
    onUpdate(newAbility);
  };

  const handleTimingChange = (newTiming: string) => {
    onUpdate({ ...ability, timing: newTiming as AbilityTiming });
  };

  // Group abilities by category
  const groupedAbilities = {
    none: [ABILITY_INFO.none],
    red: Object.values(ABILITY_INFO).filter(a => a.category === 'red'),
    blue: Object.values(ABILITY_INFO).filter(a => a.category === 'blue'),
    special: Object.values(ABILITY_INFO).filter(a => a.category === 'special'),
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Fähigkeitstyp
        </label>
        <Select value={ability.type} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {groupedAbilities.none.map((a) => (
                <SelectItem key={a.type} value={a.type}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              {groupedAbilities.red.map((a) => (
                <SelectItem key={a.type} value={a.type}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              {groupedAbilities.blue.map((a) => (
                <SelectItem key={a.type} value={a.type}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectGroup>
            <SelectGroup>
              {groupedAbilities.special.map((a) => (
                <SelectItem key={a.type} value={a.type}>
                  {a.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {abilityInfo && (
          <div className="mt-2 p-3 bg-muted rounded-lg">
            <p className="text-sm text-foreground">{abilityInfo.description}</p>
            {abilityInfo.category !== 'none' && (
              <p className="text-xs text-muted-foreground mt-1">
                Kategorie:{' '}
                <span className={`font-medium ${
                  abilityInfo.category === 'red' ? 'text-red-600' :
                  abilityInfo.category === 'blue' ? 'text-blue-600' :
                  'text-purple-600'
                }`}>
                  {abilityInfo.category === 'red' ? 'Sofort (einmalig)' :
                   abilityInfo.category === 'blue' ? 'Dauerhaft' :
                   'Spezial'}
                </span>
              </p>
            )}
          </div>
        )}
      </div>

      {/* providesVirtualPearl parameters */}
      {ability.type === 'providesVirtualPearl' && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Perlenwert (1-8, leer = "?")
          </label>
          <Input
            type="number"
            min={0}
            max={8}
            value={ability.value || ''}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : null;
              onUpdate({ type: 'providesVirtualPearl', timing, value });
            }}
            placeholder="Leer = wildcard"
          />
          <p className="text-xs text-muted-foreground mt-1">
            0 oder leer = beliebiger Wert
          </p>
        </div>
      )}

      {/* numberAddditionalCardActions parameters */}
      {ability.type === 'numberAddditionalCardActions' && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Kartenwert (1-8)
          </label>
          <Input
            type="number"
            min={1}
            max={8}
            value={ability.value || ''}
            onChange={(e) => {
              const raw = e.target.value;
              const parsed = raw ? parseInt(raw, 10) : null;
              const value = parsed === null ? null : Math.max(1, Math.min(8, parsed));
              onUpdate({ type: 'numberAddditionalCardActions', timing, value });
            }}
            placeholder="Wert 1-8"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Bestimmt den festen Wert der zusaetzlichen Karte.
          </p>
        </div>
      )}

      {/* Timing selection */}
      {ability.type !== 'none' && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Zeitpunkt der Aktivierung
          </label>
          <Select value={timing} onValueChange={handleTimingChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ABILITY_TIMING_INFO).map(([timingKey, timingInfo]) => (
                <SelectItem key={timingKey} value={timingKey}>
                  {timingInfo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {ABILITY_TIMING_INFO[timing] && (
            <p className="text-xs text-muted-foreground mt-1">
              {ABILITY_TIMING_INFO[timing].description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
