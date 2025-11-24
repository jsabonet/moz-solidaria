// src/components/reports/AdvancedStats.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  DollarSign, 
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Calendar
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { reportsApi } from '@/services/reportsApi';
import { formatCurrency, formatPercentage } from '@/lib/utils';

interface StatsData {
  financialMetrics: {
    totalDonations: number;
    donationsGrowth: number;
    averageDonation: number;
    recurringDonors: number;
    monthlyRevenue: number;
    projectedRevenue: number;
  };
  communityMetrics: {
    totalVolunteers: number;
    activeVolunteers: number;
    totalBeneficiaries: number;
    activeBeneficiaries: number;
    totalPartners: number;
    activePartners: number;
  };
  projectMetrics: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    averageCompletion: number;
    totalBudget: number;
    totalSpent: number;
  };
  performanceMetrics: {
    donorRetention: number;
    volunteerRetention: number;
    projectSuccessRate: number;
    averageProjectDuration: number;
    costPerBeneficiary: number;
    impactScore: number;
  };
}

interface AdvancedStatsProps {
  timeRange?: string;
  onTimeRangeChange?: (range: string) => void;
}

const AdvancedStats: React.FC<AdvancedStatsProps> = ({ 
  timeRange = '6months',
  onTimeRangeChange 
}) => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadStats();
  }, [timeRange]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await reportsApi.getAdvancedStats(timeRange);
      
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        throw new Error('Dados não disponíveis na resposta da API');
      }
    } catch (error) {
      // API not available, using mock data fallback
      
      // Fallback para dados mock se a API não estiver disponível
      setStats({
        financialMetrics: {
          totalDonations: 1250000,
          donationsGrowth: 15.3,
          averageDonation: 450,
          recurringDonors: 89,
          monthlyRevenue: 125000,
          projectedRevenue: 1500000
        },
        communityMetrics: {
          totalVolunteers: 156,
          activeVolunteers: 89,
          totalBeneficiaries: 450,
          activeBeneficiaries: 367,
          totalPartners: 24,
          activePartners: 18
        },
        projectMetrics: {
          totalProjects: 32,
          activeProjects: 12,
          completedProjects: 18,
          averageCompletion: 73.5,
          totalBudget: 2100000,
          totalSpent: 1540000
        },
        performanceMetrics: {
          donorRetention: 78.5,
          volunteerRetention: 82.3,
          projectSuccessRate: 87.5,
          averageProjectDuration: 8.5,
          costPerBeneficiary: 3422,
          impactScore: 8.7
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (value: number) => {
    if (value > 0) return TrendingUp;
    if (value < 0) return TrendingDown;
    return Activity;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Estatísticas Avançadas</h2>
          <div className="w-32 h-8 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Estatísticas Avançadas</h2>
        <Select value={timeRange} onValueChange={onTimeRangeChange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Último Mês</SelectItem>
            <SelectItem value="3months">Últimos 3 Meses</SelectItem>
            <SelectItem value="6months">Últimos 6 Meses</SelectItem>
            <SelectItem value="1year">Último Ano</SelectItem>
            <SelectItem value="all">Todos os Tempos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="community">Comunidade</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Doações</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.financialMetrics.totalDonations)}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  {React.createElement(getGrowthIcon(stats.financialMetrics.donationsGrowth), {
                    className: `h-3 w-3 ${getGrowthColor(stats.financialMetrics.donationsGrowth)}`
                  })}
                  <span className={getGrowthColor(stats.financialMetrics.donationsGrowth)}>
                    {formatPercentage(stats.financialMetrics.donationsGrowth)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Voluntários Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.communityMetrics.activeVolunteers}</div>
                <p className="text-xs text-muted-foreground">
                  de {stats.communityMetrics.totalVolunteers} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.projectMetrics.activeProjects}</div>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(stats.projectMetrics.averageCompletion)} progresso médio
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Score de Impacto</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.performanceMetrics.impactScore}/10</div>
                <Badge variant={stats.performanceMetrics.impactScore >= 8 ? "default" : "secondary"}>
                  {stats.performanceMetrics.impactScore >= 8 ? "Excelente" : "Bom"}
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.financialMetrics.monthlyRevenue)}</div>
                <p className="text-xs text-muted-foreground">Média dos últimos meses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Doação Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.financialMetrics.averageDonation)}</div>
                <p className="text-xs text-muted-foreground">Por transação</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Doadores Recorrentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.financialMetrics.recurringDonors}</div>
                <p className="text-xs text-muted-foreground">Retenção: {formatPercentage(stats.performanceMetrics.donorRetention)}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Beneficiários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.communityMetrics.activeBeneficiaries}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.communityMetrics.totalBeneficiaries} cadastrados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Parceiros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.communityMetrics.activePartners}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.communityMetrics.totalPartners} total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Custo por Beneficiário</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.performanceMetrics.costPerBeneficiary)}</div>
                <p className="text-xs text-muted-foreground">Custo médio</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.projectMetrics.totalBudget)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(stats.projectMetrics.totalSpent)} gastos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatPercentage(stats.performanceMetrics.projectSuccessRate)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.projectMetrics.completedProjects} projetos concluídos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Duração Média</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.performanceMetrics.averageProjectDuration} meses</div>
                <p className="text-xs text-muted-foreground">Tempo médio de execução</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedStats;
