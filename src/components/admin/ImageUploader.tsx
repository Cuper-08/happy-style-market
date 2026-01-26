import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { X, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useUploadProductImage } from '@/hooks/admin/useAdminProducts';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageUploader({ images, onChange, maxImages = 5 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const uploadImage = useUploadProductImage();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (images.length + acceptedFiles.length > maxImages) {
        return;
      }

      setUploading(true);
      const newImages: string[] = [];

      for (const file of acceptedFiles) {
        try {
          const url = await uploadImage.mutateAsync(file);
          newImages.push(url);
        } catch (error) {
          console.error('Error uploading image:', error);
        }
      }

      onChange([...images, ...newImages]);
      setUploading(false);
    },
    [images, maxImages, onChange, uploadImage]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
    },
    maxFiles: maxImages - images.length,
    disabled: uploading || images.length >= maxImages,
  });

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    onChange(newImages);
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const newImages = [...images];
    const [removed] = newImages.splice(from, 1);
    newImages.splice(to, 0, removed);
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative aspect-square rounded-lg border border-border overflow-hidden group"
            >
              <img
                src={url}
                alt={`Imagem ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {index > 0 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => moveImage(index, index - 1)}
                  >
                    ←
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removeImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
                {index < images.length - 1 && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => moveImage(index, index + 1)}
                  >
                    →
                  </Button>
                )}
              </div>
              {index === 0 && (
                <span className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                  Principal
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Zone */}
      {images.length < maxImages && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50',
            uploading && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <>
                <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                <p className="text-sm text-muted-foreground">Enviando imagens...</p>
              </>
            ) : isDragActive ? (
              <>
                <ImageIcon className="h-8 w-8 text-primary" />
                <p className="text-sm text-primary">Solte as imagens aqui</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Arraste imagens ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG ou WEBP (máx. {maxImages - images.length} imagens)
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
