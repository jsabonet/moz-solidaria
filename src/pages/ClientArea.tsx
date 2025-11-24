// src/pages/ClientArea.tsx
import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Loading } from '@/components/ui/Loading';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Settings, LogOut, User, BarChart3 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { fetchUserProfile, fetchDashboardStats } from '@/lib/clientAreaApi';
import { UserProfile, DashboardStats } from '@/types/clientArea';
import { 
  LazyDonorDashboard, 
  LazyBeneficiaryDashboard, 
  LazyVolunteerDashboard, 
  LazyPartnerDashboard,
  LazyNotificationCenter,
  LazyProfileSettings,
  ComponentLoader
} from '@/components/LazyComponents';
import { toast } from 'sonner';

const ClientArea: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const loadData = async () => {
      try {
        // Verificar se o token está disponível antes de fazer requisições
        const token = localStorage.getItem('authToken');
        if (!token) {
          return;
        }

        // Pequeno delay para garantir que o token seja persistido
        await new Promise(resolve => setTimeout(resolve, 100));

        const [profileDataRaw, statsData] = await Promise.all([
          fetchUserProfile(),
          fetchDashboardStats()
        ]);
        // Tentar extrair user_type de várias fontes (API /auth/user pode não trazer)
        const localUserRaw = localStorage.getItem('userData');
        let localUser: any = null;
        try { if (localUserRaw) localUser = JSON.parse(localUserRaw); } catch {}
        const derivedUserType = (profileDataRaw as any)?.user_type
          || (profileDataRaw as any)?.profile?.user_type
          || (statsData as any)?.user_type
          || localUser?.user_type
          || localUser?.profile?.user_type
          || 'donor'; // fallback padrão

        const fullName = (profileDataRaw as any)?.full_name
          || (profileDataRaw as any)?.username
          || (profileDataRaw as any)?.email
          || localUser?.full_name
          || localUser?.username
          || 'Usuário';

        const profileData = {
          ...profileDataRaw,
          user_type: derivedUserType,
          full_name: fullName
        } as UserProfile;

        if (!['donor','beneficiary','volunteer','partner'].includes(profileData.user_type as any)) {
          // Unknown user type, using fallback
        }

        setUserProfile(profileData);
        setDashboardStats(statsData);
      } catch (error) {
        toast.error('Erro ao carregar dados Portal da Comunidade');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated, user]); // Adicionar user como dependência

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Loading 
            variant="page" 
            message="Carregando portal de comunidade..." 
            size="lg" 
          />
        </div>
        <Footer />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-destructive">Erro</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Não foi possível carregar seu perfil. Tente novamente.
              </p>
              <Button onClick={() => window.location.reload()}>
                Recarregar
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const renderDashboard = () => {
  switch (userProfile.user_type) {
      case 'donor':
        return (
          <Suspense fallback={<ComponentLoader />}>
            <LazyDonorDashboard stats={dashboardStats} />
          </Suspense>
        );
      case 'beneficiary':
        return (
          <Suspense fallback={<ComponentLoader />}>
            <LazyBeneficiaryDashboard stats={dashboardStats} />
          </Suspense>
        );
      case 'volunteer':
        return (
          <Suspense fallback={<ComponentLoader />}>
            <LazyVolunteerDashboard stats={dashboardStats} />
          </Suspense>
        );
      case 'partner':
        return (
          <Suspense fallback={<ComponentLoader />}>
            <LazyPartnerDashboard stats={dashboardStats} />
          </Suspense>
        );
      default:
        return (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Tipo de usuário não reconhecido: {userProfile.user_type}
              </p>
            </CardContent>
          </Card>
        );
    }
  };

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'donor': return 'Doador';
      case 'beneficiary': return 'Beneficiário';
      case 'volunteer': return 'Voluntário';
      case 'partner': return 'Parceiro';
      default: return type;
    }
  };

  const getUserTypeColor = (type: string) => {
    switch (type) {
      case 'donor': return 'bg-green-500';
      case 'beneficiary': return 'bg-blue-500';
      case 'volunteer': return 'bg-purple-500';
      case 'partner': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Header da Área do Cliente */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  {(() => {
                    const base = (userProfile.full_name || (userProfile as any).username || (userProfile as any).email || '?').toString();
                    return base.trim().charAt(0).toUpperCase() || '?';
                  })()}
                </div>
                <Badge 
                  className={`absolute -bottom-1 -right-1 text-white ${getUserTypeColor(userProfile.user_type)}`}
                >
                  {getUserTypeLabel(userProfile.user_type)}
                </Badge>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Olá, {userProfile.full_name}!</h1>
                <p className="text-muted-foreground">
                  Bem-vindo ao Portal de Comunidade MOZ SOLIDÁRIA
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>

        {/* Navegação por Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            {/* <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notificações</span>
            </TabsTrigger> */}
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Perfil</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {renderDashboard()}
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Suspense fallback={<ComponentLoader />}>
              <LazyNotificationCenter />
            </Suspense>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Suspense fallback={<ComponentLoader />}>
              <LazyProfileSettings userProfile={userProfile} onUpdate={setUserProfile} />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default ClientArea;
