import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Edit, Tag, Trash2, Eye, Calendar, TrendingUp, Copy, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { BlogPost, Category, fetchPosts, fetchCategories, deletePost, duplicatePost } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminDonations from '@/components/AdminDonations';
import DonationDetails from '@/components/DonationDetails';
import NotificationTest from '@/components/NotificationTest';
import {
  BarChart3,
  Users,
  FileText,
  Heart,
  Settings,
  DollarSign,
  MapPin,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  Bell,
} from 'lucide-react';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDonation, setSelectedDonation] = useState<any>(null);

  // Mock data for stats
  const stats = {
    totalVisitors: 15420,
    blogPosts: 24,
    donations: 156,
    projects: 12,
    volunteers: 89,
    communities: 25,
  };

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      window.history.replaceState({}, document.title);
      setTimeout(() => setMessage(null), 5000);
    }
  }, [location.state]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [postsData, categoriesData] = await Promise.all([
        fetchPosts(),
        fetchCategories(),
      ]);

      setPosts(Array.isArray(postsData) ? postsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setPosts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postSlug: string) => {
    try {
      await deletePost(postSlug);
      setPosts(Array.isArray(posts) ? posts.filter((post) => post.slug !== postSlug) : []);
    } catch (error) {
      console.error('Erro ao deletar post:', error);
    }
  };

  const handleDuplicatePost = async (postSlug: string) => {
    try {
      const result = await duplicatePost(postSlug);
      
      // Refresh posts list
      await loadData();
      
      toast.success('Post duplicado com sucesso!');
      
      // Optional: Navigate to edit the duplicated post
      // navigate(`/dashboard/posts/edit/${result.duplicated_post.slug}`);
      
    } catch (error: any) {
      console.error('Erro ao duplicar post:', error);
      toast.error(error.message || 'Erro ao duplicar post');
    }
  };

  const handleViewDonationDetails = (donation: any) => {
    setSelectedDonation(donation);
    setActiveTab('donation-details');
  };

  const handleBackToDonations = () => {
    setSelectedDonation(null);
    setActiveTab('donations');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  const publishedPosts = Array.isArray(posts) ? posts.filter((post) => post.is_published) : [];
  const draftPosts = Array.isArray(posts) ? posts.filter((post) => !post.is_published) : [];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="flex h-14 md:h-16 items-center px-3 md:px-6">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <h1 className="text-sm md:text-xl font-bold hidden sm:block">MOZ SOLIDÁRIA - Dashboard</h1>
              <h1 className="text-sm font-bold sm:hidden">MOZ Dashboard</h1>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-2 md:space-x-4">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Eye className="h-4 w-4 mr-2" />
              Ver Site
            </Button>
            <Button variant="outline" size="sm" className="md:hidden px-2">
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" className="hidden md:flex">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
            <Button size="sm" className="md:hidden px-2">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3 md:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-6 h-auto p-1">
            <TabsTrigger value="overview" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
              <BarChart3 className="h-4 w-4 md:h-4 md:w-4" />
              <span className="hidden sm:block">Visão Geral</span>
              <span className="sm:hidden text-xs">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="blog" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
              <FileText className="h-4 w-4 md:h-4 md:w-4" />
              <span>Blog</span>
            </TabsTrigger>
            <TabsTrigger value="donations" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
              <DollarSign className="h-4 w-4 md:h-4 md:w-4" />
              <span className="hidden sm:block">Doações</span>
              <span className="sm:hidden text-xs">Doar</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
              <Users className="h-4 w-4 md:h-4 md:w-4" />
              <span className="hidden sm:block">Comunidade</span>
              <span className="sm:hidden text-xs">Com</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
              <Settings className="h-4 w-4 md:h-4 md:w-4" />
              <span className="hidden sm:block">Configurações</span>
              <span className="sm:hidden text-xs">Config</span>
            </TabsTrigger>
            <TabsTrigger value="notifications-test" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
              <Bell className="h-4 w-4 md:h-4 md:w-4" />
              <span className="hidden sm:block">Teste Notif</span>
              <span className="sm:hidden text-xs">Notif</span>
            </TabsTrigger>
            {selectedDonation && (
              <TabsTrigger value="donation-details" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
                <Eye className="h-4 w-4 md:h-4 md:w-4" />
                <span className="hidden sm:block">Detalhes</span>
                <span className="sm:hidden text-xs">Det</span>
              </TabsTrigger>
            )}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total de Visitantes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalVisitors}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Posts no Blog</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.blogPosts}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Doações Recebidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.donations}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.projects}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Voluntários</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.volunteers}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Comunidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.communities}</div>
                </CardContent>
              </Card>
            </div>
            {/* Charts and Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
              {/* ...existing code for charts and recent activity... */}
            </div>
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog" className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold">Gerenciar Blog</h2>
              <Button size="sm" className="w-full sm:w-auto" asChild>
                <Link to="/dashboard/posts/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Post
                </Link>
              </Button>
            </div>
            {Array.isArray(posts) && posts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell className="font-medium">{post.title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {typeof post.category === 'object' && post.category
                            ? post.category.name
                            : typeof post.category === 'string' && post.category
                              ? post.category
                              : 'Sem categoria'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={post.is_published ? "default" : "secondary"}>
                          {post.is_published ? 'Publicado' : 'Rascunho'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {post.author?.username || post.author?.full_name || 'Autor'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {post.published_at
                              ? new Date(post.published_at).toLocaleDateString('pt-BR')
                              : new Date(post.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/dashboard/posts/edit/${post.slug}`}>
                              <Edit className="h-3 w-3" />
                            </Link>
                          </Button>
                          
                          {/* Duplicate Button */}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDuplicatePost(post.slug)}
                            title="Duplicar post"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Deletar Post</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja deletar o post "{post.title}"? 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDeletePost(post.slug)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Nenhum post encontrado</p>
                <Button asChild>
                  <Link to="/dashboard/posts/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeiro Post
                  </Link>
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations" className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold">Gestão de Doações</h2>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
            
            <AdminDonations onViewDetails={handleViewDonationDetails} />
          </TabsContent>

          {/* Donation Details Tab */}
          {selectedDonation && (
            <TabsContent value="donation-details" className="space-y-4 md:space-y-6">
              <DonationDetails
                donationId={selectedDonation.id}
                onBack={handleBackToDonations}
              />
            </TabsContent>
          )}

          {/* Community Tab - Gestão do Portal de Comunidade */}
          <TabsContent value="community" className="space-y-4 md:space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Portal de Comunidade</h2>
              <p className="text-muted-foreground">Gestão administrativa do Portal de Comunidade para usuários não-admin</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              {/* Estatísticas da Comunidade */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Doadores Ativos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.volunteers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Usuários com perfil doador
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Voluntários</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.communities || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Usuários voluntários ativos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Doações</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.donations || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Via Portal de Comunidade
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Gestão de Usuários */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Gestão de Usuários</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Controle administrativo dos usuários do Portal de Comunidade
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <Users className="h-4 w-4 mr-2" />
                      Visualizar Doadores (Em breve)
                    </Button>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <Heart className="h-4 w-4 mr-2" />
                      Gerenciar Voluntários (Em breve)
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Relatórios */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Relatórios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Análises e estatísticas do Portal de Comunidade
                  </p>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Relatório de Atividades (Em breve)
                    </Button>
                    <Button variant="outline" className="w-full justify-start" disabled>
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analytics da Comunidade (Em breve)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4 md:space-y-6">
            <h2 className="text-xl md:text-2xl font-bold">Configurações do Sistema</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <Card>
                <CardHeader className="pb-3 md:pb-6">
                  <CardTitle className="text-sm md:text-base">Gestão de Conteúdo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4 pt-0">
                  <Link to="/dashboard/categories">
                    <Button variant="outline" className="w-full justify-start">
                      <Tag className="h-4 w-4 mr-2" />
                      Gerenciar Categorias
                    </Button>
                  </Link>
                  <Link to="/dashboard/comments">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Gerenciar Comentários
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <FileText className="h-4 w-4 mr-2" />
                    Gerenciar Tags
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Users className="h-4 w-4 mr-2" />
                    Gerenciar Usuários
                  </Button>
                </CardContent>
              </Card>

              {/* ...existing configuration cards... */}
            </div>
          </TabsContent>

          {/* Notifications Test Tab */}
          <TabsContent value="notifications-test" className="space-y-4 md:space-y-6">
            <NotificationTest />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
