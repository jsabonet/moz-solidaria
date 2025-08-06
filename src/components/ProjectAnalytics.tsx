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
  Filter
} from 'lucide-react';

interface ProjectAnalyticsProps {
  projectId?: number;
  showComparison?: boolean;
}

interface AnalyticsData {
  progressOverTime: Array<{
    date: string;
    progress: number;
    beneficiaries: number;
    spending: number;
  }>;
  milestones: Array<{
    date: string;
    title: string;
    impact: number;
  }>;
  comparison?: Array<{
    projectName: string;
    progress: number;
    beneficiaries: number;
    efficiency: number;
    status: string;
  }>;
  summary: {
    totalProgress: number;
    progressTrend: number;
    beneficiariesGrowth: number;
    budgetEfficiency: number;
    averageMonthlyProgress: number;
    estimatedCompletion: string;
  };
}

const ProjectAnalytics: React.FC<ProjectAnalyticsProps> = ({ 
  projectId, 
  showComparison = false 
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');
  const [compareMetric, setCompareMetric] = useState('progress');

  useEffect(() => {
    loadAnalytics();
  }, [projectId, timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Simulação de dados - substituir pela API real
      const mockAnalytics: AnalyticsData = {
        progressOverTime: [
          { date: '2025-01-01', progress: 0, beneficiaries: 0, spending: 0 },
          { date: '2025-02-01', progress: 15, beneficiaries: 50, spending: 7500 },
          { date: '2025-03-01', progress: 30, beneficiaries: 120, spending: 15000 },
          { date: '2025-04-01', progress: 45, beneficiaries: 180, spending: 22500 },
          { date: '2025-05-01', progress: 60, beneficiaries: 230, spending: 30000 },
          { date: '2025-06-01', progress: 75, beneficiaries: 280, spending: 37500 },
          { date: '2025-07-01', progress: 85, beneficiaries: 310, spending: 42500 },
          { date: '2025-08-01', progress: 90, beneficiaries: 320, spending: 45000 }
        ],
        milestones: [
          { date: '2025-02-15', title: 'Início da construção', impact: 20 },
          { date: '2025-04-10', title: 'Primeira turma formada', impact: 35 },
          { date: '2025-06-20', title: 'Equipamentos instalados', impact: 25 },
          { date: '2025-07-30', title: 'Inauguração da biblioteca', impact: 20 }
        ],
        comparison: [
          { projectName: 'Escola Primária Nangade', progress: 90, beneficiaries: 320, efficiency: 95, status: 'active' },
          { projectName: 'Cestas Básicas', progress: 40, beneficiaries: 150, efficiency: 78, status: 'active' },
          { projectName: 'Formação Marcenaria', progress: 100, beneficiaries: 25, efficiency: 92, status: 'completed' },
          { projectName: 'Centro de Saúde', progress: 65, beneficiaries: 500, efficiency: 88, status: 'active' },
          { projectName: 'Poço de Água', progress: 25, beneficiaries: 80, efficiency: 65, status: 'planning' }
        ],
        summary: {
          totalProgress: 90,
          progressTrend: 12.5,
          beneficiariesGrowth: 85.3,
          budgetEfficiency: 95.2,
          averageMonthlyProgress: 11.25,
          estimatedCompletion: '2025-09-15'
        }
      };
      
      setAnalytics(mockAnalytics);
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString('pt-BR');

  if (loading) {
    return <div className="text-center py-8">Carregando análises...</div>;
  }

  if (!analytics) {
    return <div className="text-center py-8">Erro ao carregar dados</div>;
  }

  return (
    <div className="space-y-6">
      {/* Controles */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Análise e Relatórios</h3>
          <p className="text-muted-foreground">
            Acompanhe o desempenho e impacto dos projetos
          </p>
        </div>
        
        <div className="flex gap-2">
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
            Exportar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="impact">Impacto</TabsTrigger>
          {showComparison && (
            <TabsTrigger value="comparison">Comparação</TabsTrigger>
          )}
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Métricas Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Progresso Total</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(analytics.summary.totalProgress)}</div>
                <div className="flex items-center text-xs text-green-600 mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{formatPercentage(analytics.summary.progressTrend)} este mês
                </div>
                <Progress value={analytics.summary.totalProgress} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Crescimento de Beneficiários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(analytics.summary.beneficiariesGrowth)}</div>
                <p className="text-xs text-muted-foreground">
                  desde o início do projeto
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Eficiência Orçamentária</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(analytics.summary.budgetEfficiency)}</div>
                <p className="text-xs text-muted-foreground">
                  dentro do orçamento planejado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conclusão Estimada</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {new Date(analytics.summary.estimatedCompletion).toLocaleDateString('pt-BR')}
                </div>
                <p className="text-xs text-muted-foreground">
                  baseado no progresso atual
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Progresso Temporal */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução do Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2 p-4">
                {analytics.progressOverTime.map((point, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-primary rounded-t-sm transition-all duration-300 hover:bg-primary/80"
                      style={{ height: `${(point.progress / 100) * 200}px` }}
                      title={`${point.progress}% - ${new Date(point.date).toLocaleDateString('pt-BR')}`}
                    />
                    <span className="text-xs text-muted-foreground mt-2 transform -rotate-45 origin-top-left">
                      {new Date(point.date).toLocaleDateString('pt-BR', { month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-4">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progresso Detalhado */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Marcos Importantes */}
            <Card>
              <CardHeader>
                <CardTitle>Marcos Alcançados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analytics.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Award className="h-4 w-4 text-primary" />
                      <div>
                        <div className="font-medium">{milestone.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(milestone.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      +{milestone.impact}% impacto
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Métricas de Progresso */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Desempenho</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Progresso Mensal Médio</span>
                    <span className="font-medium">{formatPercentage(analytics.summary.averageMonthlyProgress)}</span>
                  </div>
                  <Progress value={analytics.summary.averageMonthlyProgress * 5} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Eficiência vs Planejado</span>
                    <span className="font-medium">{formatPercentage(analytics.summary.budgetEfficiency)}</span>
                  </div>
                  <Progress value={analytics.summary.budgetEfficiency} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Taxa de Crescimento</span>
                    <span className="font-medium text-green-600">
                      +{formatPercentage(analytics.summary.beneficiariesGrowth)}
                    </span>
                  </div>
                  <Progress value={Math.min(analytics.summary.beneficiariesGrowth, 100)} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Análise de Impacto */}
        <TabsContent value="impact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Beneficiários Diretos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {formatNumber(analytics.progressOverTime[analytics.progressOverTime.length - 1]?.beneficiaries || 0)}
                </div>
                <p className="text-sm text-muted-foreground">
                  pessoas impactadas diretamente
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Investimento Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {formatNumber(analytics.progressOverTime[analytics.progressOverTime.length - 1]?.spending || 0)} MZN
                </div>
                <p className="text-sm text-muted-foreground">
                  investidos no projeto
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custo por Beneficiário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatNumber(
                    (analytics.progressOverTime[analytics.progressOverTime.length - 1]?.spending || 0) /
                    (analytics.progressOverTime[analytics.progressOverTime.length - 1]?.beneficiaries || 1)
                  )} MZN
                </div>
                <p className="text-sm text-muted-foreground">
                  eficiência de investimento
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Comparação entre Projetos */}
        {showComparison && (
          <TabsContent value="comparison" className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-md font-semibold">Comparação de Projetos</h4>
              <Select value={compareMetric} onValueChange={setCompareMetric}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="progress">Progresso</SelectItem>
                  <SelectItem value="beneficiaries">Beneficiários</SelectItem>
                  <SelectItem value="efficiency">Eficiência</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {analytics.comparison?.map((project, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{project.projectName}</h5>
                      <Badge variant={
                        project.status === 'completed' ? 'default' :
                        project.status === 'active' ? 'secondary' :
                        'outline'
                      }>
                        {project.status === 'completed' ? 'Concluído' :
                         project.status === 'active' ? 'Ativo' :
                         'Planejamento'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Progresso:</span>
                        <div className="font-medium">{formatPercentage(project.progress)}</div>
                        <Progress value={project.progress} className="h-1 mt-1" />
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Beneficiários:</span>
                        <div className="font-medium">{formatNumber(project.beneficiaries)}</div>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">Eficiência:</span>
                        <div className="font-medium">{formatPercentage(project.efficiency)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ProjectAnalytics;
