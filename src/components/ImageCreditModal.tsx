import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface ImageCreditData {
  caption: string;
  credit: string;
  sourceUrl: string;
  photographer: string;
  licenseType: string;
  altText: string;
}

interface ImageCreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (creditData: ImageCreditData) => void;
  imageUrl: string;
  initialData?: Partial<ImageCreditData>;
}

const ImageCreditModal: React.FC<ImageCreditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  imageUrl,
  initialData = {},
}) => {
  const [formData, setFormData] = useState<ImageCreditData>({
    caption: '',
    credit: '',
    sourceUrl: '',
    photographer: '',
    licenseType: '',
    altText: '',
  });

  // Reset form when modal opens with new data - optimized to prevent loops
  useEffect(() => {
    if (isOpen && imageUrl) {
      const newFormData = {
        caption: initialData.caption || '',
        credit: initialData.credit || '',
        sourceUrl: initialData.sourceUrl || '',
        photographer: initialData.photographer || '',
        licenseType: initialData.licenseType || '',
        altText: initialData.altText || '',
      };
      setFormData(newFormData);
    }
  }, [isOpen, imageUrl]); // Removed initialData from deps to prevent loops

  const handleSave = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!formData.altText.trim()) {
      alert('O texto alternativo é obrigatório para acessibilidade!');
      return;
    }
    
    onSave(formData);
  }, [formData, onSave]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleInputChange = useCallback((field: keyof ImageCreditData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const licenseOptions = [
    'Creative Commons',
    'Royalty Free',
    'Copyright',
    'Public Domain',
    'Attribution Required',
    'Editorial Use Only',
    'Commercial Use',
    'Arquivo Pessoal'
  ];

  // Early return if not open to prevent unnecessary rendering
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>Informações da Imagem</DialogTitle>
          <DialogDescription>
            Adicione créditos e informações sobre esta imagem para dar o devido reconhecimento ao autor.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSave} className="space-y-6">
          {/* Preview da imagem */}
          {imageUrl && (
            <div className="mb-4">
              <Label className="text-sm font-medium">Preview da Imagem</Label>
              <div className="mt-2 border rounded-lg overflow-hidden">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="w-full h-48 object-cover"
                />
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="alt_text_input">Texto Alternativo (Alt Text) *</Label>
              <Input
                id="alt_text_input"
                name="alt_text"
                type="text"
                value={formData.altText}
                onChange={(e) => handleInputChange('altText', e.target.value)}
                placeholder="Descreva a imagem para acessibilidade..."
                required
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Importante para acessibilidade e SEO
              </p>
            </div>
            
            <div className="md:col-span-2">
              <Label htmlFor="caption_input">Legenda</Label>
              <Textarea
                id="caption_input"
                name="caption"
                value={formData.caption}
                onChange={(e) => handleInputChange('caption', e.target.value)}
                placeholder="Legenda que aparecerá abaixo da imagem..."
                rows={3}
                autoComplete="off"
              />
            </div>
            
            <div>
              <Label htmlFor="photographer_input">Fotógrafo/Autor</Label>
              <Input
                id="photographer_input"
                name="photographer"
                type="text"
                value={formData.photographer}
                onChange={(e) => handleInputChange('photographer', e.target.value)}
                placeholder="Nome do fotógrafo ou autor..."
                autoComplete="off"
              />
            </div>
            
            <div>
              <Label htmlFor="credit_input">Fonte/Crédito</Label>
              <Input
                id="credit_input"
                name="credit"
                type="text"
                value={formData.credit}
                onChange={(e) => handleInputChange('credit', e.target.value)}
                placeholder="Ex: Unsplash, Getty Images, Arquivo Pessoal..."
                autoComplete="off"
              />
            </div>
            
            <div>
              <Label htmlFor="license_input">Tipo de Licença</Label>
              <Input
                id="license_input"
                name="license_type"
                type="text"
                list="license-options"
                value={formData.licenseType}
                onChange={(e) => handleInputChange('licenseType', e.target.value)}
                placeholder="Selecione ou digite..."
                autoComplete="off"
              />
              <datalist id="license-options">
                {licenseOptions.map(option => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>
            
            <div>
              <Label htmlFor="source_url_input">URL da Fonte</Label>
              <Input
                id="source_url_input"
                name="source_url"
                type="url"
                value={formData.sourceUrl}
                onChange={(e) => handleInputChange('sourceUrl', e.target.value)}
                placeholder="https://fonte-original.com"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Preview do crédito */}
          {(formData.caption || formData.credit || formData.photographer) && (
            <div className="border-t pt-4">
              <Label className="text-sm font-medium">Preview da Legenda</Label>
              <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm">
                {formData.caption && (
                  <div className="font-medium mb-1">{formData.caption}</div>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {formData.photographer && (
                    <Badge variant="outline">📸 {formData.photographer}</Badge>
                  )}
                  {formData.credit && (
                    <Badge variant="outline">{formData.credit}</Badge>
                  )}
                  {formData.licenseType && (
                    <Badge variant="outline">📄 {formData.licenseType}</Badge>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.altText.trim()}
            >
              Salvar Informações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCreditModal;
