import React, { useState, useEffect } from 'react';
import { Heart, Share2, MessageCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

// Função auxiliar para obter token
const getToken = () => localStorage.getItem('authToken');

interface Post {
  id: number;
  slug: string;
  title: string;
  likes_count: number;
  shares_count: number;
  comments_count: number;
  is_liked_by_user: boolean;
}

interface SocialInteractionsProps {
  post: Post;
  onUpdate?: (updatedPost: Post) => void;
  showComments?: boolean;
}

const SocialInteractions: React.FC<SocialInteractionsProps> = ({ 
  post, 
  onUpdate, 
  showComments = true 
}) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked_by_user);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [sharesCount, setSharesCount] = useState(post.shares_count);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLiked(post.is_liked_by_user);
    setLikesCount(post.likes_count);
    setSharesCount(post.shares_count);
  }, [post]);

  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para curtir posts.",
      });
      return;
    }

    const token = getToken();
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/blog/posts/${post.slug}/like/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.is_liked);
        setLikesCount(data.likes_count);
        
        toast({
          title: "Sucesso",
          description: data.message,
        });

        if (onUpdate) {
          onUpdate({
            ...post,
            is_liked_by_user: data.is_liked,
            likes_count: data.likes_count,
          });
        }
      } else {
        throw new Error('Erro ao curtir post');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível curtir o post. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (shareType: string = 'other') => {
    const token = getToken();
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/blog/posts/${post.slug}/share/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ share_type: shareType }),
      });

      if (response.ok) {
        const data = await response.json();
        setSharesCount(data.shares_count);
        
        toast({
          title: "Sucesso",
          description: data.message,
        });

        if (onUpdate) {
          onUpdate({
            ...post,
            shares_count: data.shares_count,
          });
        }

        // Copiar link para área de transferência
        const postUrl = `${window.location.origin}/blog/${post.slug}`;
        await navigator.clipboard.writeText(postUrl);
        
        toast({
          title: "Link copiado!",
          description: "O link do post foi copiado para sua área de transferência.",
        });
      } else {
        throw new Error('Erro ao compartilhar post');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível compartilhar o post. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const shareMenu = [
    { type: 'facebook', label: 'Facebook', icon: '📘' },
    { type: 'twitter', label: 'Twitter', icon: '🐦' },
    { type: 'whatsapp', label: 'WhatsApp', icon: '💬' },
    { type: 'telegram', label: 'Telegram', icon: '✈️' },
    { type: 'email', label: 'E-mail', icon: '📧' },
    { type: 'other', label: 'Copiar link', icon: '🔗' },
  ];

  const openShareDialog = () => {
    const options = shareMenu.map(option => 
      `${option.icon} ${option.label}`
    ).join('\n');
    
    const choice = prompt(`Compartilhar via:\n\n${options}\n\nDigite o número da opção (1-${shareMenu.length}):`);
    
    if (choice) {
      const index = parseInt(choice) - 1;
      if (index >= 0 && index < shareMenu.length) {
        const selectedOption = shareMenu[index];
        handleShare(selectedOption.type);
        
        // Abrir links específicos de redes sociais
        const postUrl = `${window.location.origin}/blog/${post.slug}`;
        const encodedUrl = encodeURIComponent(postUrl);
        const encodedTitle = encodeURIComponent(post.title);
        
        switch (selectedOption.type) {
          case 'facebook':
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
            break;
          case 'twitter':
            window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, '_blank');
            break;
          case 'whatsapp':
            window.open(`https://wa.me/?text=${encodedTitle} ${encodedUrl}`, '_blank');
            break;
          case 'telegram':
            window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, '_blank');
            break;
          case 'email':
            window.location.href = `mailto:?subject=${encodedTitle}&body=Confira este post: ${postUrl}`;
            break;
        }
      }
    }
  };

  return (
    <div className="flex items-center gap-6 py-4 border-t border-gray-200">
      {/* Botão de Curtir */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLike}
        disabled={isLoading}
        className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-gray-600'} hover:text-red-500`}
      >
        <Heart 
          className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} 
        />
        <span>{likesCount}</span>
        <span className="hidden sm:inline">
          {likesCount === 1 ? 'Curtida' : 'Curtidas'}
        </span>
      </Button>

      {/* Botão de Compartilhar */}
      <Button
        variant="ghost"
        size="sm"
        onClick={openShareDialog}
        disabled={isLoading}
        className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
      >
        <Share2 className="h-5 w-5" />
        <span>{sharesCount}</span>
        <span className="hidden sm:inline">
          {sharesCount === 1 ? 'Compartilhamento' : 'Compartilhamentos'}
        </span>
      </Button>

      {/* Botão de Comentários */}
      {showComments && (
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-2 text-gray-600 hover:text-green-500"
          onClick={() => {
            const commentsSection = document.getElementById('comments-section');
            if (commentsSection) {
              commentsSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <MessageCircle className="h-5 w-5" />
          <span>{post.comments_count}</span>
          <span className="hidden sm:inline">
            {post.comments_count === 1 ? 'Comentário' : 'Comentários'}
          </span>
        </Button>
      )}

      {/* Indicador de usuários que curtiram */}
      {likesCount > 0 && (
        <div className="flex items-center gap-1 text-sm text-gray-500 ml-auto">
          <Users className="h-4 w-4" />
          <span>
            {isLiked && likesCount === 1 
              ? 'Você curtiu'
              : isLiked 
                ? `Você e mais ${likesCount - 1} pessoas curtiram`
                : `${likesCount} ${likesCount === 1 ? 'pessoa curtiu' : 'pessoas curtiram'}`
            }
          </span>
        </div>
      )}
    </div>
  );
};

export default SocialInteractions;
