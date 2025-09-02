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
  created_at?: string;
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
  const [shareStatus, setShareStatus] = useState<Record<string, 'idle' | 'loading' | 'done'>>({});
  const [copyAnimating, setCopyAnimating] = useState(false);

  const socialColors: Record<string, string> = {
    whatsapp: 'bg-green-600 hover:bg-green-700 text-white',
    facebook: 'bg-blue-600 hover:bg-blue-700 text-white',
    twitter: 'bg-sky-500 hover:bg-sky-600 text-white',
    telegram: 'bg-[#2AABEE] hover:brightness-90 text-white',
    email: 'bg-gray-700 hover:bg-gray-800 text-white',
    other: 'bg-neutral-50 hover:bg-neutral-100 text-foreground border',
  };

  const SocialIcon = ({ type }: { type: string }) => {
    switch (type) {
      case 'whatsapp':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M21.7 2.3C19.6.2 16.6-.2 13.9.6 9.7 1.8 6.3 5.1 5.2 9.3 4.5 12 4.9 15 7 17.6L3 21.6l4-1.1c2.5 1.6 5.6 1.8 8.3.5 4.2-1.9 6.8-6.3 5.6-10.7C22.1 7.8 21.7 4.8 21.7 2.3z" fill="currentColor"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="M22 12a10 10 0 1 0-11.5 9.9v-7h-2.2V12h2.2V9.7c0-2.2 1.3-3.4 3.3-3.4.9 0 1.8.1 1.8.1v2h-1c-1 0-1.3.6-1.3 1.3V12h2.2l-.4 2.9h-1.8v7A10 10 0 0 0 22 12"/>
          </svg>
        );
      case 'twitter':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.3 4.3 0 0 0 1.88-2.37 8.6 8.6 0 0 1-2.73 1.04 4.28 4.28 0 0 0-7.3 3.9A12.14 12.14 0 0 1 3.15 4.6a4.28 4.28 0 0 0 1.33 5.71c-.66 0-1.28-.2-1.82-.5v.05c0 2.06 1.46 3.78 3.4 4.17-.36.1-.74.17-1.13.17-.28 0-.56-.03-.83-.08a4.3 4.3 0 0 0 4 2.98A8.6 8.6 0 0 1 2 19.54a12.1 12.1 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2v-.56A8.7 8.7 0 0 0 22.46 6z"/>
          </svg>
        );
      case 'telegram':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.2 7.2l-1.6 7.3c-.1.5-.4.6-.8.4l-2.2-1.6-1-1-2.6-1.6c-.5-.3-.5-.6 0-.9L15 8.3c.5-.3.9 0 .6.9z"/>
          </svg>
        );
      case 'email':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 4h16v16H4z" />
            <path d="M22 6l-10 7L2 6" />
          </svg>
        );
      case 'other':
      default:
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 13a5 5 0 0 0 7.07 0l2.83-2.83A5 5 0 0 0 14.83 3.1L12 5.9" />
            <path d="M14 11a5 5 0 0 0-7.07 0L4.1 13.9A5 5 0 0 0 9.17 20.9L12 18.1" />
          </svg>
        );
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
              {['whatsapp','facebook','twitter','telegram','email','other'].map((type) => (
                <Button
                  key={type}
                  onClick={async () => {
                    setShareStatus(prev => ({ ...prev, [type]: 'loading' }));
                    try {
                      await openSocialShare(type);
                      setShareStatus(prev => ({ ...prev, [type]: 'done' }));
                      // small optimistic UI increment for shares count handled by API response
                      setTimeout(() => setShareStatus(prev => ({ ...prev, [type]: 'idle' })), 1800);
                      if (type === 'other') {
                        setCopyAnimating(true);
                        setTimeout(() => setCopyAnimating(false), 900);
                      }
                    } catch (e) {
                      setShareStatus(prev => ({ ...prev, [type]: 'idle' }));
                    }
                  }}
                  className={`flex items-center justify-center gap-2 ${socialColors[type] || ''} w-full py-2 px-3 rounded-md`}
                >
                  <span className="inline-flex items-center">
                    <SocialIcon type={type} />
                  </span>
                  <span className="text-sm">
                    {type === 'other' ? (copyAnimating ? 'Copiado' : 'Copiar') : type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                  {/* small status */}
                  {shareStatus[type] === 'loading' && <span className="ml-2 animate-pulse text-xs">..</span>}
                  {shareStatus[type] === 'done' && <span className="ml-2 text-xs">✓</span>}
                </Button>
              ))}
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
