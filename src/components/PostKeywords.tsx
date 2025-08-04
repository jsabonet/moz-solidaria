import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Tag } from 'lucide-react';
import { BlogPost } from '@/lib/api';

interface PostKeywordsProps {
  post: BlogPost;
  className?: string;
  showTitle?: boolean;
}

const PostKeywords: React.FC<PostKeywordsProps> = ({ 
  post, 
  className = '',
  showTitle = true 
}) => {
  // Processar meta keywords
  const getMetaKeywords = () => {
    if (!post.meta_keywords) return [];
    
    return post.meta_keywords
      .split(',')
      .map(keyword => keyword.trim())
      .filter(keyword => keyword.length > 0);
  };

  // Obter palavra-chave principal
  const getFocusKeyword = () => {
    return post.focus_keyword?.trim() || null;
  };

  const metaKeywords = getMetaKeywords();
  const focusKeyword = getFocusKeyword();

  if (!focusKeyword && metaKeywords.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-5 w-5" />
            Palavras-chave SEO
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={showTitle ? '' : 'pt-0'}>
        {/* Palavra-chave principal */}
        {focusKeyword && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Search className="h-4 w-4" />
              Palavra-chave Principal:
            </h4>
            <Badge variant="default" className="px-3 py-1 text-sm font-medium">
              {focusKeyword}
            </Badge>
          </div>
        )}

        {/* Meta Keywords */}
        {metaKeywords.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Tag className="h-4 w-4" />
              Palavras-chave Secundárias:
            </h4>
            <div className="flex flex-wrap gap-2">
              {metaKeywords.map((keyword, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="px-2 py-1 text-xs"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Informação sobre SEO */}
        <div className="mt-4 pt-3 border-t">
          <p className="text-xs text-gray-600">
            💡 Estas palavras-chave otimizam a descoberta do post nos motores de busca
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostKeywords;
