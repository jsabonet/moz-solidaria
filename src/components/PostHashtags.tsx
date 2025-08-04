import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hash, Search, ExternalLink } from 'lucide-react';
import { BlogPost } from '@/lib/api';

interface PostHashtagsProps {
  post: BlogPost;
  className?: string;
}

const PostHashtags: React.FC<PostHashtagsProps> = ({ post, className = '' }) => {
  // Processar hashtags do campo hashtags
  const getHashtagsFromField = () => {
    if (!post.hashtags) return [];
    
    return post.hashtags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .map(tag => tag.startsWith('#') ? tag : `#${tag}`);
  };

  // Extrair hashtags do conteúdo
  const getHashtagsFromContent = () => {
    if (!post.content) return [];
    
    const hashtagRegex = /#[\w\-áàâãéèêíìîóòôõúùûç]+/gi;
    const matches = post.content.match(hashtagRegex) || [];
    
    return [...new Set(matches.map(tag => tag.toLowerCase()))];
  };

  // Combinar todas as hashtags únicas
  const getAllHashtags = () => {
    const fieldHashtags = getHashtagsFromField();
    const contentHashtags = getHashtagsFromContent();
    
    const allHashtags = [...fieldHashtags, ...contentHashtags];
    return [...new Set(allHashtags.map(tag => tag.toLowerCase()))];
  };

  const hashtags = getAllHashtags();

  const handleHashtagClick = (hashtag: string) => {
    // Implementar busca por hashtag ou navegação
    const searchQuery = hashtag.replace('#', '');
    window.location.href = `/blog?search=${encodeURIComponent(searchQuery)}`;
  };

  if (hashtags.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Hash className="h-5 w-5" />
          Hashtags do Post
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {hashtags.map((hashtag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="cursor-pointer hover:bg-blue-100 hover:text-blue-800 transition-colors px-3 py-1 text-sm"
              onClick={() => handleHashtagClick(hashtag)}
            >
              {hashtag}
            </Badge>
          ))}
        </div>
        
        {hashtags.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <Search className="h-3 w-3" />
              Clique em uma hashtag para buscar posts relacionados
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostHashtags;
