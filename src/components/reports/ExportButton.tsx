// src/components/reports/ExportButton.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Download, 
  FileText, 
  FileSpreadsheet, 
  File,
  Mail,
  Settings,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { reportsApi, downloadFile, handleApiError } from '@/services/reportsApi';
import { ExportOptions as ImportedExportOptions, ExportRequest } from '@/types/reports';

interface ExportButtonProps {
  data: any[];
  filename: string;
  type: 'donations' | 'volunteers' | 'beneficiaries' | 'partners' | 'projects' | 'blog';
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeHeaders: boolean;
  dateRange?: { from: string; to: string };
  selectedFields: string[];
  emailRecipients: string[];
  includeImages: boolean;
  summaryStats: boolean;
  includeMetadata?: boolean;
  useRealData?: boolean;
  generateFrom?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename,
  type,
  className = '',
  variant = 'outline',
  size = 'sm'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [options, setOptions] = useState<ExportOptions>({
    format: 'excel',
    includeHeaders: true,
    selectedFields: [],
    emailRecipients: [],
    includeImages: false,
    summaryStats: true
  });

  // Definir campos disponíveis por tipo
  const getAvailableFields = () => {
    switch (type) {
      case 'donations':
        return [
          { id: 'amount', label: 'Valor', default: true },
          { id: 'donor_name', label: 'Nome do Doador', default: true },
          { id: 'donor_email', label: 'Email do Doador', default: false },
          { id: 'donor_phone', label: 'Telefone do Doador', default: false },
          { id: 'payment_method', label: 'Método de Pagamento', default: true },
          { id: 'status', label: 'Status', default: true },
          { id: 'created_at', label: 'Data da Doação', default: true },
          { id: 'project_name', label: 'Projeto', default: true },
          { id: 'receipt_number', label: 'Número do Recibo', default: false },
          { id: 'notes', label: 'Observações', default: false }
        ];
      case 'volunteers':
        return [
          { id: 'full_name', label: 'Nome Completo', default: true },
          { id: 'email', label: 'Email', default: true },
          { id: 'phone', label: 'Telefone', default: true },
          { id: 'skills', label: 'Habilidades', default: true },
          { id: 'availability', label: 'Disponibilidade', default: true },
          { id: 'experience', label: 'Experiência', default: false },
          { id: 'projects_count', label: 'Projetos Participados', default: true },
          { id: 'hours_contributed', label: 'Horas Contribuídas', default: true },
          { id: 'registration_date', label: 'Data de Cadastro', default: true },
          { id: 'last_activity', label: 'Última Atividade', default: false }
        ];
      case 'beneficiaries':
        return [
          { id: 'name', label: 'Nome', default: true },
          { id: 'age', label: 'Idade', default: true },
          { id: 'location', label: 'Localização', default: true },
          { id: 'family_size', label: 'Tamanho da Família', default: true },
          { id: 'income_level', label: 'Nível de Renda', default: false },
          { id: 'needs_category', label: 'Categoria de Necessidade', default: true },
          { id: 'services_received', label: 'Serviços Recebidos', default: true },
          { id: 'registration_date', label: 'Data de Cadastro', default: true },
          { id: 'status', label: 'Status', default: true },
          { id: 'notes', label: 'Observações', default: false }
        ];
      case 'partners':
        return [
          { id: 'organization_name', label: 'Nome da Organização', default: true },
          { id: 'contact_person', label: 'Pessoa de Contato', default: true },
          { id: 'contact_email', label: 'Email de Contato', default: true },
          { id: 'partnership_type', label: 'Tipo de Parceria', default: true },
          { id: 'contribution_type', label: 'Tipo de Contribuição', default: true },
          { id: 'start_date', label: 'Data de Início', default: true },
          { id: 'status', label: 'Status', default: true },
          { id: 'projects_involved', label: 'Projetos Envolvidos', default: true },
          { id: 'total_contribution', label: 'Contribuição Total', default: false },
          { id: 'contract_details', label: 'Detalhes do Contrato', default: false }
        ];
      case 'projects':
        return [
          { id: 'title', label: 'Título', default: true },
          { id: 'description', label: 'Descrição', default: false },
          { id: 'category', label: 'Categoria', default: true },
          { id: 'status', label: 'Status', default: true },
          { id: 'progress', label: 'Progresso (%)', default: true },
          { id: 'budget', label: 'Orçamento', default: true },
          { id: 'funds_raised', label: 'Verba Arrecadada', default: true },
          { id: 'beneficiaries_count', label: 'Número de Beneficiários', default: true },
          { id: 'start_date', label: 'Data de Início', default: true },
          { id: 'end_date', label: 'Data de Término', default: true },
          { id: 'location', label: 'Localização', default: true }
        ];
      case 'blog':
        return [
          { id: 'title', label: 'Título', default: true },
          { id: 'author', label: 'Autor', default: true },
          { id: 'category', label: 'Categoria', default: true },
          { id: 'status', label: 'Status', default: true },
          { id: 'published_at', label: 'Data de Publicação', default: true },
          { id: 'views_count', label: 'Visualizações', default: true },
          { id: 'likes_count', label: 'Curtidas', default: true },
          { id: 'comments_count', label: 'Comentários', default: true },
          { id: 'tags', label: 'Tags', default: false },
          { id: 'excerpt', label: 'Resumo', default: false }
        ];
      default:
        return [];
    }
  };

