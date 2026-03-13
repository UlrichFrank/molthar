import { Upload, X } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { Button } from './ui/button';

interface ImageManagerProps {
  imageName: string;
  onImageUpload: (imageName: string) => void;
}

// Simple in-memory cache for image previews
const imageCache = new Map<string, string>();

export function ImageManager({ imageName, onImageUpload }: ImageManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOverRef = useRef(false);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Load cached preview when imageName changes
  useEffect(() => {
    if (imageName && imageCache.has(imageName)) {
      setImagePreview(imageCache.get(imageName) || '');
    } else {
      setImagePreview('');
    }
  }, [imageName]);

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
      createPreview(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file.name);
      createPreview(file);
    }
  };

  const createPreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      // Cache the preview by filename
      imageCache.set(file.name, dataUrl);
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    if (imageName) {
      imageCache.delete(imageName);
    }
    onImageUpload('');
    setImagePreview('');
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        Kartenbild
      </label>

      {/* Preview area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-4 text-center transition aspect-video flex items-center justify-center ${
          dragOverRef.current
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />

        {imagePreview ? (
          <img 
            src={imagePreview} 
            alt={imageName} 
            className="max-w-full max-h-full object-contain rounded"
          />
        ) : (
          <div className="text-center">
            <Upload className="mx-auto h-6 w-6 text-muted-foreground mb-2" />
            <p className="text-xs text-muted-foreground">Bild ablegen oder klicken</p>
          </div>
        )}
      </div>

      {/* Filename display and buttons */}
      {imageName && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground truncate">{imageName}</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1"
            >
              <Upload size={14} className="mr-1" />
              Ändern
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveImage}
              className="flex-1"
            >
              <X size={14} className="mr-1" />
              Entfernen
            </Button>
          </div>
        </div>
      )}

      {!imageName && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="w-full"
        >
          Datei auswählen
        </Button>
      )}
    </div>
  );
}
