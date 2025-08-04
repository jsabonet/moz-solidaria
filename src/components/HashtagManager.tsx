import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Hash, Plus, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface HashtagManagerProps {
  hashtags: string;
  onChange: (hashtags: string) => void;
  contentText?: string;
}

interface HashtagAnalysis {
  tag: string;
  searchVolume: 'high' | 'medium' | 'low';
  relevance: 'high' | 'medium' | 'low';
  suggestion: boolean;
}

const HashtagManager: React.FC<HashtagManagerProps> = ({
  hashtags,
  onChange,
  contentText = ''
}) => {
  const [newHashtag, setNewHashtag] = useState('');
  const [hashtagList, setHashtagList] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<HashtagAnalysis[]>([]);

  // Processar hashtags da string para array
  useEffect(() => {
    if (hashtags) {
      const processed = hashtags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0)
        .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
      setHashtagList(processed);
    } else {
      setHashtagList([]);
    }
  }, [hashtags]);

  // Gerar sugestões baseadas no conteúdo
  useEffect(() => {
    if (contentText) {
      generateSuggestions(contentText);
    }
  }, [contentText]);

  const generateSuggestions = (text: string) => {
    const commonMozambiqueHashtags: HashtagAnalysis[] = [
      { tag: '#mozambique', searchVolume: 'high', relevance: 'high', suggestion: true },
      { tag: '#cabodelgado', searchVolume: 'medium', relevance: 'high', suggestion: true },
      { tag: '#solidariedade', searchVolume: 'medium', relevance: 'high', suggestion: true },
      { tag: '#ong', searchVolume: 'high', relevance: 'medium', suggestion: true },
      { tag: '#humanitaria', searchVolume: 'medium', relevance: 'high', suggestion: true },
      { tag: '#ajuda', searchVolume: 'high', relevance: 'medium', suggestion: true },
      { tag: '#educacao', searchVolume: 'high', relevance: 'medium', suggestion: false },
      { tag: '#saude', searchVolume: 'high', relevance: 'medium', suggestion: false },
      { tag: '#agua', searchVolume: 'medium', relevance: 'medium', suggestion: false },
      { tag: '#agricultura', searchVolume: 'medium', relevance: 'medium', suggestion: false },
      { tag: '#desenvolvimento', searchVolume: 'medium', relevance: 'medium', suggestion: false },
      { tag: '#comunidade', searchVolume: 'medium', relevance: 'medium', suggestion: false },
      { tag: '#refugiados', searchVolume: 'medium', relevance: 'high', suggestion: false },
      { tag: '#criancas', searchVolume: 'high', relevance: 'medium', suggestion: false },
      { tag: '#mulheres', searchVolume: 'high', relevance: 'medium', suggestion: false },
    ];

    // Analisar conteúdo para determinar relevância
    const textLower = text.toLowerCase();
    const relevant = commonMozambiqueHashtags.map(hashtag => {
      const tagWord = hashtag.tag.substring(1); // Remove #
      let relevance = hashtag.relevance;
      let suggestion = hashtag.suggestion;

      // Aumentar relevância se a palavra aparecer no texto
      if (textLower.includes(tagWord)) {
        relevance = 'high';
        suggestion = true;
      }

      // Palavras-chave específicas que aumentam relevância
      const keywords = {
        educacao: ['escola', 'ensino', 'estudante', 'aprender', 'educação'],
        saude: ['hospital', 'médico', 'medicina', 'doença', 'tratamento', 'saúde'],
        agua: ['água', 'poço', 'saneamento', 'higiene'],
        agricultura: ['agricultura', 'plantio', 'colheita', 'cultivo', 'fazenda'],
        refugiados: ['refugiado', 'deslocado', 'conflito', 'violência'],
        criancas: ['criança', 'infantil', 'menino', 'menina'],
        mulheres: ['mulher', 'feminino', 'mãe', 'género']
      };

      Object.entries(keywords).forEach(([key, words]) => {
        if (hashtag.tag.includes(key) && words.some(word => textLower.includes(word))) {
          relevance = 'high';
          suggestion = true;
        }
      });

      return { ...hashtag, relevance, suggestion };
    });

    // Filtrar apenas sugestões relevantes e que não estão já em uso
    const filtered = relevant
      .filter(h => h.suggestion && h.relevance === 'high')
      .filter(h => !hashtagList.includes(h.tag))
      .sort((a, b) => {
        // Ordenar por volume de busca
        const volumeOrder = { high: 3, medium: 2, low: 1 };
        return volumeOrder[b.searchVolume] - volumeOrder[a.searchVolume];
      })
      .slice(0, 8); // Máximo 8 sugestões

    setSuggestions(filtered);
  };

  const addHashtag = (tag: string) => {
    if (!tag) return;
    
    // Processar hashtag
    let processedTag = tag.trim();
    if (!processedTag.startsWith('#')) {
      processedTag = `#${processedTag}`;
    }
    
    // Normalizar: remover espaços, converter para lowercase
    processedTag = processedTag.replace(/\s+/g, '-').toLowerCase();
    
    // Verificar se já existe
    if (hashtagList.includes(processedTag)) return;
    
    const newList = [...hashtagList, processedTag];
    setHashtagList(newList);
    onChange(newList.join(', '));
    setNewHashtag('');
  };

  const removeHashtag = (tagToRemove: string) => {
    const newList = hashtagList.filter(tag => tag !== tagToRemove);
    setHashtagList(newList);
    onChange(newList.join(', '));
  };

  const addSuggestion = (suggestion: HashtagAnalysis) => {
    addHashtag(suggestion.tag);
    setSuggestions(prev => prev.filter(s => s.tag !== suggestion.tag));
  };

  const getVolumeColor = (volume: string) => {
    switch (volume) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getVolumeIcon = (volume: string) => {
    switch (volume) {
      case 'high': return '🔥';
      case 'medium': return '📈';
      case 'low': return '📊';
      default: return '📊';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="h-5 w-5" />
          Gerenciador de Hashtags
        </CardTitle>
        <CardDescription>
          Adicione hashtags para melhorar o alcance e ranking do seu post
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Input para nova hashtag */}
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="new-hashtag" className="sr-only">Nova hashtag</Label>
            <Input
              id="new-hashtag"
              placeholder="Digite uma hashtag (ex: educacao)"
              value={newHashtag}
              onChange={(e) => setNewHashtag(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addHashtag(newHashtag);
                }
              }}
            />
          </div>
          <Button 
            type="button"
            onClick={() => addHashtag(newHashtag)}
            className="whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-1" />
            Adicionar
          </Button>
        </div>

        {/* Hashtags atuais */}
        {hashtagList.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Hashtags do Post ({hashtagList.length})</Label>
            <div className="flex flex-wrap gap-2">
              {hashtagList.map((tag) => (
                <Badge
                  key={tag}
                  variant="default"
                  className="flex items-center gap-1 px-3 py-1"
                >
                  {tag}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-1 hover:bg-transparent"
                    onClick={() => removeHashtag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sugestões */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <Label className="text-sm font-medium">Sugestões Baseadas no Conteúdo</Label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.tag}
                  className="flex items-center justify-between p-2 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{suggestion.tag}</span>
                    <span className="text-xs">{getVolumeIcon(suggestion.searchVolume)}</span>
                    <span className={`text-xs ${getVolumeColor(suggestion.searchVolume)}`}>
                      {suggestion.searchVolume}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addSuggestion(suggestion)}
                    className="h-auto p-1 text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dicas */}
        <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
          <strong>💡 Dicas:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Use 3-8 hashtags relevantes para melhor alcance</li>
            <li>• Combine hashtags populares (#mozambique) com específicas (#cabodelgado)</li>
            <li>• Hashtags são automaticamente processadas (espaços → hifens, minúsculas)</li>
            <li>• Volume de busca: 🔥 Alto, 📈 Médio, 📊 Baixo</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default HashtagManager;
