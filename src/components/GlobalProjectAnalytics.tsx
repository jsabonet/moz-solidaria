import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Users,
  Target,
  Calendar,
  DollarSign,
  Award,
  Download,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Activity
} from 'lucide-react';

interface GlobalAnalyticsData {
  overview: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalBeneficiaries: number;
    totalBudget: number;
    totalSpent: number;
    averageProgress: number;
    growthRate: number;
  };
  projectPerformance: Array<{
    id: number;
    name: string;
    status: string;
    progress: number;
    beneficiaries: number;
    efficiency: number;
    riskLevel: 'low' | 'medium' | 'high';
    lastUpdate: string;
  }>;
  regionStats: Array<{
    province: string;
    projectCount: number;
    beneficiaries: number;
    investment: number;
    completion: number;
  }>;
  monthlyProgress: Array<{
    month: string;
    newProjects: number;
    completed: number;
    beneficiaries: number;
    spending: number;
  }>;
  topPerformers: Array<{
    projectName: string;
    metric: string;
    value: number;
    trend: number;
  }>;
}

const GlobalProjectAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<GlobalAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedRegion, setSelectedRegion] = useState('all');

  useEffect(() => {
    loadGlobalAnalytics();
  }, [timeRange, selectedRegion]);

  const loadGlobalAnalytics = async () => {
    try {
      setLoading(true);
      
      // Simulação de dados globais - substituir pela API real
      const mockData: GlobalAnalyticsData = {
        overview: {
          totalProjects: 47,
          activeProjects: 28,
          completedProjects: 15,
          totalBeneficiaries: 12450,
          totalBudget: 2500000,
          totalSpent: 1875000,
          averageProgress: 68.5,
          growthRate: 15.3
        },
        projectPerformance: [
          {
            id: 1,
            name: 'Escola Primária Nangade',
            status: 'active',
            progress: 90,
            beneficiaries: 320,
            efficiency: 95,
            riskLevel: 'low',
            lastUpdate: '2025-08-01'
          },
          {
            id: 2,
            name: 'Centro de Saúde Mocímboa',
            status: 'active',
            progress: 45,
            beneficiaries: 500,
            efficiency: 78,
            riskLevel: 'medium',
            lastUpdate: '2025-07-28'
          },
          {
            id: 3,
            name: 'Distribuição Cestas Básicas',
            status: 'active',
            progress: 30,
            beneficiaries: 150,
            efficiency: 85,
            riskLevel: 'low',
            lastUpdate: '2025-08-02'
          },
          {
            id: 4,
            name: 'Poço de Água Macomia',
            status: 'planning',
            progress: 15,
            beneficiaries: 200,
            efficiency: 60,
            riskLevel: 'high',
            lastUpdate: '2025-07-20'
          },
          {
            id: 5,
            name: 'Formação Marcenaria',
            status: 'completed',
            progress: 100,
            beneficiaries: 25,
            efficiency: 92,
            riskLevel: 'low',
            lastUpdate: '2025-07-31'
          }
        ],
        regionStats: [
          {
            province: 'Cabo Delgado',
            projectCount: 25,
            beneficiaries: 8500,
            investment: 1500000,
            completion: 72
          },
          {
            province: 'Nampula',
            projectCount: 12,
            beneficiaries: 2800,
            investment: 650000,
            completion: 65
          },
          {
            province: 'Niassa',
            projectCount: 8,
            beneficiaries: 1050,
            investment: 300000,
            completion: 58
          },
          {
            province: 'Zambézia',
            projectCount: 2,
            beneficiaries: 100,
            investment: 50000,
            completion: 85
          }
        ],
        monthlyProgress: [
          { month: 'Jan', newProjects: 3, completed: 1, beneficiaries: 450, spending: 125000 },
          { month: 'Fev', newProjects: 2, completed: 2, beneficiaries: 680, spending: 180000 },
          { month: 'Mar', newProjects: 4, completed: 1, beneficiaries: 920, spending: 220000 },
          { month: 'Abr', newProjects: 3, completed: 3, beneficiaries: 1200, spending: 280000 },
          { month: 'Mai', newProjects: 5, completed: 2, beneficiaries: 1450, spending: 320000 },
          { month: 'Jun', newProjects: 2, completed: 4, beneficiaries: 1680, spending: 385000 },
          { month: 'Jul', newProjects: 3, completed: 2, beneficiaries: 1890, spending: 425000 },
          { month: 'Ago', newProjects: 1, completed: 0, beneficiaries: 2100, spending: 475000 }
        ],
        topPerformers: [
          { projectName: 'Escola Primária Nangade', metric: 'Eficiência', value: 95, trend: 8.2 },
          { projectName: 'Formação Marcenaria', metric: 'Conclusão', value: 100, trend: 25.0 },
          { projectName: 'Centro de Saúde', metric: 'Beneficiários', value: 500, trend: 12.5 },
          { projectName: 'Cestas Básicas', metric: 'Custo-benefício', value: 89, trend: 5.8 }
        ]
      };
      
      setAnalytics(mockData);
    } catch (error) {
      console.error('Erro ao carregar analytics globais:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => `${(value / 1000).toFixed(0)}k MZN`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString('pt-BR');

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low': return <CheckCircle className="h-4 w-4" />;
      case 'medium': return <Clock className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando análises globais...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-8">Erro ao carregar dados</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Dashboard Executivo</h3>
          <p className="text-muted-foreground">
            Visão geral do desempenho de todos os projetos
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Região" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as regiões</SelectItem>
              <SelectItem value="cabo-delgado">Cabo Delgado</SelectItem>
              <SelectItem value="nampula">Nampula</SelectItem>
              <SelectItem value="niassa">Niassa</SelectItem>
              <SelectItem value="zambezia">Zambézia</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="6months">Últimos 6 meses</SelectItem>
              <SelectItem value="1year">Último ano</SelectItem>
              <SelectItem value="all">Todo período</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Relatório
          </Button>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.activeProjects}</div>
            <div className="flex items-center text-xs text-green-600 mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +{formatPercentage(analytics.overview.growthRate)} vs período anterior
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {analytics.overview.totalProjects} projetos no total
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficiários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics.overview.totalBeneficiaries)}</div>
            <p className="text-xs text-muted-foreground">
              pessoas impactadas diretamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investimento Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.overview.totalSpent)}</div>
            <div className="text-xs text-muted-foreground">
              de {formatCurrency(analytics.overview.totalBudget)} orçado
            </div>
            <Progress 
              value={(analytics.overview.totalSpent / analytics.overview.totalBudget) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPercentage(analytics.overview.averageProgress)}</div>
            <Progress value={analytics.overview.averageProgress} className="mt-2" />
            <div className="text-xs text-muted-foreground mt-1">
              {analytics.overview.completedProjects} projetos concluídos
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList>
          <TabsTrigger value="performance">Desempenho</TabsTrigger>
          <TabsTrigger value="regions">Regiões</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="risks">Riscos</TabsTrigger>
        </TabsList>

        {/* Performance dos Projetos */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Projetos */}
            <Card>
              <CardHeader>
                <CardTitle>Projetos por Desempenho</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analytics.projectPerformance.map(project => (
                  <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{project.name}</h4>
                        <Badge variant="outline" className={getRiskColor(project.riskLevel)}>
                          {getRiskIcon(project.riskLevel)}
                          {project.riskLevel === 'low' ? 'Baixo' : 
                           project.riskLevel === 'medium' ? 'Médio' : 'Alto'} risco
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Progresso:</span>
                          <div className="font-medium">{project.progress}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Beneficiários:</span>
                          <div className="font-medium">{project.beneficiaries}</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Eficiência:</span>
                          <div className="font-medium">{project.efficiency}%</div>
                        </div>
                      </div>
                      <Progress value={project.progress} className="h-1 mt-2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Melhores Desempenhos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Award className="h-4 w-4 text-primary" />
                      <div>
                        <div className="font-medium text-sm">{performer.projectName}</div>
                        <div className="text-xs text-muted-foreground">{performer.metric}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">
                        {performer.metric === 'Beneficiários' ? 
                          performer.value : 
                          `${performer.value}${performer.metric.includes('%') ? '%' : ''}`
                        }
                      </div>
                      <div className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +{performer.trend}%
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Análise Regional */}
        <TabsContent value="regions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analytics.regionStats.map(region => (
              <Card key={region.province}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {region.province}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-primary">{region.projectCount}</div>
                      <p className="text-sm text-muted-foreground">projetos ativos</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{formatNumber(region.beneficiaries)}</div>
                      <p className="text-sm text-muted-foreground">beneficiários</p>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Taxa de Conclusão</span>
                      <span>{region.completion}%</span>
                    </div>
                    <Progress value={region.completion} />
                  </div>
                  
                  <div>
                    <div className="text-lg font-bold text-green-600">{formatCurrency(region.investment)}</div>
                    <p className="text-sm text-muted-foreground">investimento total</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tendências Temporais */}
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Evolução Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2 p-4">
                {analytics.monthlyProgress.map((month, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="flex flex-col items-center space-y-1 w-full">
                      <div 
                        className="w-full bg-blue-500 rounded-t-sm"
                        style={{ height: `${(month.newProjects / 5) * 80}px` }}
                        title={`${month.newProjects} novos projetos`}
                      />
                      <div 
                        className="w-full bg-green-500 rounded-t-sm"
                        style={{ height: `${(month.completed / 5) * 80}px` }}
                        title={`${month.completed} projetos concluídos`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">{month.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Novos Projetos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Concluídos</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análise de Riscos */}
        <TabsContent value="risks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Baixo Risco</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {analytics.projectPerformance.filter(p => p.riskLevel === 'low').length}
                </div>
                <p className="text-sm text-muted-foreground mb-4">projetos estáveis</p>
                <div className="space-y-2">
                  {analytics.projectPerformance
                    .filter(p => p.riskLevel === 'low')
                    .slice(0, 3)
                    .map(project => (
                      <div key={project.id} className="text-xs">
                        • {project.name}
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-yellow-600">Risco Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {analytics.projectPerformance.filter(p => p.riskLevel === 'medium').length}
                </div>
                <p className="text-sm text-muted-foreground mb-4">precisam atenção</p>
                <div className="space-y-2">
                  {analytics.projectPerformance
                    .filter(p => p.riskLevel === 'medium')
                    .slice(0, 3)
                    .map(project => (
                      <div key={project.id} className="text-xs">
                        • {project.name}
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Alto Risco</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {analytics.projectPerformance.filter(p => p.riskLevel === 'high').length}
                </div>
                <p className="text-sm text-muted-foreground mb-4">intervenção urgente</p>
                <div className="space-y-2">
                  {analytics.projectPerformance
                    .filter(p => p.riskLevel === 'high')
                    .slice(0, 3)
                    .map(project => (
                      <div key={project.id} className="text-xs">
                        • {project.name}
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GlobalProjectAnalytics;
