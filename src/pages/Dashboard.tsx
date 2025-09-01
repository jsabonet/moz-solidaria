import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit, Tag, Trash2, Eye, Calendar, TrendingUp, Copy, MessageCircle, Heart, Settings, DollarSign, MapPin, Bell, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/hooks/use-auth';
import { PermissionGate } from '@/components/PermissionGate';
import { BlogPost, Category, fetchPosts, fetchCategories, deletePost, duplicatePost } from '@/lib/api';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminDonations from '@/components/AdminDonations';
import DonationDetails from '@/components/DonationDetails';
import ProjectManagement from '@/components/ProjectManagement';
import ProjectCategoryManagement from '@/components/admin/ProjectCategoryManagement';
import PartnerCommunication from '@/components/PartnerCommunicationUpdated';
import VolunteerManagement from '@/components/admin/VolunteerManagement';
import BeneficiaryManagement from '@/components/admin/BeneficiaryManagement';
import UserManagement from '@/components/admin/UserManagement';
import ReportsCenter from '@/components/reports/ReportsCenter';
import AdvancedStats from '@/components/reports/AdvancedStats';
import ExportButton from '@/components/reports/ExportButton';
import {
  BarChart3,
  Users,
  FileText,
  Download,
  Filter,
  Search,
  MoreHorizontal,
  PieChart,
} from 'lucide-react';
import { toast } from 'sonner';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeCommunityTab, setActiveCommunityTab] = useState('overview');
  const [selectedDonation, setSelectedDonation] = useState<any>(null);

  // Detectar a rota e definir as abas ativas
  useEffect(() => {
    const path = location.pathname;
    
    // Rotas da comunidade
    if (path.startsWith('/dashboard/community')) {
      setActiveTab('community');
      if (path === '/dashboard/community' || path === '/dashboard/community/') {
        setActiveCommunityTab('overview');
      } else {
        const communitySection = path.split('/dashboard/community/')[1];
        if (communitySection) {
          setActiveCommunityTab(communitySection);
        }
      }
    }
    // Rotas das abas principais
    else if (path === '/dashboard/overview') {
      setActiveTab('overview');
    }
    else if (path === '/dashboard/blog') {
      setActiveTab('blog');
    }
    else if (path === '/dashboard/projects') {
      setActiveTab('projects');
    }
    else if (path === '/dashboard/reports') {
      setActiveTab('reports');
    }
    else if (path === '/dashboard/users') {
      setActiveTab('users');
    }
    else if (path === '/dashboard/settings') {
      setActiveTab('settings');
    }
    else if (path === '/dashboard/project-categories') {
      setActiveTab('project-categories');
    }
    // Rota principal do dashboard (redirecionar para overview)
    else if (path === '/dashboard' || path === '/dashboard/') {
      navigate('/dashboard/overview', { replace: true });
    }
  }, [location.pathname]);

  // Função para navegar para sub-abas da comunidade
  const navigateToCommunityTab = (tab: string) => {
    if (tab === 'overview') {
      navigate('/dashboard/community');
    } else {
      navigate(`/dashboard/community/${tab}`);
    }
  };

  // Função para navegar entre as abas principais
  const navigateToMainTab = (tab: string) => {
    if (tab === 'overview') {
      navigate('/dashboard/overview');
    } else if (tab === 'community') {
      navigate('/dashboard/community');
    } else if (tab === 'project-categories') {
      navigate('/dashboard/project-categories');
    } else if (tab === 'reports') {
      navigate('/dashboard/reports');
    } else {
      navigate(`/dashboard/${tab}`);
    }
  };

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

  // Função para navegar para o site principal
  const handleViewSite = () => {
    try {
      // URL do site principal - pode ser configurada via variável de ambiente
      const siteUrl = import.meta.env.VITE_SITE_URL || 'https://mozsolidaria.org' || 'http://localhost:3000';
      
      // Validar se é uma URL válida
      new URL(siteUrl);
      
      // Abrir em nova aba
      window.open(siteUrl, '_blank', 'noopener,noreferrer');
      
      // Feedback visual
      toast.success(`🌐 Abrindo site principal: ${siteUrl}`, {
        duration: 2000,
      });
      
      // Log para debug
      console.log('🌐 Navegando para o site principal:', siteUrl);
      
    } catch (error) {
      console.error('❌ Erro ao abrir site principal:', error);
      toast.error('❌ Erro ao abrir o site principal. Verifique a configuração da URL.', {
        duration: 4000,
      });
    }
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
            {/* User Info */}
            <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
              <span>Olá, {user?.username || 'Admin'}</span>
              <Badge variant="secondary" className="text-xs">
                {user?.groups?.[0] || 'Usuário'}
              </Badge>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden md:flex"
              onClick={handleViewSite}
              title="Abrir site principal em nova aba"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Site
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="md:hidden px-2"
              onClick={handleViewSite}
              title="Abrir site principal em nova aba"
            >
              <Eye className="h-4 w-4" />
            </Button>
            
            <PermissionGate permissions={['system.manage_settings']}>
              {/* <Button size="sm" className="hidden md:flex">
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button> */}
              <Button size="sm" className="md:hidden px-2">
                <Settings className="h-4 w-4" />
              </Button>
            </PermissionGate>
            
            <Button variant="destructive" size="sm" onClick={logout} className="hidden md:flex">
              Sair
            </Button>
          </div>
        </div>
      </div>

      <div className="p-3 md:p-6">
        <Tabs value={activeTab} onValueChange={navigateToMainTab} className="space-y-4 md:space-y-6">
          <TabsList className="grid w-full grid-cols-7 h-auto p-1">
            <PermissionGate permissions={['view.all']}>
              <TabsTrigger value="overview" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
                <BarChart3 className="h-4 w-4 md:h-4 md:w-4" />
                <span className="hidden sm:block">Visão Geral</span>
                <span className="sm:hidden text-xs">Geral</span>
              </TabsTrigger>
            </PermissionGate>
            
            <PermissionGate permissions={['blog.view', 'blog.create']}>
              <TabsTrigger value="blog" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
                <FileText className="h-4 w-4 md:h-4 md:w-4" />
                <span>Blog</span>
              </TabsTrigger>
            </PermissionGate>
            
            <PermissionGate permissions={['projects.view', 'projects.create']}>
              <TabsTrigger value="projects" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
                <MapPin className="h-4 w-4 md:h-4 md:w-4" />
                <span className="hidden sm:block">Projetos</span>
                <span className="sm:hidden text-xs">Proj</span>
              </TabsTrigger>
            </PermissionGate>
            
            <PermissionGate permissions={['community.view', 'volunteers.view', 'beneficiaries.view']}>
              <TabsTrigger value="community" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
                <Users className="h-4 w-4 md:h-4 md:w-4" />
                <span className="hidden sm:block">Comunidade</span>
                <span className="sm:hidden text-xs">Com</span>
              </TabsTrigger>
            </PermissionGate>

            <PermissionGate role="super_admin" fallback={null}>
              <TabsTrigger value="users" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
                <UserCheck className="h-4 w-4 md:h-4 md:w-4" />
                <span className="hidden sm:block">Usuários</span>
                <span className="sm:hidden text-xs">Users</span>
              </TabsTrigger>
            </PermissionGate>
            
            <PermissionGate permissions={['view.all']}>
              <TabsTrigger value="reports" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
                <PieChart className="h-4 w-4 md:h-4 md:w-4" />
                <span className="hidden sm:block">Relatórios</span>
                <span className="sm:hidden text-xs">Rel</span>
              </TabsTrigger>
            </PermissionGate>
            
            <PermissionGate role="super_admin">
              <TabsTrigger value="settings" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
                <Settings className="h-4 w-4 md:h-4 md:w-4" />
                <span className="hidden sm:block">Configurações</span>
                <span className="sm:hidden text-xs">Config</span>
              </TabsTrigger>
            </PermissionGate>
            
            {activeTab === 'project-categories' && (
              <PermissionGate permissions={['project-categories.view']}>
                <TabsTrigger value="project-categories" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
                  <Tag className="h-4 w-4 md:h-4 md:w-4" />
                  <span className="hidden sm:block">Cat. Projetos</span>
                  <span className="sm:hidden text-xs">Cat</span>
                </TabsTrigger>
              </PermissionGate>
            )}
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
            {/* User Info Card */}
            <Card className="bg-gradient-to-r from-primary/10 to-secondary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Informações do Usuário
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome do Usuário</p>
                    <p className="font-medium">{user?.username || 'Administrador'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Grupos</p>
                    <div className="flex flex-wrap gap-1">
                      {user?.groups?.map((group: string) => (
                        <Badge key={group} variant="secondary" className="text-xs">
                          {group}
                        </Badge>
                      )) || <Badge variant="outline">Nenhum grupo</Badge>}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Permissões</p>
                    <p className="font-medium">{user?.permissions?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Stats Cards */}
            {/* <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              <PermissionGate permissions={['system.view_dashboard']}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Total de Visitantes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalVisitors}</div>
                  </CardContent>
                </Card>
              </PermissionGate>
              
              <PermissionGate permissions={['blog.view_posts']}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Posts no Blog</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.blogPosts}</div>
                  </CardContent>
                </Card>
              </PermissionGate>
              
              <PermissionGate permissions={['donations.view_all']}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Doações Recebidas</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.donations}</div>
                  </CardContent>
                </Card>
              </PermissionGate>
              
              <PermissionGate permissions={['projects.view_all']}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.projects}</div>
                  </CardContent>
                </Card>
              </PermissionGate>
              
              <PermissionGate permissions={['community.view_volunteer_list']}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Voluntários</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.volunteers}</div>
                  </CardContent>
                </Card>
              </PermissionGate>
              
              <PermissionGate permissions={['community.view_community_list']}>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">Comunidades</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.communities}</div>
                  </CardContent>
                </Card>
              </PermissionGate>
            </div> */}
            {/* Charts and Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
              {/* ...existing code for charts and recent activity... */}
            </div>
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog" className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold">Gerenciar Blog</h2>
              <div className="flex space-x-2">
                <ExportButton 
                  data={Array.isArray(posts) ? posts : []} 
                  filename="blog-posts" 
                  type="blog" 
                  variant="outline" 
                  size="sm"
                />
                <Button size="sm" className="w-full sm:w-auto" asChild>
                  <Link to="/dashboard/posts/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Post
                  </Link>
                </Button>
              </div>
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

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4 md:space-y-6">
            <ProjectManagement />
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
              <p className="text-muted-foreground">Gestão administrativa do Portal de Comunidade</p>
            </div>
            
            {/* Sub-tabs for Community */}
            <Tabs value={activeCommunityTab} onValueChange={navigateToCommunityTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-5 h-auto p-1">
                <TabsTrigger value="overview" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
                  <BarChart3 className="h-4 w-4 md:h-4 md:w-4" />
                  <span className="hidden sm:block">Visão Geral</span>
                  <span className="sm:hidden text-xs">Geral</span>
                </TabsTrigger>
                <TabsTrigger value="donations" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
                  <DollarSign className="h-4 w-4 md:h-4 md:w-4" />
                  <span className="hidden sm:block">Doações</span>
                  <span className="sm:hidden text-xs">Doar</span>
                </TabsTrigger>
                <TabsTrigger value="partners" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
                  <Users className="h-4 w-4 md:h-4 md:w-4" />
                  <span className="hidden sm:block">Parcerias</span>
                  <span className="sm:hidden text-xs">Parc</span>
                </TabsTrigger>
                <TabsTrigger value="volunteers" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
                  <UserCheck className="h-4 w-4 md:h-4 md:w-4" />
                  <span className="hidden sm:block">Voluntários</span>
                  <span className="sm:hidden text-xs">Vol</span>
                </TabsTrigger>
                <TabsTrigger value="beneficiaries" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
                  <Heart className="h-4 w-4 md:h-4 md:w-4" />
                  <span className="hidden sm:block">Beneficiários</span>
                  <span className="sm:hidden text-xs">Benef</span>
                </TabsTrigger>
              </TabsList>

              {/* Community Overview */}
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {/* Estatísticas da Comunidade */}
                  {/* <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Doadores Ativos</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.donations || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Usuários com perfil doador
                      </p>
                    </CardContent>
                  </Card> */}

                  {/* <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Voluntários</CardTitle>
                      <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.volunteers || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Usuários voluntários ativos
                      </p>
                    </CardContent>
                  </Card> */}

                  {/* <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Beneficiários</CardTitle>
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.communities || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Beneficiários cadastrados
                      </p>
                    </CardContent>
                  </Card> */}

                  {/* <Card>
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
                  </Card> */}

                  {/* <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Parcerias Ativas</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.projects || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Organizações parceiras
                      </p>
                    </CardContent>
                  </Card> */}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                  {/* Gestão de Usuários */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Acesso Rápido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        Acesso rápido às principais funcionalidades da comunidade
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          className="justify-start" 
                          onClick={() => navigateToCommunityTab('donations')}
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Doações
                        </Button>
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => navigateToCommunityTab('volunteers')}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Voluntários
                        </Button>
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => navigateToCommunityTab('beneficiaries')}
                        >
                          <Heart className="h-4 w-4 mr-2" />
                          Beneficiários
                        </Button>
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => navigateToCommunityTab('partners')}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Parcerias
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

              {/* Donations Sub-tab */}
              <TabsContent value="donations" className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <h3 className="text-lg md:text-xl font-bold">Gestão de Doações</h3>
                  <div className="flex space-x-2">
                    <ExportButton 
                      data={[]} 
                      filename="doacoes" 
                      type="donations" 
                      variant="outline" 
                      size="sm"
                    />
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

              {/* Partners Sub-tab */}
              <TabsContent value="partners" className="space-y-4">
                <h3 className="text-lg md:text-xl font-bold">Gestão de Parcerias</h3>
                <PartnerCommunication />
              </TabsContent>

              {/* Volunteers Sub-tab */}
              <TabsContent value="volunteers" className="space-y-4">
                <h3 className="text-lg md:text-xl font-bold">Gestão de Voluntários</h3>
                <VolunteerManagement />
              </TabsContent>

              {/* Beneficiaries Sub-tab */}
              <TabsContent value="beneficiaries" className="space-y-4">
                {/* <h3 className="text-lg md:text-xl font-bold">Gestão de Beneficiários</h3> */}
                <BeneficiaryManagement />
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Users Tab - Gerenciamento de Usuários */}
          <PermissionGate permissions={['user.manage_all']} fallback={
            <TabsContent value="users" className="space-y-4 md:space-y-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-gray-600">
                    Você não tem permissão para acessar o gerenciamento de usuários.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          }>
            <TabsContent value="users" className="space-y-4 md:space-y-6">
              <UserManagement />
            </TabsContent>
          </PermissionGate>

          {/* Reports Tab - Centro de Relatórios */}
          <TabsContent value="reports" className="space-y-4 md:space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold mb-2">Centro de Relatórios e Analytics</h2>
              <p className="text-muted-foreground">Sistema completo de relatórios, exportações e análises estatísticas</p>
            </div>
            
            {/* Sub-tabs for Reports */}
            <Tabs defaultValue="center" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3 h-auto p-1">
                <TabsTrigger value="area-exports" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
                  <FileText className="h-4 w-4 md:h-4 md:w-4" />
                  <span className="hidden sm:block">Centro de Relatórios</span>
                  <span className="sm:hidden text-xs">Centro</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
                  <PieChart className="h-4 w-4 md:h-4 md:w-4" />
                  <span className="hidden sm:block">Analytics Avançado</span>
                  <span className="sm:hidden text-xs">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="exports" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
                  <Download className="h-4 w-4 md:h-4 md:w-4" />
                  <span className="sm:hidden text-xs">Export</span>
                </TabsTrigger>
              </TabsList>

              {/* Centro de Relatórios */}
              <TabsContent value="area-exports" className="space-y-4">
                <ReportsCenter />
              </TabsContent>

              {/* Analytics Avançado */}
              <TabsContent value="analytics" className="space-y-4">
                <AdvancedStats />
              </TabsContent>

            </Tabs>
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
                      Gerenciar Categorias de blog
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigateToMainTab('project-categories')}
                  >
                    <Tag className="h-4 w-4 mr-2" />
                    Gerenciar Categorias de Projetos
                  </Button>
                  <Link to="/dashboard/comments">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Gerenciar Comentários
                    </Button>
                  </Link>
                  {/* <Button variant="outline" className="w-full justify-start" disabled>
                    <FileText className="h-4 w-4 mr-2" />
                    Gerenciar Tags
                  </Button> */}
                  {/* <Button variant="outline" className="w-full justify-start" disabled>
                    <Users className="h-4 w-4 mr-2" />
                    Gerenciar Usuários
                  </Button> */}
                </CardContent>
              </Card>

              {/* ...existing configuration cards... */}
            </div>
          </TabsContent>

          {/* Project Categories Tab */}
          <TabsContent value="project-categories" className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateToMainTab('settings')}
              >
                ← Voltar para Configurações
              </Button>
              <h2 className="text-xl md:text-2xl font-bold">Categorias de Projetos</h2>
            </div>
            <ProjectCategoryManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
