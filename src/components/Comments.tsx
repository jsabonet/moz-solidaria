import React, { useState, useEffect } from 'react';
import { MessageCircle, Reply, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

// Função auxiliar para obter token
const getToken = () => localStorage.getItem('authToken');

interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    first_name?: string;
    last_name?: string;
  } | null;
  author_name: string;
  author_email: string;
  created_at: string;
  updated_at: string;
  is_approved: boolean;
  replies: Comment[];
  parent?: number;
}

interface CommentsProps {
  postSlug: string;
  commentsCount: number;
  onCommentsUpdate?: (count: number) => void;
}

const Comments: React.FC<CommentsProps> = ({ 
  postSlug, 
  commentsCount, 
  onCommentsUpdate 
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true); // Inicia como true para carregar automaticamente
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    content: '',
    author_name: user?.first_name && user?.last_name 
      ? `${user.first_name} ${user.last_name}` 
      : user?.username || '',
    author_email: user?.email || '',
    parent: null as number | null,
  });

  // Carregar comentários automaticamente quando o componente for montado
  useEffect(() => {
    fetchComments();
  }, [postSlug]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        author_name: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}` 
          : user.username,
        author_email: user.email,
      }));
    }
  }, [user]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/blog/posts/${postSlug}/comments/`);
      if (response.ok) {
        const data = await response.json();
        const allComments = data.results || data;
        // Filtrar apenas comentários aprovados
        const approvedComments = allComments.filter((comment: Comment) => comment.is_approved);
        setComments(approvedComments);
        
        // Atualizar contador se a função for fornecida
        if (onCommentsUpdate) {
          onCommentsUpdate(approvedComments.length);
        }
      } else {
        throw new Error('Erro ao carregar comentários');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os comentários.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.content.trim()) {
      toast({
        title: "Erro",
        description: "O comentário não pode estar vazio.",
      });
      return;
    }

    if (!user && (!formData.author_name.trim() || !formData.author_email.trim())) {
      toast({
        title: "Erro",
        description: "Nome e email são obrigatórios para comentar.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = getToken();
      const response = await fetch(`http://localhost:8000/api/v1/blog/posts/${postSlug}/comments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          content: formData.content.trim(),
          author_name: formData.author_name.trim(),
          author_email: formData.author_email.trim(),
          ...(formData.parent && { parent: formData.parent }),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Sucesso",
          description: data.message || "Comentário enviado! Aguarde a aprovação.",
        });
        
        // Reset form
        setFormData(prev => ({
          ...prev,
          content: '',
          parent: null,
        }));
        setShowForm(false);
        setReplyingTo(null);
        
        // Refresh comments (que já atualizará o contador via onCommentsUpdate)
        fetchComments();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao enviar comentário');
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível enviar o comentário.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = (commentId: number) => {
    setReplyingTo(commentId);
    setFormData(prev => ({ ...prev, parent: commentId }));
    setShowForm(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <Card key={comment.id} className={`${isReply ? 'ml-8 mt-4' : 'mb-4'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-sm">
                {comment.author?.first_name && comment.author?.last_name 
                  ? `${comment.author.first_name} ${comment.author.last_name}`
                  : comment.author?.username || comment.author_name
                }
              </span>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {formatDate(comment.created_at)}
              </div>
            </div>
            
            <div className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">
              {comment.content}
            </div>
            
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReply(comment.id)}
                className="text-xs text-blue-600 hover:text-blue-800 p-0 h-auto"
              >
                <Reply className="h-3 w-3 mr-1" />
                Responder
              </Button>
            )}
          </div>
        </div>
        
        {/* Renderizar respostas */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div id="comments-section" className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Comentários ({commentsCount})
        </h3>
        
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            variant="outline"
            size="sm"
          >
            Comentar
          </Button>
        )}
      </div>

      {/* Formulário de comentário */}
      {showForm && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {replyingTo && (
                <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                  Respondendo ao comentário...
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setFormData(prev => ({ ...prev, parent: null }));
                    }}
                    className="ml-2 h-auto p-0 text-red-500"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
              
              {/* Campos de nome e email para usuários não logados */}
              {!user && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nome *
                    </label>
                    <input
                      type="text"
                      value={formData.author_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, author_name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.author_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, author_email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  Comentário *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                  placeholder="Escreva seu comentário..."
                  required
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  size="sm"
                >
                  {submitting ? 'Enviando...' : 'Enviar comentário'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowForm(false);
                    setReplyingTo(null);
                    setFormData(prev => ({ ...prev, content: '', parent: null }));
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de comentários */}
      <div>
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Carregando comentários...</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando comentários...</p>
          </div>
        )}

        {!loading && comments.length === 0 && (
          <div className="text-center py-8">
            <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">
              Ainda não há comentários. Seja o primeiro a comentar!
            </p>
          </div>
        )}

        {!loading && comments.length > 0 && (
          <div>
            {comments.map(comment => renderComment(comment))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Comments;
