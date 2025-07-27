import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Heart, 
  Settings, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  TrendingUp,
  DollarSign,
  Calendar,
  MapPin,
  Mail,
  Phone,
  Download,
  Filter,
  Search,
  MoreHorizontal
} from "lucide-react";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data - em produção seria conectado a uma API
  const stats = {
    totalVisitors: 15420,
    blogPosts: 24,
    donations: 156,
    projects: 12,
    volunteers: 89,
    communities: 25
  };

  const recentPosts = [
    {
      id: 1,
      title: "Transformando Vidas através da Educação",
      status: "published",
      views: 1245,
      date: "2024-01-15",
      author: "Maria Santos"
    },
    {
      id: 2,
      title: "Projeto de Agricultura Sustentável",
      status: "draft",
      views: 0,
      date: "2024-01-10",
      author: "João Mabunda"
    },
    {
      id: 3,
      title: "Empoderamento Feminino",
      status: "published",
      views: 892,
      date: "2024-01-08",
      author: "Ana Mussa"
    }
  ];

  const recentDonations = [
    { id: 1, donor: "João Silva", amount: 500, method: "M-Pesa", date: "2024-01-20" },
    { id: 2, donor: "Maria Costa", amount: 250, method: "E-Mola", date: "2024-01-19" },
    { id: 3, donor: "Pedro Santos", amount: 1000, method: "Transferência", date: "2024-01-18" }
  ];

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
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
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
            <TabsTrigger value="projects" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
              <Heart className="h-4 w-4 md:h-4 md:w-4" />
              <span className="hidden sm:block">Projetos</span>
              <span className="sm:hidden text-xs">Proj</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs md:text-sm py-2 md:py-3 flex flex-col md:flex-row items-center gap-1 md:gap-2">
              <Settings className="h-4 w-4 md:h-4 md:w-4" />
              <span className="hidden sm:block">Configurações</span>
              <span className="sm:hidden text-xs">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 md:space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <Users className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                    <span className="text-xs md:text-sm font-medium">Visitantes</span>
                  </div>
                  <div className="text-lg md:text-2xl font-bold">{stats.totalVisitors.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">+12% este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <FileText className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                    <span className="text-xs md:text-sm font-medium">Posts</span>
                  </div>
                  <div className="text-lg md:text-2xl font-bold">{stats.blogPosts}</div>
                  <p className="text-xs text-muted-foreground">3 novos este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-yellow-600" />
                    <span className="text-xs md:text-sm font-medium">Doações</span>
                  </div>
                  <div className="text-lg md:text-2xl font-bold">{stats.donations}</div>
                  <p className="text-xs text-muted-foreground">+8% este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <Heart className="h-3 w-3 md:h-4 md:w-4 text-red-600" />
                    <span className="text-xs md:text-sm font-medium">Projetos</span>
                  </div>
                  <div className="text-lg md:text-2xl font-bold">{stats.projects}</div>
                  <p className="text-xs text-muted-foreground">2 ativos</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <Users className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
                    <span className="text-xs md:text-sm font-medium">Voluntários</span>
                  </div>
                  <div className="text-lg md:text-2xl font-bold">{stats.volunteers}</div>
                  <p className="text-xs text-muted-foreground">+5 este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4 text-orange-600" />
                    <span className="text-xs md:text-sm font-medium">Comunidades</span>
                  </div>
                  <div className="text-lg md:text-2xl font-bold">{stats.communities}</div>
                  <p className="text-xs text-muted-foreground">Em Cabo Delgado</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
              <Card>
                <CardHeader className="pb-3 md:pb-6">
                  <CardTitle className="flex items-center space-x-2 text-sm md:text-base">
                    <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                    <span className="hidden sm:block">Visitantes do Site (Últimos 7 dias)</span>
                    <span className="sm:hidden">Visitantes (7 dias)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-32 md:h-40 flex items-end space-x-1 md:space-x-2">
                    {[120, 150, 180, 220, 190, 250, 300].map((value, index) => (
                      <div key={index} className="flex-1 bg-primary/20 rounded-t" style={{ height: `${(value / 300) * 100}%` }}>
                        <div className="bg-primary rounded-t h-1 md:h-2"></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Seg</span>
                    <span>Ter</span>
                    <span>Qua</span>
                    <span>Qui</span>
                    <span>Sex</span>
                    <span>Sáb</span>
                    <span>Dom</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 md:pb-6">
                  <CardTitle className="text-sm md:text-base">Atividade Recente</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4 pt-0">
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs md:text-sm">Nova doação de 500 MT via M-Pesa</span>
                    <span className="text-xs text-muted-foreground ml-auto">2h</span>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs md:text-sm">Post "Educação em Cabo Delgado" publicado</span>
                    <span className="text-xs text-muted-foreground ml-auto">4h</span>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs md:text-sm">Novo voluntário cadastrado</span>
                    <span className="text-xs text-muted-foreground ml-auto">6h</span>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                    <span className="text-xs md:text-sm">Projeto de água iniciado em Pemba</span>
                    <span className="text-xs text-muted-foreground ml-auto">1d</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Blog Tab */}
          <TabsContent value="blog" className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold">Gerenciar Blog</h2>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Novo Post
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Buscar posts..." className="pl-8 text-sm" />
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="p-2 md:p-4 font-medium text-xs md:text-sm">Título</th>
                        <th className="p-2 md:p-4 font-medium text-xs md:text-sm hidden sm:table-cell">Status</th>
                        <th className="p-2 md:p-4 font-medium text-xs md:text-sm hidden md:table-cell">Autor</th>
                        <th className="p-2 md:p-4 font-medium text-xs md:text-sm hidden lg:table-cell">Visualizações</th>
                        <th className="p-2 md:p-4 font-medium text-xs md:text-sm hidden lg:table-cell">Data</th>
                        <th className="p-2 md:p-4 font-medium text-xs md:text-sm">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPosts.map((post) => (
                        <tr key={post.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 md:p-4">
                            <div className="font-medium text-xs md:text-sm">{post.title}</div>
                            <div className="sm:hidden text-xs text-muted-foreground mt-1">
                              <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="mr-2 text-xs">
                                {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                              </Badge>
                              {post.author} • {post.views.toLocaleString()} views
                            </div>
                          </td>
                          <td className="p-2 md:p-4 hidden sm:table-cell">
                            <Badge variant={post.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                              {post.status === 'published' ? 'Publicado' : 'Rascunho'}
                            </Badge>
                          </td>
                          <td className="p-2 md:p-4 text-muted-foreground text-xs md:text-sm hidden md:table-cell">{post.author}</td>
                          <td className="p-2 md:p-4 text-xs md:text-sm hidden lg:table-cell">{post.views.toLocaleString()}</td>
                          <td className="p-2 md:p-4 text-muted-foreground text-xs md:text-sm hidden lg:table-cell">{post.date}</td>
                          <td className="p-2 md:p-4">
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donations Tab */}
          <TabsContent value="donations" className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold">Gestão de Doações</h2>
              <Button size="sm" className="w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Exportar Relatório
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="text-xs md:text-sm font-medium text-muted-foreground">Total este Mês</div>
                  <div className="text-lg md:text-2xl font-bold">12.500 MT</div>
                  <div className="text-xs text-green-600">+15% vs mês anterior</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="text-xs md:text-sm font-medium text-muted-foreground">Doadores Únicos</div>
                  <div className="text-lg md:text-2xl font-bold">89</div>
                  <div className="text-xs text-blue-600">+8 novos doadores</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4">
                  <div className="text-xs md:text-sm font-medium text-muted-foreground">Doação Média</div>
                  <div className="text-lg md:text-2xl font-bold">420 MT</div>
                  <div className="text-xs text-purple-600">Valor médio por doação</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-sm md:text-base">Doações Recentes</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 md:space-y-4">
                  {recentDonations.map((donation) => (
                    <div key={donation.id} className="flex items-center justify-between p-3 md:p-4 border rounded-lg">
                      <div className="flex items-center space-x-3 md:space-x-4">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium text-sm md:text-base">{donation.donor}</div>
                          <div className="text-xs md:text-sm text-muted-foreground">{donation.method}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm md:text-base">{donation.amount} MT</div>
                        <div className="text-xs md:text-sm text-muted-foreground">{donation.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <h2 className="text-xl md:text-2xl font-bold">Gestão de Projetos</h2>
              <Button size="sm" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
              <Card>
                <CardHeader className="pb-3 md:pb-6">
                  <CardTitle className="flex items-center justify-between text-sm md:text-base">
                    <span>Educação Rural</span>
                    <Badge className="text-xs">Ativo</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4 pt-0">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Programa de alfabetização em comunidades rurais de Cabo Delgado
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span>Progresso</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span>Beneficiários</span>
                    <span className="font-medium">250</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    <Edit className="h-3 w-3 mr-2" />
                    Editar Projeto
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 md:pb-6">
                  <CardTitle className="flex items-center justify-between text-sm md:text-base">
                    <span>Água Limpa</span>
                    <Badge variant="secondary" className="text-xs">Planejado</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4 pt-0">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Construção de poços artesianos em 5 comunidades
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span>Progresso</span>
                      <span>25%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span>Beneficiários</span>
                    <span className="font-medium">500</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    <Edit className="h-3 w-3 mr-2" />
                    Editar Projeto
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 md:pb-6">
                  <CardTitle className="flex items-center justify-between text-sm md:text-base">
                    <span>Saúde Preventiva</span>
                    <Badge className="text-xs">Ativo</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4 pt-0">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Campanhas de vacinação e educação em saúde
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span>Progresso</span>
                      <span>90%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs md:text-sm">
                    <span>Beneficiários</span>
                    <span className="font-medium">1,200</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full text-xs">
                    <Edit className="h-3 w-3 mr-2" />
                    Editar Projeto
                  </Button>
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
                  <CardTitle className="text-sm md:text-base">Configurações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4 pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm font-medium">Modo Manutenção</span>
                    <div className="relative inline-block w-8 md:w-10 mr-2 align-middle select-none">
                      <input type="checkbox" className="sr-only" />
                      <div className="block bg-gray-300 w-8 md:w-10 h-5 md:h-6 rounded-full cursor-pointer"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm font-medium">Notificações por Email</span>
                    <div className="relative inline-block w-8 md:w-10 mr-2 align-middle select-none">
                      <input type="checkbox" className="sr-only" defaultChecked />
                      <div className="block bg-primary w-8 md:w-10 h-5 md:h-6 rounded-full cursor-pointer"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs md:text-sm font-medium">Analytics</span>
                    <div className="relative inline-block w-8 md:w-10 mr-2 align-middle select-none">
                      <input type="checkbox" className="sr-only" defaultChecked />
                      <div className="block bg-primary w-8 md:w-10 h-5 md:h-6 rounded-full cursor-pointer"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3 md:pb-6">
                  <CardTitle className="text-sm md:text-base">Backup e Segurança</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4 pt-0">
                  <div className="space-y-2">
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Último backup: 26 de Janeiro, 2024 às 15:30
                    </p>
                    <Button variant="outline" className="w-full text-xs md:text-sm" size="sm">
                      <Download className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                      Criar Backup Manual
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Exportar dados do sistema
                    </p>
                    <Button variant="outline" className="w-full text-xs md:text-sm" size="sm">
                      <Download className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                      Exportar Dados
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-3 md:pb-6">
                <CardTitle className="text-sm md:text-base">Usuários e Permissões</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center justify-between p-3 md:p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-xs md:text-sm">Adamo Ernesto Abdala</div>
                        <div className="text-xs text-muted-foreground">Administrador</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 md:p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 md:space-x-3">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-xs md:text-sm">Maria Santos</div>
                        <div className="text-xs text-muted-foreground">Editor</div>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </div>
                  <Button className="w-full text-xs md:text-sm" size="sm">
                    <Plus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    Adicionar Usuário
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
