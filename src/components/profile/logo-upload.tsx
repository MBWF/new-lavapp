import { ImageIcon, Loader2, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface LogoUploadProps {
  currentLogoUrl: string | null;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  isUploading: boolean;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_FORMATS = {
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
};

export function LogoUpload({
  currentLogoUrl,
  onUpload,
  onRemove,
  isUploading,
}: LogoUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const validateAndCompressFile = async (file: File): Promise<File> => {
    if (file.size > MAX_FILE_SIZE) {
      try {
        const compressedFile = await imageCompression(file, {
          maxSizeMB: 2,
          maxWidthOrHeight: 1024,
          useWebWorker: true,
        });
        return compressedFile;
      } catch (error) {
        throw new Error('Erro ao comprimir imagem. Tente uma imagem menor.');
      }
    }
    return file;
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) {
      toast({
        title: 'Arquivo inválido',
        description: 'Por favor, selecione uma imagem PNG, JPG ou WEBP.',
        variant: 'destructive',
      });
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const validatedFile = await validateAndCompressFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(validatedFile);

      await onUpload(validatedFile);
    } catch (error) {
      toast({
        title: 'Erro ao processar imagem',
        description:
          error instanceof Error ? error.message : 'Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FORMATS,
    maxFiles: 1,
    disabled: isUploading,
  });

  const displayImage = preview || currentLogoUrl;

  const handleRemove = () => {
    setPreview(null);
    onRemove();
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
          isUploading && 'pointer-events-none opacity-50',
        )}
      >
        <input {...getInputProps()} />

        {displayImage ? (
          <div className="relative">
            <img
              src={displayImage}
              alt="Logo preview"
              className="h-32 w-32 rounded-lg object-contain"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/80">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            {isUploading ? (
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            ) : isDragActive ? (
              <Upload className="h-12 w-12 text-primary" />
            ) : (
              <ImageIcon className="h-12 w-12 text-muted-foreground" />
            )}
            <div>
              <p className="font-medium text-sm">
                {isDragActive
                  ? 'Solte a imagem aqui'
                  : 'Arraste uma imagem ou clique para selecionar'}
              </p>
              <p className="mt-1 text-muted-foreground text-xs">
                PNG, JPG ou WEBP até 2MB
              </p>
            </div>
          </div>
        )}
      </div>

      {displayImage && !isUploading && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleRemove}
          className="w-full gap-2"
        >
          <X className="h-4 w-4" />
          Remover Logo
        </Button>
      )}
    </div>
  );
}