  const handleQuickExport = async (format: 'csv' | 'excel' | 'pdf') => {
    const quickOptions = {
      ...options,
      format,
      selectedFields: getAvailableFields().filter(field => field.default).map(field => field.id)
    };
    await exportData(quickOptions);
  };

  const exportData = async (exportOptions: ExportOptions) => {
    try {
      setIsExporting(true);

      // Preparar dados para exportação com estrutura completa
      const exportPayload: ExportRequest = {
        type,
        format: exportOptions.format,
        filename,
        options: {
          ...exportOptions,
          selectedFields: exportOptions.selectedFields.length > 0 
            ? exportOptions.selectedFields 
            : getAvailableFields().filter(field => field.default).map(field => field.id),
          includeMetadata: true,
          useRealData: true,
          generateFrom: 'dashboard'
        },
        data: data.length > 0 ? data : undefined
      };

      try {
        // Sempre tentar usar a API real primeiro
        if (exportOptions.emailRecipients.length > 0) {
          // Envio por email via API
          await reportsApi.exportData(exportPayload);
          toast.success('✅ Exportação enviada por email!');
        } else {
          // Download direto via API
          const blob = await reportsApi.exportData(exportPayload);
          downloadFile(blob, filename, exportOptions.format);
          toast.success(`✅ Download ${exportOptions.format.toUpperCase()} iniciado via backend!`);
        }
      } catch (apiError) {
        // Só usar fallback em caso de erro crítico
        if (apiError.message?.includes('Failed to fetch') || 
            apiError.message?.includes('NetworkError') || 
            apiError.message?.includes('ERR_CONNECTION_REFUSED')) {
          const simulatedData = generateSimulatedExportData(type, exportOptions);
          const blob = new Blob([simulatedData], {
            type: getContentTypeForFormat(exportOptions.format)
          });
          
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${filename}_${new Date().toISOString().split('T')[0]}.${exportOptions.format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          toast.error('⚠️ Servidor indisponível - usando dados locais de demonstração');
        } else {
          // Re-throw outros erros para debug
          toast.error(`Erro na exportação: ${apiError.message}`);
          throw apiError;
        }
      }
    } catch (error) {
      toast.error('Erro ao exportar dados');
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const generateSimulatedExportData = (dataType: string, options: ExportOptions): string => {
    const timestamp = new Date().toLocaleString();
    
    if (options.format === 'json') {
      return JSON.stringify({
        export_info: {
          type: dataType,
          generated_at: timestamp,
          format: options.format,
          total_records: data.length || 10
        },
        data: data.length > 0 ? data : getMockDataForType(dataType),
        summary: options.summaryStats ? {
          total_count: data.length || 10,
          export_date: timestamp
        } : undefined
      }, null, 2);
    } else if (options.format === 'csv') {
      const headers = options.selectedFields.length > 0 
        ? options.selectedFields 
        : getDefaultFieldsForType(dataType);
      
      let csvContent = options.includeHeaders ? headers.join(',') + '\n' : '';
      
      const exportData = data.length > 0 ? data : getMockDataForType(dataType);
      exportData.forEach((row: any) => {
        const values = headers.map(field => {
          const value = row[field] || 'N/A';
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        });
        csvContent += values.join(',') + '\n';
      });
      
      return csvContent;
    } else {
      return `Exportação ${dataType}\nGerado em: ${timestamp}\n\nTotal de registros: ${data.length || 10}\n\nEsta é uma exportação simulada para demonstração.`;
    }
  };

  const getMockDataForType = (dataType: string): any[] => {
    switch (dataType) {
      case 'donations':
        return [
          { amount: 1000, donor_name: 'João Silva', payment_method: 'Cartão', status: 'Concluída', created_at: '2024-01-15' },
          { amount: 500, donor_name: 'Maria Santos', payment_method: 'PIX', status: 'Concluída', created_at: '2024-01-20' },
          { amount: 2000, donor_name: 'Pedro Costa', payment_method: 'Transferência', status: 'Pendente', created_at: '2024-02-01' }
        ];
      case 'volunteers':
        return [
          { full_name: 'Ana Silva', email: 'ana@email.com', skills: 'Educação', projects_count: 3, hours_contributed: 120 },
          { full_name: 'Carlos Santos', email: 'carlos@email.com', skills: 'Saúde', projects_count: 2, hours_contributed: 80 },
          { full_name: 'Lucia Costa', email: 'lucia@email.com', skills: 'Tecnologia', projects_count: 5, hours_contributed: 200 }
        ];
      case 'projects':
        return [
          { name: 'Água Limpa', status: 'Ativo', budget: 50000, progress: 75, start_date: '2024-01-01' },
          { name: 'Educação Rural', status: 'Concluído', budget: 30000, progress: 100, start_date: '2023-06-01' },
          { name: 'Saúde Comunitária', status: 'Planejamento', budget: 80000, progress: 25, start_date: '2024-03-01' }
        ];
      default:
        return [{ id: 1, name: 'Exemplo', value: 'Simulado' }];
    }
  };

  const getDefaultFieldsForType = (dataType: string): string[] => {
    const fieldMap = getAvailableFields();
    return fieldMap.filter(field => field.default).map(field => field.id);
  };

  const getContentTypeForFormat = (format: string): string => {
    switch (format) {
      case 'json':
        return 'application/json';
      case 'csv':
        return 'text/csv';
      case 'excel':
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      case 'pdf':
        return 'application/pdf';
      default:
        return 'text/plain';
    }
  };

  const handleAdvancedExport = () => {
    exportData(options);
  };

  const availableFields = getAvailableFields();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size} className={className} disabled={data.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Exportação Rápida</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleQuickExport('excel')} disabled={isExporting}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Excel (.xlsx)
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleQuickExport('csv')} disabled={isExporting}>
            <File className="h-4 w-4 mr-2" />
            CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleQuickExport('pdf')} disabled={isExporting}>
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setIsOpen(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Opções Avançadas
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Opções de Exportação Avançadas</DialogTitle>
            <DialogDescription>
              Configure as opções detalhadas para a exportação de dados.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Formato */}
            <div className="space-y-2">
              <Label>Formato de Exportação</Label>
              <div className="flex gap-2">
                {['excel', 'csv', 'pdf', 'json'].map((format) => (
                  <Button
                    key={format}
                    variant={options.format === format ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setOptions(prev => ({ ...prev, format: format as any }))}
                  >
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Campos para Exportar */}
            <div className="space-y-2">
              <Label>Campos para Exportar</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-3">
                <div className="space-y-2">
                  {availableFields.map((field) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.id}
                        checked={options.selectedFields.includes(field.id) || field.default}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setOptions(prev => ({
                              ...prev,
                              selectedFields: [...prev.selectedFields, field.id]
                            }));
                          } else {
                            setOptions(prev => ({
                              ...prev,
                              selectedFields: prev.selectedFields.filter(f => f !== field.id)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={field.id} className="text-sm">
                        {field.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Filtros de Data */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Input
                  type="date"
                  value={options.dateRange?.from || ''}
                  onChange={(e) => setOptions(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange!, from: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Data Final</Label>
                <Input
                  type="date"
                  value={options.dateRange?.to || ''}
                  onChange={(e) => setOptions(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange!, to: e.target.value }
                  }))}
                />
              </div>
            </div>

            {/* Opções Adicionais */}
            <div className="space-y-3">
              <Label>Opções Adicionais</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="includeHeaders"
                    checked={options.includeHeaders}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, includeHeaders: checked as boolean }))
                    }
                  />
                  <Label htmlFor="includeHeaders">Incluir cabeçalhos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="summaryStats"
                    checked={options.summaryStats}
                    onCheckedChange={(checked) => 
                      setOptions(prev => ({ ...prev, summaryStats: checked as boolean }))
                    }
                  />
                  <Label htmlFor="summaryStats">Incluir estatísticas resumidas</Label>
                </div>
                {(type === 'beneficiaries' || type === 'partners') && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="includeImages"
                      checked={options.includeImages}
                      onCheckedChange={(checked) => 
                        setOptions(prev => ({ ...prev, includeImages: checked as boolean }))
                      }
                    />
                    <Label htmlFor="includeImages">Incluir imagens (apenas PDF)</Label>
                  </div>
                )}
              </div>
            </div>

            {/* Email Recipients */}
            <div className="space-y-2">
              <Label>Enviar por Email (opcional)</Label>
              <Input
                placeholder="email1@exemplo.com, email2@exemplo.com"
                value={options.emailRecipients.join(', ')}
                onChange={(e) => setOptions(prev => ({
                  ...prev,
                  emailRecipients: e.target.value.split(',').map(email => email.trim()).filter(Boolean)
                }))}
              />
              <p className="text-xs text-muted-foreground">
                Se preenchido, o arquivo será enviado por email ao invés de fazer download
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAdvancedExport} disabled={isExporting}>
              {isExporting ? (
                <>
                  <Download className="h-4 w-4 mr-2 animate-pulse" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportButton;
