import React, { useState, useEffect } from 'react';
import { Heart, Share2, MessageCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import api from '@/lib/api';

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

    setIsLoading(true);
    try {
      const res = await api.post(`/blog/posts/${post.slug}/like/`);
      const data = res.data;
      setIsLiked(data.is_liked);
      setLikesCount(data.likes_count);

      toast({ title: 'Sucesso', description: data.message });

      if (onUpdate) {
        // send only changed fields to avoid clobbering the full post object
        onUpdate({ is_liked_by_user: data.is_liked, likes_count: data.likes_count } as any);
      }
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível curtir o post. Tente novamente.' });
      console.error('Like error', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (shareType: string = 'other') => {
    setIsLoading(true);
    try {
      const res = await api.post(`/blog/posts/${post.slug}/share/`, { share_type: shareType });
      const data = res.data;
      setSharesCount(data.shares_count);

      toast({ title: 'Sucesso', description: data.message });

      if (onUpdate) {
        onUpdate({ shares_count: data.shares_count } as any);
      }

      // Copiar link para área de transferência
      const postUrl = `${window.location.origin}/blog/${post.slug}`;
      await navigator.clipboard.writeText(postUrl);

      toast({ title: 'Link copiado!', description: 'O link do post foi copiado para sua área de transferência.' });
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível compartilhar o post. Tente novamente.' });
      console.error('Share error', error);
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

  // Open a social share action and track it via API, plus optional network-specific navigation
  const openSocialShare = async (shareType: string) => {
    try {
      // Track share on backend and copy link when appropriate
      await handleShare(shareType);
    } catch (e) {
      // handleShare already shows toast
    }

    const postUrl = `${window.location.origin}/blog/${post.slug}`;
    const encodedUrl = encodeURIComponent(postUrl);
    const encodedTitle = encodeURIComponent(post.title);

    switch (shareType) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, '_blank');
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, '_blank');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodedTitle}&body=Confira este post: ${postUrl}`;
        break;
      case 'other':
      default:
        await navigator.clipboard.writeText(postUrl);
        toast({ title: 'Link copiado', description: 'O link foi copiado para a área de transferência.' });
        break;
    }
  };

  const [isShareOpen, setIsShareOpen] = useState(false);

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
      <Dialog open={isShareOpen} onOpenChange={setIsShareOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isLoading}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-500"
          >
            <Share2 className="h-5 w-5" />
            <span>{sharesCount}</span>
            <span className="hidden sm:inline">
              {sharesCount === 1 ? 'Compartilhamento' : 'Compartilhamentos'}
            </span>
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Compartilhar artigo</DialogTitle>
            <DialogDescription>
              Compartilhe este artigo com sua rede — escolha uma opção abaixo ou copie o link.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="font-semibold">{post.title}</div>
                <div className="text-sm text-muted-foreground">{new Date(post.created_at).toLocaleDateString('pt-BR')}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button onClick={() => openSocialShare('whatsapp')} className="w-full">WhatsApp</Button>
              <Button onClick={() => openSocialShare('facebook')} className="w-full">Facebook</Button>
              <Button onClick={() => openSocialShare('twitter')} className="w-full">Twitter</Button>
              <Button onClick={() => openSocialShare('telegram')} className="w-full">Telegram</Button>
              <Button onClick={() => openSocialShare('email')} className="w-full">E-mail</Button>
              <Button onClick={() => openSocialShare('other')} className="w-full">Copiar link</Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsShareOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
