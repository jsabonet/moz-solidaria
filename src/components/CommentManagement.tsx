import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Trash2, 
  MessageCircle, 
  Search, 
  Filter,
  MoreHorizontal,
  Calendar,
  User,
  Mail,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { 
  Comment, 
  fetchComments, 
  approveComment, 
  rejectComment, 
  deleteComment, 
  bulkCommentAction 
} from '@/lib/api';

interface CommentStats {
  total: number;
  approved: number;
  pending: number;
}

const CommentManagement: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComments, setSelectedComments] = useState<number[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<CommentStats>({ total: 0, approved: 0, pending: 0 });

  useEffect(() => {
    loadComments();
  }, [currentPage, statusFilter]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        loadComments();
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await fetchComments({
        status: statusFilter,
        page: currentPage,
        search: searchTerm || undefined,
      });

      setComments(response.results || response);
      setTotalPages(Math.ceil((response.count || response.length) / 20));
      
      // Calcular estatísticas
      const allComments = await fetchComments({ status: 'all' });
      const allCommentsData = allComments.results || allComments;
      
      setStats({
        total: allCommentsData.length,
        approved: allCommentsData.filter((c: Comment) => c.is_approved).length,
        pending: allCommentsData.filter((c: Comment) => !c.is_approved).length,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os comentários.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectComment = (commentId: number, checked: boolean) => {
    if (checked) {
      setSelectedComments([...selectedComments, commentId]);
    } else {
      setSelectedComments(selectedComments.filter(id => id !== commentId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && Array.isArray(comments)) {
      setSelectedComments(comments.filter(c => c && c.id).map(c => c.id));
    } else {
      setSelectedComments([]);
    }
  };

  const handleApprove = async (commentId: number) => {
    try {
      await approveComment(commentId);
      toast({
        title: "Sucesso",
        description: "Comentário aprovado com sucesso.",
      });
      loadComments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível aprovar o comentário.",
      });
    }
  };

  const handleReject = async (commentId: number) => {
    try {
      await rejectComment(commentId);
      toast({
        title: "Sucesso",
        description: "Comentário rejeitado com sucesso.",
      });
      loadComments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível rejeitar o comentário.",
      });
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      toast({
        title: "Sucesso",
        description: "Comentário excluído com sucesso.",
      });
      loadComments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o comentário.",
      });
    }
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedComments.length === 0) {
      toast({
        title: "Atenção",
        description: "Selecione pelo menos um comentário.",
      });
      return;
    }

    try {
      await bulkCommentAction(action, selectedComments);
      const actionText = action === 'approve' ? 'aprovados' : 
                        action === 'reject' ? 'rejeitados' : 'excluídos';
      
      toast({
        title: "Sucesso",
        description: `${selectedComments.length} comentários ${actionText} com sucesso.`,
      });
      
      setSelectedComments([]);
      loadComments();
    } catch (error) {
      toast({
        title: "Erro",
        description: `Não foi possível executar a ação em massa.`,
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não disponível';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Comentários</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <Card>
        <CardHeader>
          <CardTitle>Gestão de Comentários</CardTitle>
          <CardDescription>
            Gerencie os comentários do blog - aprovação, rejeição e exclusão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar comentários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="approved">Aprovados</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Ações em massa */}
          {selectedComments.length > 0 && (
            <div className="flex gap-2 mb-4 p-3 bg-muted rounded-md">
              <span className="text-sm text-muted-foreground">
                {selectedComments.length} comentário(s) selecionado(s)
              </span>
              <div className="flex gap-2 ml-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('approve')}
                >
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Aprovar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkAction('reject')}
                >
                  <XCircle className="mr-1 h-3 w-3" />
                  Rejeitar
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="mr-1 h-3 w-3" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja excluir {selectedComments.length} comentário(s)? 
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleBulkAction('delete')}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Excluir
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}

          {/* Tabela de comentários */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={Array.isArray(comments) && selectedComments.length === comments.length && comments.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Comentário</TableHead>
                  <TableHead>Autor</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="w-20">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Carregando comentários...
                    </TableCell>
                  </TableRow>
                ) : !Array.isArray(comments) || comments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Nenhum comentário encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  comments.filter(comment => comment && comment.id).map((comment) => (
                    <TableRow key={comment.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedComments.includes(comment.id)}
                          onCheckedChange={(checked) => handleSelectComment(comment.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="max-w-md">
                        <div className="truncate">{comment.content || 'Sem conteúdo'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{comment.author_name || 'Autor desconhecido'}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {comment.author_email || 'Email não informado'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {comment.post?.title || 'Post não encontrado'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={comment.is_approved ? "default" : "secondary"}
                          className={comment.is_approved ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}
                        >
                          {comment.is_approved ? 'Aprovado' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {formatDate(comment.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!comment.is_approved && (
                              <DropdownMenuItem onClick={() => handleApprove(comment.id)}>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Aprovar
                              </DropdownMenuItem>
                            )}
                            {comment.is_approved && (
                              <DropdownMenuItem onClick={() => handleReject(comment.id)}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Rejeitar
                              </DropdownMenuItem>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(comment.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Excluir
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Página {currentPage} de {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CommentManagement;
