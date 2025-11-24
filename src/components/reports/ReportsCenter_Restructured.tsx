// src/components/reports/ReportsCenter.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Download, 
  BarChart3, 
  Calendar, 
  Mail,
  RefreshCw,
  Eye,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

const ReportsCenter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('analytics');

  // Estados para exportações por área
  const [projectsExportType, setProjectsExportType] = useState('all');
  const [projectsFormat, setProjectsFormat] = useState('excel');
  const [donationsExportType, setDonationsExportType] = useState('all');
  const [donationsFormat, setDonationsFormat] = useState('excel');
  const [volunteersExportType, setVolunteersExportType] = useState('all');
  const [volunteersFormat, setVolunteersFormat] = useState('excel');
  const [beneficiariesExportType, setBeneficiariesExportType] = useState('all');
  const [beneficiariesFormat, setBeneficiariesFormat] = useState('excel');

  // Estados para analytics
  const [analyticsData, setAnalyticsData] = useState({
    totalProjects: 0,
    activeDonations: 0,
    activeVolunteers: 0,
    totalBeneficiaries: 0,
    monthlyDonations: 0,
    completedProjects: 0,
    impactMetrics: {
      peopleHelped: 0,
      fundsRaised: 0,
      hoursVolunteered: 0,
      communitiesReached: 0
    }
  });

  useEffect(() => {
    const loadAnalyticsData = async () => {
      setLoading(true);
      try {
        // Simular carregamento de dados de analytics
        // Em produção, isso viria de uma API
        setAnalyticsData({
          totalProjects: 45,
          activeDonations: 128,
          activeVolunteers: 89,
          totalBeneficiaries: 156,
          monthlyDonations: 125000,
          completedProjects: 32,
          impactMetrics: {
            peopleHelped: 2340,
            fundsRaised: 1875000,
            hoursVolunteered: 4567,
            communitiesReached: 23
          }
        });
      } catch (error) {
        toast.error('Erro ao carregar dados analíticos');
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, []);

  const handleAreaExport = async (area: string, format: string, exportType?: string) => {
    try {
      setIsGenerating(true);
      toast.info(`Gerando exportação de ${area}...`);

      // Obter token de autenticação
      const authToken =
        localStorage.getItem('authToken') || 
        localStorage.getItem('access_token') || 
        '';

      if (!authToken) {
        toast.error('Você precisa estar logado para exportar dados reais. Usaremos dados de demonstração.');
      }

      // Preparar parâmetros para a exportação
      const exportParams = {
        area,
        format,
        type: exportType || 'all',
        generated_at: new Date().toISOString(),
        filters: {}
      };

      // Mapear área para endpoint correspondente
      const areaEndpoints: Record<string, string> = {
        'projects': 'projects',
        'donations': 'donations', 
        'volunteers': 'volunteers',
        'beneficiaries': 'beneficiaries'
      };

      const endpoint = areaEndpoints[area];
      if (!endpoint) {
        throw new Error(`Área de exportação não suportada: ${area}`);
      }

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

      // Tentar fazer a exportação via API
      try {
        const response = await fetch(`${API_BASE}/reports/exports/${endpoint}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
          },
          body: JSON.stringify(exportParams)
        });

        if (response.ok) {
          // Se é um arquivo binário (Excel/PDF), fazer download direto
          if (format === 'excel' || format === 'pdf') {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${area}_export_${new Date().getTime()}.${format === 'excel' ? 'xlsx' : format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success(`Exportação de ${area} concluída!`);
          } else {
            // Para JSON/CSV, tratar como texto
            const data = await response.text();
            const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${area}_export_${new Date().getTime()}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success(`Exportação de ${area} concluída!`);
          }
        } else {
          throw new Error(`Erro na API: ${response.status}`);
        }
      } catch (apiError) {
        // API not available, generating simulated file
        
        // Fallback: gerar arquivo simulado
        const simulatedData = generateSimulatedData(area, format);
        const blob = new Blob([simulatedData.content], { type: simulatedData.mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${area}_export_simulado_${new Date().getTime()}.${simulatedData.extension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.success(`Exportação simulada de ${area} concluída!`);
      }
    } catch (error) {
      toast.error(`Erro ao exportar ${area}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSimulatedData = (area: string, format: string) => {
    const timestamp = new Date().toISOString();
    
    switch (format) {
      case 'json':
        return {
          content: JSON.stringify({
            area,
            generated_at: timestamp,
            data: [`Dados simulados de ${area}`, `Total: 42 registros`, `Status: Simulado`]
          }, null, 2),
          mimeType: 'application/json',
          extension: 'json'
        };
      case 'csv':
        return {
          content: `Area,Data,Status\n"${area}","${timestamp}","Simulado"\n"Total","42","Registros"`,
          mimeType: 'text/csv',
          extension: 'csv'
        };
      default:
        return {
          content: `Exportação de ${area}\nGerado em: ${timestamp}\n\nDados simulados para demonstração.`,
          mimeType: 'text/plain',
          extension: 'txt'
        };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold">Centro de Relatórios</h2>
          <p className="text-muted-foreground">Analytics avançado e exportações de dados por área</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="analytics">Analytics Avançado</TabsTrigger>
          <TabsTrigger value="area-exports">Exportações por Área</TabsTrigger>
        </TabsList>

        {/* Aba Analytics Avançado */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card de Projetos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalProjects}</div>
                <p className="text-xs text-muted-foreground">
                  +{analyticsData.completedProjects} concluídos
                </p>
              </CardContent>
            </Card>

            {/* Card de Doações */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Doações Ativas</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.activeDonations}</div>
                <p className="text-xs text-muted-foreground">
                  {analyticsData.monthlyDonations.toLocaleString()} MZN este mês
                </p>
              </CardContent>
            </Card>

            {/* Card de Voluntários */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Voluntários Ativos</CardTitle>
                <Mail className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.activeVolunteers}</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.floor(analyticsData.activeVolunteers * 0.15)} este mês
                </p>
              </CardContent>
            </Card>

            {/* Card de Beneficiários */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Beneficiários</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData.totalBeneficiaries}</div>
                <p className="text-xs text-muted-foreground">
                  +{Math.floor(analyticsData.totalBeneficiaries * 0.08)} novos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Métricas de Impacto */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Métricas de Impacto Social
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Pessoas Ajudadas</span>
                    <Badge variant="secondary">{analyticsData.impactMetrics.peopleHelped.toLocaleString()}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Fundos Arrecadados</span>
                    <Badge variant="secondary">{analyticsData.impactMetrics.fundsRaised.toLocaleString()} MZN</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Horas de Voluntariado</span>
                    <Badge variant="secondary">{analyticsData.impactMetrics.hoursVolunteered.toLocaleString()}h</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Comunidades Alcançadas</span>
                    <Badge variant="secondary">{analyticsData.impactMetrics.communitiesReached}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Status do Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Projetos Ativos</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{analyticsData.totalProjects - analyticsData.completedProjects}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Taxa de Conclusão</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">{Math.round((analyticsData.completedProjects / analyticsData.totalProjects) * 100)}%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Engajamento Voluntários</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                      <span className="text-sm">Alto</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Crescimento Mensal</span>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
                      <span className="text-sm">+12%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Botões de Ação Rápida */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button variant="outline" className="w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Relatório de Impacto
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Dashboard Executivo
                </Button>
                <Button variant="outline" className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Dados
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Exportações por Área */}
        <TabsContent value="area-exports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Exportações por Área</h3>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Exportações de Projetos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Projetos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Exportação</Label>
                  <Select value={projectsExportType} onValueChange={setProjectsExportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Projetos</SelectItem>
                      <SelectItem value="active">Projetos Ativos</SelectItem>
                      <SelectItem value="completed">Projetos Concluídos</SelectItem>
                      <SelectItem value="pending">Projetos Pendentes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Formato</Label>
                  <Select value={projectsFormat} onValueChange={setProjectsFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                      <SelectItem value="csv">CSV (.csv)</SelectItem>
                      <SelectItem value="json">JSON (.json)</SelectItem>
                      <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => handleAreaExport('projects', projectsFormat, projectsExportType)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Exportar Projetos
                </Button>
              </CardContent>
            </Card>

            {/* Exportações de Doações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Doações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Exportação</Label>
                  <Select value={donationsExportType} onValueChange={setDonationsExportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Doações</SelectItem>
                      <SelectItem value="completed">Doações Concluídas</SelectItem>
                      <SelectItem value="pending">Doações Pendentes</SelectItem>
                      <SelectItem value="monthly">Doações Mensais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Formato</Label>
                  <Select value={donationsFormat} onValueChange={setDonationsFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                      <SelectItem value="csv">CSV (.csv)</SelectItem>
                      <SelectItem value="json">JSON (.json)</SelectItem>
                      <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => handleAreaExport('donations', donationsFormat, donationsExportType)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Exportar Doações
                </Button>
              </CardContent>
            </Card>

            {/* Exportações de Voluntários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Voluntários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Exportação</Label>
                  <Select value={volunteersExportType} onValueChange={setVolunteersExportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Voluntários</SelectItem>
                      <SelectItem value="active">Voluntários Ativos</SelectItem>
                      <SelectItem value="skills">Por Habilidades</SelectItem>
                      <SelectItem value="availability">Por Disponibilidade</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Formato</Label>
                  <Select value={volunteersFormat} onValueChange={setVolunteersFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                      <SelectItem value="csv">CSV (.csv)</SelectItem>
                      <SelectItem value="json">JSON (.json)</SelectItem>
                      <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => handleAreaExport('volunteers', volunteersFormat, volunteersExportType)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Exportar Voluntários
                </Button>
              </CardContent>
            </Card>

            {/* Exportações de Beneficiários */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Beneficiários
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Exportação</Label>
                  <Select value={beneficiariesExportType} onValueChange={setBeneficiariesExportType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Beneficiários</SelectItem>
                      <SelectItem value="location">Por Localização</SelectItem>
                      <SelectItem value="project">Por Projeto</SelectItem>
                      <SelectItem value="impact">Dados de Impacto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Formato</Label>
                  <Select value={beneficiariesFormat} onValueChange={setBeneficiariesFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                      <SelectItem value="csv">CSV (.csv)</SelectItem>
                      <SelectItem value="json">JSON (.json)</SelectItem>
                      <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full" 
                  onClick={() => handleAreaExport('beneficiaries', beneficiariesFormat, beneficiariesExportType)}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Exportar Beneficiários
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Status das Exportações */}
          <Card>
            <CardHeader>
              <CardTitle>Status das Exportações Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Projetos Ativos</span>
                    <Badge variant="secondary">Excel</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Há 2 minutos</span>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Doações Concluídas</span>
                    <Badge variant="secondary">CSV</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Há 1 hora</span>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                    <span className="font-medium">Voluntários por Habilidades</span>
                    <Badge variant="secondary">JSON</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Processando...</span>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsCenter;
