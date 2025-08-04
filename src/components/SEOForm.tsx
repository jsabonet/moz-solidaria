import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Globe, 
  Twitter, 
  Facebook, 
  Eye, 
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Target
} from 'lucide-react';
import { useKeywordAnalysis, useKeywordSuggestions } from '@/hooks/useKeywordAnalysis';

export interface SEOFormData {
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  focus_keyword?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_type?: 'article' | 'website' | 'blog' | 'news';
  twitter_title?: string;
  twitter_description?: string;
  twitter_card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  noindex?: boolean;
  nofollow?: boolean;
  robots_txt?: string;
  hashtags?: string;
}

interface SEOFormProps {
  data: SEOFormData;
  onChange: (data: SEOFormData) => void;
  postTitle?: string;
  postContent?: string;
}

const SEOForm: React.FC<SEOFormProps> = ({ 
  data, 
  onChange, 
  postTitle = '', 
  postContent = '' 
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'social' | 'advanced'>('general');

  const handleChange = (field: keyof SEOFormData, value: string | boolean) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // Usar hooks para análise de palavras-chave
  const keywordAnalysis = useKeywordAnalysis(
    data.focus_keyword || '',
    data.meta_title || postTitle,
    data.meta_description || '',
    postContent
  );
  
  const keywordSuggestions = useKeywordSuggestions(postTitle, postContent, 6);
  
  // Análise em tempo real
  const metaTitleLength = (data.meta_title || postTitle).length;
  const metaDescLength = (data.meta_description || '').length;
  const hasKeyword = Boolean(data.focus_keyword);
  
  const getTitleStatus = () => {
    if (metaTitleLength >= 50 && metaTitleLength <= 60) return 'good';
    if (metaTitleLength < 30 || metaTitleLength > 70) return 'bad';
    return 'warning';
  };

  const getDescStatus = () => {
    if (metaDescLength >= 150 && metaDescLength <= 160) return 'good';
    if (metaDescLength === 0 || metaDescLength > 200) return 'bad';
    return 'warning';
  };

  const StatusIndicator = ({ status }: { status: 'good' | 'warning' | 'bad' }) => {
    const icons = {
      good: <CheckCircle className="h-4 w-4 text-green-600" />,
      warning: <AlertCircle className="h-4 w-4 text-yellow-600" />,
      bad: <AlertCircle className="h-4 w-4 text-red-600" />
    };
    return icons[status];
  };

  const autoFillSocial = () => {
    onChange({
      ...data,
      og_title: data.meta_title || postTitle,
      og_description: data.meta_description,
      twitter_title: data.meta_title || postTitle,
      twitter_description: data.meta_description
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Configurações SEO
        </CardTitle>
        <CardDescription>
          Otimize seu post para motores de busca e redes sociais
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Tabs */}
        <div className="flex space-x-1 rounded-lg bg-gray-100 p-1 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'general'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Search className="h-4 w-4 inline mr-2" />
            Geral
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('social')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'social'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Globe className="h-4 w-4 inline mr-2" />
            Redes Sociais
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('advanced')}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === 'advanced'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Eye className="h-4 w-4 inline mr-2" />
            Avançado
          </button>
        </div>

        {/* Aba Geral */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            {/* Meta Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="meta_title">Título SEO</Label>
                <div className="flex items-center gap-2">
                  <StatusIndicator status={getTitleStatus()} />
                  <Badge variant="secondary">{metaTitleLength}/60</Badge>
                </div>
              </div>
              <Input
                id="meta_title"
                placeholder={postTitle || "Título otimizado para SEO"}
                value={data.meta_title || ''}
                onChange={(e) => handleChange('meta_title', e.target.value)}
              />
              <p className="text-xs text-gray-600">
                Deixe em branco para usar o título do post. Recomendado: 50-60 caracteres.
              </p>
            </div>

            {/* Focus Keyword */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="focus_keyword" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Palavra-chave principal
                </Label>
                {keywordAnalysis && (
                  <div className="flex items-center gap-2">
                    <Badge variant={keywordAnalysis.status === 'excellent' || keywordAnalysis.status === 'good' ? 'default' : 'destructive'}>
                      Score: {keywordAnalysis.score}/100
                    </Badge>
                    <Badge variant={keywordAnalysis.inTitle ? "default" : "destructive"}>
                      {keywordAnalysis.inTitle ? 'No título' : 'Faltando no título'}
                    </Badge>
                  </div>
                )}
              </div>
              
              <Input
                id="focus_keyword"
                placeholder="palavra-chave principal"
                value={data.focus_keyword || ''}
                onChange={(e) => handleChange('focus_keyword', e.target.value)}
              />
              
              {/* Análise da palavra-chave */}
              {keywordAnalysis && (
                <div className="p-3 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    <div className={`flex items-center text-xs ${keywordAnalysis.inTitle ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-1">{keywordAnalysis.inTitle ? '✅' : '❌'}</span>
                      Título
                    </div>
                    <div className={`flex items-center text-xs ${keywordAnalysis.inDescription ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-1">{keywordAnalysis.inDescription ? '✅' : '❌'}</span>
                      Descrição
                    </div>
                    <div className={`flex items-center text-xs ${keywordAnalysis.inContent ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-1">{keywordAnalysis.inContent ? '✅' : '❌'}</span>
                      Conteúdo
                    </div>
                    <div className={`flex items-center text-xs ${keywordAnalysis.inHeadings ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-1">{keywordAnalysis.inHeadings ? '✅' : '❌'}</span>
                      Subtítulos
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-gray-600">
                      Densidade: {keywordAnalysis.density.toFixed(1)}% • {keywordAnalysis.occurrences} ocorrências
                    </span>
                    <span className={`${
                      keywordAnalysis.density >= 0.5 && keywordAnalysis.density <= 2.5 
                        ? 'text-green-600' 
                        : keywordAnalysis.density > 2.5 
                          ? 'text-red-600' 
                          : 'text-yellow-600'
                    }`}>
                      {keywordAnalysis.density >= 0.5 && keywordAnalysis.density <= 2.5 
                        ? 'Ideal' 
                        : keywordAnalysis.density > 2.5 
                          ? 'Muito alta' 
                          : 'Muito baixa'
                      }
                    </span>
                  </div>
                  
                  {keywordAnalysis.recommendations.length > 0 && (
                    <div className="text-xs">
                      <p className="font-medium text-gray-700 mb-1">Recomendações:</p>
                      <ul className="space-y-1">
                        {keywordAnalysis.recommendations.slice(0, 2).map((rec, index) => (
                          <li key={index} className="text-gray-600">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {/* Sugestões de palavras-chave */}
              {keywordSuggestions.length > 0 && !hasKeyword && (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" />
                    Sugestões baseadas no conteúdo:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {keywordSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleChange('focus_keyword', suggestion)}
                        className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-blue-700 transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <p className="text-xs text-gray-600">
                Palavra-chave que melhor descreve o conteúdo. Densidade ideal: 0.5-2.5%
              </p>
            </div>

            {/* Meta Keywords */}
            <div className="space-y-3">
              <Label htmlFor="meta_keywords" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Palavras-chave (Meta Keywords)
              </Label>
              <Textarea
                id="meta_keywords"
                placeholder="palavra1, palavra2, palavra3, ..."
                rows={3}
                value={data.meta_keywords || ''}
                onChange={(e) => handleChange('meta_keywords', e.target.value)}
              />
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="mb-1">
                    <strong>Separe as palavras-chave por vírgulas.</strong> Estas são as palavras específicas do seu post.
                  </p>
                  <p>
                    Exemplo: "educação moçambique, cabo delgado desenvolvimento, programas sociais, transformação comunitária"
                  </p>
                </div>
              </div>
              {data.meta_keywords && (
                <div className="p-2 bg-blue-50 rounded border">
                  <p className="text-xs text-blue-700 mb-1">
                    <strong>Keywords que serão exibidas:</strong>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {data.meta_keywords.split(',').map((keyword, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {keyword.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Meta Description */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="meta_description">Meta descrição</Label>
                <div className="flex items-center gap-2">
                  <StatusIndicator status={getDescStatus()} />
                  <Badge variant="secondary">{metaDescLength}/160</Badge>
                </div>
              </div>
              <Textarea
                id="meta_description"
                placeholder="Descrição que aparecerá nos resultados de busca"
                value={data.meta_description || ''}
                onChange={(e) => handleChange('meta_description', e.target.value)}
                rows={3}
              />
              <p className="text-xs text-gray-600">
                Resumo atrativo do post. Recomendado: 150-160 caracteres.
              </p>
            </div>

            {/* Canonical URL */}
            <div className="space-y-2">
              <Label htmlFor="canonical_url">URL canônica (opcional)</Label>
              <Input
                id="canonical_url"
                placeholder="https://exemplo.com/post-original"
                value={data.canonical_url || ''}
                onChange={(e) => handleChange('canonical_url', e.target.value)}
              />
              <p className="text-xs text-gray-600">
                Use se este conteúdo foi publicado primeiro em outro local.
              </p>
            </div>

            {/* Preview */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="text-sm font-medium mb-2">Preview do Google:</h4>
              <div className="space-y-1">
                <div className="text-blue-600 text-lg font-medium">
                  {data.meta_title || postTitle || 'Título do post'}
                </div>
                <div className="text-green-700 text-sm">
                  mozsolidaria.org › blog › post-slug
                </div>
                <div className="text-gray-600 text-sm">
                  {data.meta_description || 'Meta descrição não definida'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aba Redes Sociais */}
        {activeTab === 'social' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Open Graph & Twitter Cards</h3>
                <p className="text-sm text-gray-600">
                  Configure como o post aparecerá quando compartilhado
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={autoFillSocial}
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                Preencher automaticamente
              </Button>
            </div>

            <Separator />

            {/* Open Graph */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Facebook className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Facebook / Open Graph</h4>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="og_title">Título OG</Label>
                  <Input
                    id="og_title"
                    placeholder="Título para Facebook"
                    value={data.og_title || ''}
                    onChange={(e) => handleChange('og_title', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="og_description">Descrição OG</Label>
                  <Textarea
                    id="og_description"
                    placeholder="Descrição para Facebook"
                    value={data.og_description || ''}
                    onChange={(e) => handleChange('og_description', e.target.value)}
                    rows={2}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Twitter */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Twitter className="h-5 w-5 text-blue-400" />
                <h4 className="font-medium">Twitter</h4>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="twitter_title">Título Twitter</Label>
                  <Input
                    id="twitter_title"
                    placeholder="Título para Twitter"
                    value={data.twitter_title || ''}
                    onChange={(e) => handleChange('twitter_title', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="twitter_description">Descrição Twitter</Label>
                  <Textarea
                    id="twitter_description"
                    placeholder="Descrição para Twitter"
                    value={data.twitter_description || ''}
                    onChange={(e) => handleChange('twitter_description', e.target.value)}
                    rows={2}
                  />
                </div>

                {/* Twitter Card Type */}
                <div>
                  <Label htmlFor="twitter_card">Tipo de Twitter Card</Label>
                  <select
                    id="twitter_card"
                    className="w-full border rounded-md px-3 py-2"
                    value={data.twitter_card || 'summary_large_image'}
                    onChange={(e) => handleChange('twitter_card', e.target.value)}
                  >
                    <option value="summary">Resumo</option>
                    <option value="summary_large_image">Resumo com imagem grande</option>
                    <option value="app">App</option>
                    <option value="player">Player</option>
                  </select>
                </div>
              </div>

              {/* Open Graph Type */}
              <div>
                <Label htmlFor="og_type">Tipo Open Graph</Label>
                <select
                  id="og_type"
                  className="w-full border rounded-md px-3 py-2"
                  value={data.og_type || 'article'}
                  onChange={(e) => handleChange('og_type', e.target.value)}
                >
                  <option value="article">Artigo</option>
                  <option value="website">Website</option>
                  <option value="blog">Blog</option>
                  <option value="news">Notícia</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Aba Avançado */}
        {activeTab === 'advanced' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Configurações Avançadas de SEO</h3>
              <p className="text-sm text-gray-600 mb-4">
                Controle avançado de indexação e hashtags
              </p>
            </div>

            {/* Configurações de Indexação */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="noindex">Não indexar (noindex)</Label>
                  <p className="text-xs text-gray-600">
                    Impede que motores de busca indexem este post
                  </p>
                </div>
                <Switch
                  id="noindex"
                  checked={data.noindex || false}
                  onCheckedChange={(checked) => handleChange('noindex', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="nofollow">Não seguir links (nofollow)</Label>
                  <p className="text-xs text-gray-600">
                    Impede que motores de busca sigam links neste post
                  </p>
                </div>
                <Switch
                  id="nofollow"
                  checked={data.nofollow || false}
                  onCheckedChange={(checked) => handleChange('nofollow', checked)}
                />
              </div>
            </div>

            {/* Robots.txt personalizado */}
            <div className="space-y-2">
              <Label htmlFor="robots_txt">Diretivas Robots personalizadas</Label>
              <Input
                id="robots_txt"
                placeholder="index, follow, max-snippet:-1"
                value={data.robots_txt || ''}
                onChange={(e) => handleChange('robots_txt', e.target.value)}
              />
              <p className="text-xs text-gray-600">
                Diretivas personalizadas para robots.txt (ex: index, follow, max-snippet:-1)
              </p>
            </div>

            {/* Hashtags */}
            <div className="space-y-2">
              <Label htmlFor="hashtags">Hashtags</Label>
              <Textarea
                id="hashtags"
                placeholder="#educacao, #cabo-delgado, #solidariedade, #mozambique"
                value={data.hashtags || ''}
                onChange={(e) => handleChange('hashtags', e.target.value)}
                rows={3}
              />
              <p className="text-xs text-gray-600">
                Hashtags separadas por vírgula. Use # no início ou será adicionado automaticamente.
                Exemplo: #educacao, #cabo-delgado, #solidariedade
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SEOForm;
