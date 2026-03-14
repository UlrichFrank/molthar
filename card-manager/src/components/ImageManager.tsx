import { Upload, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { loadAvailableImages, getImageUrl } from '../lib/imageLoader';
import { naturalSort } from '../lib/utils';

interface ImageManagerProps {
  imageName: string;
  onImageUpload: (imageName: string) => void;
}

export function ImageManager({ imageName, onImageUpload }: ImageManagerProps) {
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      try {
        const images = await loadAvailableImages();
        setAvailableImages(images);
      } catch (error) {
        console.error('Error loading images:', error);
        setAvailableImages([]);
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, []);

  const handleImageSelect = (selected: string) => {
    onImageUpload(selected);
  };

  const handleRemoveImage = () => {
    onImageUpload('');
  };

  const imageFiles = availableImages
    .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort(naturalSort);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        Kartenbild
      </label>

      {imageName && (
        <div className="relative border-2 border-dashed rounded-lg p-4 text-center transition w-full aspect-video flex items-center justify-center border-border bg-muted">
          <img
            src={getImageUrl(imageName)}
            alt={imageName}
            className="max-w-full max-h-full object-contain rounded"
          />
        </div>
      )}

      {!imageName && (
        <div className="relative border-2 border-dashed rounded-lg p-4 text-center transition w-full aspect-video flex items-center justify-center border-border bg-muted">
          <div className="text-center">
            <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">Bild auswählen</p>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-muted-foreground text-center py-2">
          Lade Bilder...
        </p>
      ) : (
        <Select value={imageName || ''} onValueChange={handleImageSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Bild auswählen..." />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {imageFiles.length > 0 ? (
              imageFiles.map((file) => (
                <SelectItem key={file} value={file}>
                  {file}
                </SelectItem>
              ))
            ) : (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                Keine Bilder gefunden
              </div>
            )}
          </SelectContent>
        </Select>
      )}

      {imageName && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRemoveImage}
          className="w-full"
        >
          <X size={14} className="mr-2" />
          Entfernen
        </Button>
      )}

      <p className="text-xs text-muted-foreground">
        Bilder automatisch geladen aus /assets
      </p>
    </div>
  );
}
