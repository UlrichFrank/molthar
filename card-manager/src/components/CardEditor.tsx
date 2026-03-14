import type { CharacterCard } from '../lib/types';
import { Trash2 } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ImageManager } from './ImageManager';
import { CostBuilder } from './CostBuilder';
import { AbilityEditor } from './AbilityEditor';

interface CardEditorProps {
  card: CharacterCard | null;
  onUpdate: (id: string, updates: Partial<CharacterCard>) => void;
  onDelete: (id: string) => void;
}

export function CardEditor({ card, onUpdate, onDelete }: CardEditorProps) {
  if (!card) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p>Wähle einen Charakter aus oder erstelle einen neuen</p>
      </div>
    );
  }

  const handleNameChange = (name: string) => {
    onUpdate(card.id, { name });
  };

  const handleImageNameChange = (imageName: string) => {
    onUpdate(card.id, { imageName });
  };

  const handlePowerPointsChange = (powerPoints: number) => {
    onUpdate(card.id, { powerPoints });
  };

  const handleDiamondsChange = (diamondsReward: number) => {
    onUpdate(card.id, { diamondsReward });
  };

  return (
    <div className="flex-1 bg-background border-l border-border overflow-y-auto">
      <div className="p-6 flex gap-6">
        {/* Left column: Metadata, Costs, Abilities */}
        <div className="flex-1 max-w-2xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">{card.name}</h2>
            <Button
              onClick={() => {
                if (confirm(`"${card.name}" wirklich löschen?`)) {
                  onDelete(card.id);
                }
              }}
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Löschen"
            >
              <Trash2 size={20} />
            </Button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Name
              </label>
              <Input
                type="text"
                value={card.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Machtpunkte (0-5)
              </label>
              <Input
                type="number"
                min={0}
                max={5}
                value={card.powerPoints}
                onChange={(e) => handlePowerPointsChange(Math.max(0, Math.min(5, parseInt(e.target.value) || 0)))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Diamanten-Belohnung (0-3)
              </label>
              <Input
                type="number"
                min={0}
                max={3}
                value={card.diamondsReward}
                onChange={(e) => handleDiamondsChange(Math.max(0, Math.min(3, parseInt(e.target.value) || 0)))}
              />
            </div>
          </div>

          {/* Cost Builder */}
          <div className="mb-6 pb-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4">Kosten</h3>
            <CostBuilder
              cost={card.cost}
              onUpdate={(cost) => onUpdate(card.id, { cost })}
            />
          </div>

          {/* Ability Editor */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Spezialfähigkeit</h3>
            <AbilityEditor
              ability={card.ability}
              onUpdate={(ability) => onUpdate(card.id, { ability })}
            />
          </div>
        </div>

        {/* Right column: Image */}
        <div className="flex-1 min-w-96 sticky top-6 h-fit">
          <ImageManager
            imageName={card.imageName}
            onImageUpload={handleImageNameChange}
          />
        </div>
      </div>
    </div>
  );
}
