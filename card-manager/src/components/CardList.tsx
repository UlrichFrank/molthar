import type { CharacterCard } from '../lib/types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ABILITY_INFO } from '../lib/constants';
import { naturalSort } from '../lib/utils';

interface CardListProps {
  cards: CharacterCard[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function CardList({
  cards,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
}: CardListProps) {
  const sortedCards = [...cards].sort((a, b) => naturalSort(a.name, b.name));

  return (
    <aside className="flex flex-col w-80 bg-background border-r border-border shadow-sm">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <Input
          type="text"
          placeholder="Charakter suchen..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Cards List */}
      <ul className="flex-1 overflow-y-auto">
        {sortedCards.length === 0 ? (
          <li className="p-4 text-center text-muted-foreground text-sm">
            {searchQuery ? 'Keine Treffer' : 'Keine Charaktere'}
          </li>
        ) : (
          sortedCards.map((card) => (
            <li key={card.id} className="border-b border-border last:border-b-0">
              <Button
                onClick={() => onSelect(card.id)}
                variant={selectedId === card.id ? 'default' : 'ghost'}
                className={`w-full justify-start text-left h-auto py-3 px-4 rounded-none flex-col items-start ${
                  selectedId === card.id ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                <p className="font-medium truncate w-full">{card.name}</p>
                <p className="text-xs mt-1 opacity-75">
                  {card.powerPoints} PP
                  {card.ability.type !== 'none' && ` • ${ABILITY_INFO[card.ability.type].label}`}
                </p>
              </Button>
            </li>
          ))
        )}
      </ul>
    </aside>
  );
}
