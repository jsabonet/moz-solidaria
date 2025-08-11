// src/components/clientArea/DonorDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Target,
  Gift,
  Users,
  Award,
  Plus,
  History,
  Trophy,
  Star
} from 'lucide-react';
import { DashboardStats } from '@/types/clientArea';
import { fetchCauses } from '@/lib/clientAreaApi';
import { Cause } from '@/types/clientArea';
import { fetchDashboardStatsWithDonorInfo, DonorStats, refreshDonorStats } from '@/lib/donorApi';
import CreateDonation from '@/components/CreateDonation';
import MyDonations from '@/components/MyDonations';
import DonationDetails from '@/components/DonationDetails';
import DonorLevelBadge from '@/components/DonorLevelBadge';
import useClientAreaNotifications from '@/hooks/use-client-area-notifications';

interface DonorDashboardProps {
  stats: DashboardStats | null;
}

const DonorDashboard: React.FC<DonorDashboardProps> = ({ stats: initialStats }) => {
  const { notifyFeatureNotImplemented } = useClientAreaNotifications();
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDonation, setSelectedDonation] = useState<any | null>(null); // TODO: definir tipo Donation
  const [stats, setStats] = useState<DashboardStats | null>(initialStats);
  const [donorStats, setDonorStats] = useState<DonorStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  console.log('🔍 DonorDashboard - causes state:', causes, 'isArray:', Array.isArray(causes));

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setStatsLoading(true);
      
      try {
        // Carregar causas e estatísticas em paralelo
        const [causesData, statsData] = await Promise.all([
          fetchCauses(),
          fetchDashboardStatsWithDonorInfo()
        ]);
        
        console.log('✅ Causas carregadas:', causesData);
        console.log('✅ Estatísticas carregadas:', statsData);
        
        // Garantir que sempre seja um array
        if (Array.isArray(causesData)) {
          setCauses(causesData);
        } else {
          console.warn('⚠️ Resposta não é array:', causesData);
          setCauses([]);
        }
        
        // Atualizar estatísticas
        setStats(statsData);
        setDonorStats(statsData.donorStats);
        
      } catch (error) {
        console.error('❌ Erro ao carregar dados:', error);
        setCauses([]); // Garantir array vazio em caso de erro
      } finally {
        setLoading(false);
        setStatsLoading(false);
      }
    };

    loadData();
  }, []);

  const donorStatsData = donorStats || stats?.stats || {};

  const handleRefreshStats = async () => {
    setStatsLoading(true);
    try {
      const updatedStats = await refreshDonorStats();
      setDonorStats(updatedStats);
      console.log('✅ Estatísticas atualizadas:', updatedStats);
    } catch (error) {
      console.error('❌ Erro ao atualizar estatísticas:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleViewDonationDetails = (donation: any) => {
    setSelectedDonation(donation);
    setActiveTab('details');
  };

  const handleBackToList = () => {
    setSelectedDonation(null);
    setActiveTab('donations');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Portal do Doador</h1>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefreshStats}
            disabled={statsLoading}
          >
            {statsLoading ? 'Atualizando...' : 'Atualizar'}
          </Button>
          {donorStats && (
            <div className="flex items-center space-x-2">
              <DonorLevelBadge 
                currentLevel={donorStats.donor_level}
                totalDonated={donorStats.total_donated}
              />
              {donorStats.achievements.length > 0 && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Star className="h-3 w-3" />
                  <span>{donorStats.achievements.length} Conquistas</span>
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Fazer Doação
          </TabsTrigger>
          <TabsTrigger value="donations" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Minhas Doações
          </TabsTrigger>
          {selectedDonation && (
            <TabsTrigger value="details" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Detalhes
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <DonorOverview 
            stats={stats} 
            donorStats={donorStats}
            statsLoading={statsLoading}
            causes={causes} 
            loading={loading} 
            onTabChange={setActiveTab}
            onFeatureClick={notifyFeatureNotImplemented}
          />
        </TabsContent>

        <TabsContent value="create" className="mt-6">
          <CreateDonation />
        </TabsContent>

        <TabsContent value="donations" className="mt-6">
          <MyDonations onViewDetails={handleViewDonationDetails} />
        </TabsContent>

        {selectedDonation && (
          <TabsContent value="details" className="mt-6">
            <DonationDetails
              donationId={selectedDonation.id}
              onBack={handleBackToList}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

// Componente separado para a visão geral
const DonorOverview: React.FC<{
  stats: DashboardStats | null;
  donorStats: DonorStats | null;
  statsLoading: boolean;
  causes: Cause[];
  loading: boolean;
  onTabChange: (tab: string) => void;
  onFeatureClick: (featureName: string) => void;
}> = ({ stats, donorStats, statsLoading, causes, loading, onTabChange, onFeatureClick }) => {
  const donorStatsData = donorStats || stats?.stats || {};

  // Forçar símbolo 'MZN' (substituir qualquer 'MTn' que possa aparecer)
  const formatCurrency = (amount: number) => {
    if (amount == null || isNaN(amount as any)) return 'MZN 0';
    const negative = amount < 0;
    const abs = Math.abs(amount);
    const formatted = new Intl.NumberFormat('pt-MZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(abs);
    // Garantir que sempre use MZN, não MTn
    return `${negative ? '-' : ''}MZN ${formatted}`.replace(/MTn/g, 'MZN');
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('pt-MZ').format(num);
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(Number(donorStatsData.total_donated || 0))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Todas as doações realizadas
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doações Este Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {donorStatsData.donations_this_month || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {donorStatsData.donations_growth >= 0 ? '+' : ''}
                  {donorStatsData.donations_growth || 0}% do mês anterior
                </p>
              </>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nível Doador</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold flex items-center space-x-2">
                  <span>{donorStatsData.donor_level || 'Bronze'}</span>
                  <Trophy className="h-5 w-5 text-yellow-600" />
                </div>
                <p className="text-xs text-muted-foreground">
                  {donorStatsData.next_level_name && donorStatsData.next_level_amount > 0
                    ? `Próximo nível em ${formatCurrency(donorStatsData.next_level_amount || 0)}`
                    : 'Nível máximo alcançado!'
                  }
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Doações</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatNumber(donorStatsData.donation_count || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {donorStatsData.pending_count > 0 
                    ? `${donorStatsData.pending_count} pendente${donorStatsData.pending_count > 1 ? 's' : ''}`
                    : 'Todas processadas'
                  }
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progresso do Nível do Doador */}
      {donorStats && (
        <DonorLevelBadge 
          currentLevel={donorStats.donor_level}
          totalDonated={donorStats.total_donated}
          progress={donorStats.level_progress}
          nextLevelAmount={donorStats.next_level_amount}
          nextLevelName={donorStats.next_level_name}
          showProgress={true}
        />
      )}

      {/* Conquistas */}
      {donorStats && donorStats.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Suas Conquistas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {donorStats.achievements.map((achievement, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <Trophy className="h-3 w-3" />
                  <span>{achievement}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fazer Nova Doação</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => onTabChange('create')} 
              className="w-full"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Fazer Doação
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Minhas Doações</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              onClick={() => onTabChange('donations')} 
              className="w-full"
              size="lg"
            >
              <History className="h-4 w-4 mr-2" />
              Ver Histórico
            </Button>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};export default DonorDashboard;
