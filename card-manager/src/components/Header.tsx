import { Download, Upload, Plus, Image, Trash2 } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  cardCount: number;
  onExport: () => void;
  onImport: () => void;
  onAddNew: () => void;
  onCreateFromImages: () => void;
  onDeleteAll: () => void;
}

export function Header({ cardCount, onExport, onImport, onAddNew, onCreateFromImages, onDeleteAll }: HeaderProps) {
  return (
    <header className="bg-background border-b border-border shadow-sm">
      <div className="max-w-full px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Molthar Card Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">{cardCount} Charaktere</p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={onAddNew}
            className="gap-2"
          >
            <Plus size={18} />
            Neuer Charakter
          </Button>

          <Button
            onClick={onCreateFromImages}
            variant="outline"
            className="gap-2"
            title="Erstelle automatisch Karten für alle unreferenzierten CharakterKarte*.png Bilder"
          >
            <Image size={18} />
            Aus Bildern
          </Button>

          <Button
            onClick={onImport}
            variant="outline"
            className="gap-2"
          >
            <Upload size={18} />
            Importieren
          </Button>

          <Button
            onClick={onExport}
            className="gap-2"
          >
            <Download size={18} />
            Exportieren
          </Button>

          <Button
            onClick={onDeleteAll}
            variant="destructive"
            size="icon"
            title="Löscht ALLE Charakterkarten"
            disabled={cardCount === 0}
          >
            <Trash2 size={18} />
          </Button>
        </div>
      </div>
    </header>
  );
}
