import { Upload, X } from 'lucide-react';
import { useRef } from 'react';
import { Button } from './ui/button';

interface ImageManagerProps {
  imageName: string;
  onImageUpload: (imageName: string) => void;
}

export function ImageManager({ imageName, onImageUpload }: ImageManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOverRef = useRef(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragOverRef.current = true;
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragOverRef.current = false;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragOverRef.current = false;

    const files = Array.from(e.dataTransfer.files).filter(file =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    );

    if (files.length > 0) {
      const file = files[0];
      onImageUpload(file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file.name);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Kartenbild
        </label>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center transition ${
            dragOverRef.current
              ? 'border-primary bg-primary/5'
              : 'border-border bg-background'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          {imageName ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">{imageName}</p>
              <div className="flex justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={16} className="mr-1" />
                  Ändern
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onImageUpload('')}
                >
                  <X size={16} className="mr-1" />
                  Entfernen
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Bild hier ablegen oder klicken
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG oder WebP (max. mehrere MB)
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Datei auswählen
              </Button>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Hinweis: Bildnamen werden gespeichert. Legen Sie Bilder in den Assets-Ordner der Swift-App.
        </p>
      </div>

      {imageName && (
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Vorschau
          </label>
          <div className="bg-muted rounded-lg p-4 text-center min-h-48 flex items-center justify-center">
            <div className="text-muted-foreground text-sm">
              <p>Bildvorschau wird hier angezeigt</p>
              <p className="mt-2 text-xs">(Datei-Pfade können nicht aus dem Browser aufgelöst werden)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
