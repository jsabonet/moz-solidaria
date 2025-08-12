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
import jsPDF from 'jspdf';

const ReportsCenter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('area-exports');

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
        console.error('Erro ao carregar analytics:', error);
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
        sessionStorage.getItem('authToken') ||
        sessionStorage.getItem('access_token') ||
        '';

      if (!authToken) {
        toast.warning('Você precisa estar logado para acessar dados reais. Gerando arquivo simulado.');
        // Ir direto para fallback se não há token
        throw new Error('Token de autenticação não encontrado');
      }

      // Preparar parâmetros para a exportação
      const exportParams = {
        area,
        format,
        type: exportType || 'all'
      };

      // O backend tem um endpoint 'area_exports' que aceita diferentes áreas
      const endpoint = 'area_exports';

      // Tentar fazer a exportação via API
      try {
        const response = await fetch(`http://localhost:8000/api/v1/reports/exports/${endpoint}/`, {
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
            
            // Mapear formato para extensão correta
            const extensions: Record<string, string> = {
              'excel': 'xlsx',
              'pdf': 'pdf',
              'csv': 'csv',
              'json': 'json'
            };
            
            a.download = `${area}_export_${new Date().getTime()}.${extensions[format] || format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success(`Exportação de ${area} concluída! Dados reais do sistema.`);
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
            toast.success(`Exportação de ${area} concluída! Dados reais do sistema.`);
          }
        } else {
          // Verificar se é erro de autenticação
          if (response.status === 401) {
            toast.error('Sessão expirada. Faça login novamente para acessar dados reais.');
            throw new Error('Não autorizado - token inválido ou expirado');
          } else if (response.status === 403) {
            toast.error('Você não tem permissão para exportar estes dados.');
            throw new Error('Acesso negado');
          } else {
            throw new Error(`Erro na API: ${response.status}`);
          }
        }
      } catch (apiError) {
        console.warn('Backend não disponível, usando fallback simulado:', apiError);
        toast.warning(`Backend indisponível. Gerando ${format.toUpperCase()} simulado para demonstração.`);
        
        // Fallback: gerar arquivo simulado apenas quando API não funciona
        const simulatedData = generateSimulatedData(area, format);
        
        // Tratar PDF de forma diferente (já é um blob)
        let blob: Blob;
        if (format === 'pdf' && simulatedData.content instanceof Blob) {
          blob = simulatedData.content;
        } else {
          blob = new Blob([simulatedData.content], { type: simulatedData.mimeType });
        }
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${area}_export_SIMULADO_${new Date().getTime()}.${simulatedData.extension}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast.info(`Arquivo simulado de ${area} gerado. Para dados reais, verifique se o servidor Django está rodando.`);
      }
    } catch (error) {
      console.error('Erro na exportação:', error);
      toast.error(`Erro ao exportar ${area}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateSimulatedData = (area: string, format: string) => {
    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString('pt-BR');
    
    switch (format) {
      case 'json':
        return {
          content: JSON.stringify({
            area,
            generated_at: timestamp,
            total_records: 42,
            data: [
              { id: 1, name: `Registro exemplo 1 de ${area}`, status: 'Ativo', created_at: timestamp },
              { id: 2, name: `Registro exemplo 2 de ${area}`, status: 'Pendente', created_at: timestamp },
              { id: 3, name: `Registro exemplo 3 de ${area}`, status: 'Concluído', created_at: timestamp }
            ]
          }, null, 2),
          mimeType: 'application/json',
          extension: 'json'
        };
      case 'csv':
        return {
          content: `ID,Nome,Status,Data de Criação\n1,"Registro exemplo 1 de ${area}","Ativo","${formattedDate}"\n2,"Registro exemplo 2 de ${area}","Pendente","${formattedDate}"\n3,"Registro exemplo 3 de ${area}","Concluído","${formattedDate}"`,
          mimeType: 'text/csv',
          extension: 'csv'
        };
      case 'pdf':
        // Gerar PDF usando jsPDF
        return generateSimulatedPDF(area, formattedDate);
      default:
        return {
          content: `Relatório de ${area}\nGerado em: ${formattedDate}\n\nEste é um arquivo de demonstração.\n\nDados simulados:\n- Total de registros: 42\n- Status: Sistema funcionando\n- Última atualização: ${formattedDate}`,
          mimeType: 'text/plain',
          extension: 'txt'
        };
    }
  };

  const generateSimulatedPDF = (area: string, date: string) => {
    const doc = new jsPDF();
    
    // Cabeçalho
    doc.setFontSize(20);
    doc.text(`Relatório de ${area.charAt(0).toUpperCase() + area.slice(1)}`, 20, 30);
    
    doc.setFontSize(12);
    doc.text(`Gerado em: ${date}`, 20, 45);
    doc.text('Sistema: Moz Solidária Hub', 20, 55);
    doc.text('Tipo: Demonstração/Simulação', 20, 65);
    
    // Linha separadora
    doc.line(20, 75, 190, 75);
    
    // Informações gerais
    doc.setFontSize(14);
    doc.text('Resumo Executivo', 20, 90);
    
    doc.setFontSize(10);
    doc.text('• Total de registros: 42', 25, 105);
    doc.text('• Status do sistema: Operacional', 25, 115);
    doc.text('• Última sincronização: ' + date, 25, 125);
    doc.text('• Qualidade dos dados: 98%', 25, 135);
    
    // Dados simulados em formato tabular simples
    doc.setFontSize(12);
    doc.text('Dados de Amostra:', 20, 155);
    
    doc.setFontSize(10);
    let yPosition = 170;
    
    // Cabeçalho da tabela
    doc.text('ID', 25, yPosition);
    doc.text('Nome', 50, yPosition);
    doc.text('Status', 120, yPosition);
    doc.text('Data', 160, yPosition);
    
    // Linha do cabeçalho
    doc.line(20, yPosition + 3, 190, yPosition + 3);
    yPosition += 15;
    
    // Dados da tabela
    const tableData = [
      ['001', `Registro exemplo 1 de ${area}`, 'Ativo', date],
      ['002', `Registro exemplo 2 de ${area}`, 'Pendente', date],
      ['003', `Registro exemplo 3 de ${area}`, 'Concluído', date],
      ['004', `Registro exemplo 4 de ${area}`, 'Ativo', date],
      ['005', `Registro exemplo 5 de ${area}`, 'Revisão', date]
    ];
    
    tableData.forEach((row) => {
      doc.text(row[0], 25, yPosition);
      doc.text(row[1].substring(0, 30) + (row[1].length > 30 ? '...' : ''), 50, yPosition);
      doc.text(row[2], 120, yPosition);
      doc.text(row[3], 160, yPosition);
      yPosition += 12;
    });
    
    // Rodapé
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.text('Moz Solidária Hub - Relatório Simulado', 20, pageHeight - 20);
    doc.text(`Página 1 de 1 - ${new Date().toLocaleString('pt-BR')}`, 20, pageHeight - 10);
    
    // Retornar como blob
    const pdfBlob = doc.output('blob');
    return {
      content: pdfBlob,
      mimeType: 'application/pdf',
      extension: 'pdf'
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold">Centro de Relatórios</h2>
          <p className="text-muted-foreground">Exportações de dados por área - Projetos, Doações, Voluntários e Beneficiários</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        {/* <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="area-exports">Exportações por Área</TabsTrigger>
        </TabsList> */}

        {/* Aba de Exportações por Área */}
        <TabsContent value="area-exports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Selecione a área e formato para exportação</h3>
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsCenter;
