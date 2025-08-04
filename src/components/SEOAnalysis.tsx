import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, XCircle, TrendingUp, Eye, Clock } from 'lucide-react';
import { BlogPost } from '@/lib/api';
import KeywordAnalysisComponent from './KeywordAnalysis';

interface SEOAnalysisProps {
  post: BlogPost;
}

const SEOAnalysis: React.FC<SEOAnalysisProps> = ({ post }) => {
  // Análise dos fatores SEO
  const titleLength = post.title?.length || 0;
  const titleOptimal = titleLength >= 50 && titleLength <= 60;
  const titleStatus = titleOptimal ? 'good' : titleLength < 30 ? 'bad' : 'warning';
  
  const metaLength = post.meta_description?.length || 0;
  const metaOptimal = metaLength >= 150 && metaLength <= 160;
  const metaStatus = metaOptimal ? 'good' : metaLength === 0 ? 'bad' : 'warning';
  
  const hasKeyword = Boolean(post.focus_keyword);
  const keywordInTitle = hasKeyword && post.title?.toLowerCase().includes(post.focus_keyword?.toLowerCase() || '');
  
  const contentWords = post.content ? post.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0;
  const contentOptimal = contentWords >= 300;
  
  const hasImage = Boolean(post.featured_image);
  const hasCategory = Boolean(post.category);
  const hasTags = Boolean(post.tags && post.tags.length > 0);
  
  // Cálculo do score
  const seoScore = post.seo_score || 0;
  const readabilityScore = post.readability_score || 0;
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };
  
  const StatusIcon = ({ status }: { status: 'good' | 'warning' | 'bad' }) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'bad':
        return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Análise SEO
        </CardTitle>
        <CardDescription>
          Otimização para motores de busca e legibilidade
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Scores principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${getScoreBgColor(seoScore)}`}>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(seoScore)}`}>
                {seoScore.toFixed(0)}/100
              </div>
              <div className="text-sm text-gray-600">Score SEO</div>
              <Progress value={seoScore} className="mt-2" />
            </div>
          </div>
          
          <div className={`p-4 rounded-lg ${getScoreBgColor(readabilityScore)}`}>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getScoreColor(readabilityScore)}`}>
                {readabilityScore.toFixed(0)}/100
              </div>
              <div className="text-sm text-gray-600">Legibilidade</div>
              <Progress value={readabilityScore} className="mt-2" />
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-blue-100">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {post.read_time || 0}
              </div>
              <div className="text-sm text-gray-600">min de leitura</div>
              <div className="text-xs text-gray-500 mt-1">
                {contentWords} palavras
              </div>
            </div>
          </div>
        </div>

        {/* Análise detalhada */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-900">Fatores SEO</h4>
          
          {/* Análise de palavra-chave */}
          <KeywordAnalysisComponent post={post} />
          
          <div className="space-y-3">
            {/* Título */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <StatusIcon status={titleStatus} />
                <span className="font-medium">Título</span>
                <Badge variant="secondary">{titleLength} chars</Badge>
              </div>
              <div className="text-sm text-gray-600">
                {titleOptimal ? 'Tamanho ideal' : 'Recomendado: 50-60 caracteres'}
              </div>
            </div>

            {/* Meta descrição */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <StatusIcon status={metaStatus} />
                <span className="font-medium">Meta descrição</span>
                <Badge variant="secondary">{metaLength} chars</Badge>
              </div>
              <div className="text-sm text-gray-600">
                {metaOptimal ? 'Tamanho ideal' : metaLength === 0 ? 'Não definida' : 'Recomendado: 150-160 caracteres'}
              </div>
            </div>

            {/* Palavra-chave */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <StatusIcon status={hasKeyword ? (keywordInTitle ? 'good' : 'warning') : 'bad'} />
                <span className="font-medium">Palavra-chave</span>
                {post.focus_keyword && (
                  <Badge variant="outline">{post.focus_keyword}</Badge>
                )}
              </div>
              <div className="text-sm text-gray-600">
                {!hasKeyword 
                  ? 'Não definida' 
                  : keywordInTitle 
                    ? 'Presente no título' 
                    : 'Ausente no título'
                }
              </div>
            </div>

            {/* Conteúdo */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <StatusIcon status={contentOptimal ? 'good' : 'warning'} />
                <span className="font-medium">Conteúdo</span>
                <Badge variant="secondary">{contentWords} palavras</Badge>
              </div>
              <div className="text-sm text-gray-600">
                {contentOptimal ? 'Tamanho adequado' : 'Mínimo recomendado: 300 palavras'}
              </div>
            </div>

            {/* Elementos visuais e organização */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <StatusIcon status={hasImage ? 'good' : 'bad'} />
                <span className="text-sm">Imagem destacada</span>
              </div>
              
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <StatusIcon status={hasCategory ? 'good' : 'bad'} />
                <span className="text-sm">Categoria</span>
              </div>
              
              <div className="flex items-center gap-2 p-3 border rounded-lg">
                <StatusIcon status={hasTags ? 'good' : 'bad'} />
                <span className="text-sm">Tags</span>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        {(post.views_count !== undefined || post.published_at) && (
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Estatísticas</h4>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {post.views_count !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {post.views_count} visualizações
                </div>
              )}
              {post.published_at && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Publicado em {new Date(post.published_at).toLocaleDateString('pt-BR')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recomendações */}
        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">Recomendações</h4>
          <div className="space-y-1 text-sm text-gray-600">
            {!titleOptimal && (
              <div>• Ajuste o título para 50-60 caracteres</div>
            )}
            {!metaOptimal && (
              <div>• {metaLength === 0 ? 'Adicione' : 'Ajuste'} a meta descrição para 150-160 caracteres</div>
            )}
            {!hasKeyword && (
              <div>• Defina uma palavra-chave principal</div>
            )}
            {hasKeyword && !keywordInTitle && (
              <div>• Inclua a palavra-chave no título</div>
            )}
            {!contentOptimal && (
              <div>• Expanda o conteúdo para pelo menos 300 palavras</div>
            )}
            {!hasImage && (
              <div>• Adicione uma imagem em destaque</div>
            )}
            {!hasCategory && (
              <div>• Selecione uma categoria</div>
            )}
            {!hasTags && (
              <div>• Adicione tags relevantes</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SEOAnalysis;
