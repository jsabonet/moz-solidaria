import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface FeaturedImageCreditProps {
  caption: string;
  credit: string;
  sourceUrl: string;
  onCaptionChange: (caption: string) => void;
  onCreditChange: (credit: string) => void;
  onSourceUrlChange: (url: string) => void;
}

const FeaturedImageCredit: React.FC<FeaturedImageCreditProps> = ({
  caption,
  credit,
  sourceUrl,
  onCaptionChange,
  onCreditChange,
  onSourceUrlChange,
}) => {
  return (
    <div className="space-y-4 mt-4 p-4 border rounded-lg bg-muted/10">
      <h4 className="font-semibold text-sm">Informações da Imagem</h4>
      
      <div>
        <Label htmlFor="featured_caption" className="text-sm">Legenda</Label>
        <Textarea
          id="featured_caption"
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Descreva o que mostra a imagem..."
          rows={2}
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="featured_credit" className="text-sm">Crédito/Fonte</Label>
        <Input
          id="featured_credit"
          value={credit}
          onChange={(e) => onCreditChange(e.target.value)}
          placeholder="Ex: Foto por João Silva, Unsplash, Getty Images..."
          className="mt-1"
        />
      </div>
      
      <div>
        <Label htmlFor="featured_source_url" className="text-sm">URL da Fonte (opcional)</Label>
        <Input
          id="featured_source_url"
          type="url"
          value={sourceUrl}
          onChange={(e) => onSourceUrlChange(e.target.value)}
          placeholder="https://fonte-da-imagem.com"
          className="mt-1"
        />
      </div>
    </div>
  );
};

export default FeaturedImageCredit;
