import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { imageUploadService } from '@/lib/imageUpload';
import FeaturedImageCredit from './FeaturedImageCredit';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onClear: () => void;
  label?: string;
  className?: string;
  // Novos props para créditos
  caption?: string;
  credit?: string;
  sourceUrl?: string;
  onCaptionChange?: (caption: string) => void;
  onCreditChange?: (credit: string) => void;
  onSourceUrlChange?: (url: string) => void;
  showCredits?: boolean;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onClear,
  label = "Imagem",
  className = "",
  caption = "",
  credit = "",
  sourceUrl = "",
  onCaptionChange = () => {},
  onCreditChange = () => {},
  onSourceUrlChange = () => {},
  showCredits = false
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProvider, setUploadProvider] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('O arquivo deve ter no máximo 10MB.');
      return;
    }

    setIsUploading(true);
    setUploadProgress('Iniciando upload...');

    try {
      // Use the image upload service with multiple providers
      setUploadProgress('Fazendo upload da imagem...');
      const result = await imageUploadService.upload(file);
      
      setUploadProvider(result.provider);
      setUploadProgress('Upload concluído!');
      onChange(result.url);
      
      // Show success message with provider info
      setTimeout(() => {
        setUploadProgress('');
      }, 2000);
      
    } catch (error) {
      setUploadProgress('Erro no upload');
      
      // Mensagem de erro mais detalhada
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      alert(`Falha no upload: ${errorMessage}`);
      
      setTimeout(() => setUploadProgress(''), 3000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemove = () => {
    onClear();
    setUploadProvider('');
    // Limpar também os créditos
    if (showCredits) {
      onCaptionChange('');
      onCreditChange('');
      onSourceUrlChange('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={className}>
      <Label>{label}</Label>
      
      {value ? (
        <Card className="mt-2">
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={value}
                alt={caption || "Preview"}
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
              {uploadProvider && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  📤 {uploadProvider}
                </div>
              )}
              
              {/* Mostrar legenda se existir */}
              {caption && (
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded max-w-32 truncate">
                  {caption}
                </div>
              )}
            </div>
            
            {/* Mostrar créditos abaixo da imagem se habilitado */}
            {showCredits && (
              <FeaturedImageCredit
                caption={caption}
                credit={credit}
                sourceUrl={sourceUrl}
                onCaptionChange={onCaptionChange}
                onCreditChange={onCreditChange}
                onSourceUrlChange={onSourceUrlChange}
              />
            )}
          </CardContent>
        </Card>
      ) : (
        <Card 
          className={`mt-2 border-2 border-dashed transition-colors cursor-pointer ${
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center text-center">
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-sm text-muted-foreground">{uploadProgress}</p>
                </>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      Clique para selecionar ou arraste uma imagem
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, GIF, WEBP até 10MB
                    </p>
                    {showCredits && (
                      <p className="text-xs text-primary flex items-center justify-center gap-1">
                        <Info className="h-3 w-3" />
                        Inclua informações de crédito após o upload
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
};

export default ImageUpload;
