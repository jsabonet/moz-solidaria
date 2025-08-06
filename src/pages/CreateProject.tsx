// src/pages/CreateProject.tsx
// Versão melhorada com validação e interface aprimorada

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  CalendarIcon, 
  Upload, 
  MapPin, 
  Users, 
  Target,
  FileText,
  Image,
  Settings,
  Lightbulb,
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { createProject, updateProject, fetchProjectDetail, fetchPrograms, fetchProjectManagers, isAuthenticated } from '@/lib/api';

// Interfaces
interface FormData {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  content: string;
  excerpt: string;
  program_id: string;
  category_id: string;
  status: 'planning' | 'active' | 'completed' | 'suspended';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location: string;
  district: string;
  province: string;
  start_date: Date | undefined;
  end_date: Date | undefined;
  target_beneficiaries: number;
  target_budget: number;
  manager_id: string;
  team_members: string[];
  tags: string[];
  is_featured: boolean;
  is_public: boolean;
  featured_on_homepage: boolean;
  featured_image?: File | string;
  project_document?: File | string;
  meta_description: string;
}

interface Program {
  id: number;
  name: string;
}

interface User {
  id: number;
  username: string;
  full_name: string;
}

interface ValidationErrors {
  [key: string]: string;
}

// Validação básica
const validateForm = (formData: FormData): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!formData.name.trim()) {
    errors.name = 'Nome é obrigatório';
  } else if (formData.name.length < 3) {
    errors.name = 'Nome deve ter pelo menos 3 caracteres';
  } else if (formData.name.length > 200) {
    errors.name = 'Nome deve ter no máximo 200 caracteres';
  }

  if (!formData.slug.trim()) {
    errors.slug = 'Slug é obrigatório';
  } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
    errors.slug = 'Slug deve conter apenas letras minúsculas, números e hífens';
  }

  if (!formData.short_description.trim()) {
    errors.short_description = 'Descrição curta é obrigatória';
  } else if (formData.short_description.length > 300) {
    errors.short_description = 'Descrição curta deve ter no máximo 300 caracteres';
  }

  if (!formData.description.trim()) {
    errors.description = 'Descrição completa é obrigatória';
  } else if (formData.description.length < 50) {
    errors.description = 'Descrição deve ter pelo menos 50 caracteres';
  }

  if (!formData.program_id) {
    errors.program_id = 'Programa é obrigatório';
  }

  if (!formData.location.trim()) {
    errors.location = 'Localização é obrigatória';
  }

  if (formData.target_beneficiaries <= 0) {
    errors.target_beneficiaries = 'Número de beneficiários deve ser maior que zero';
  }

  if (formData.target_budget <= 0) {
    errors.target_budget = 'Orçamento deve ser maior que zero';
  }

  if (formData.start_date && formData.end_date && formData.start_date >= formData.end_date) {
    errors.end_date = 'Data de término deve ser posterior à data de início';
  }

  return errors;
};

const CreateProject: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const isEditing = !!slug;
  
  // Estados
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    short_description: '',
    description: '',
    content: '',
    excerpt: '',
    program_id: '',
    category_id: '',
    status: 'planning',
    priority: 'medium',
    location: '',
    district: '',
    province: 'Cabo Delgado',
    start_date: undefined,
    end_date: undefined,
    target_beneficiaries: 0,
    target_budget: 0,
    manager_id: '',
    team_members: [],
    tags: [],
    is_featured: false,
    is_public: true,
    featured_on_homepage: false,
    meta_description: ''
  });
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Verificar autenticação
  useEffect(() => {
    if (!isAuthenticated()) {
      toast.error('Você precisa estar logado para criar projetos.');
      navigate('/dashboard?tab=projects');
      return;
    }
  }, [navigate]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingData(true);
        
        const [programsData, usersData] = await Promise.all([
          fetchPrograms().catch(() => []),
          fetchProjectManagers().catch(() => [])
        ]);
        
        setPrograms(programsData);
        setUsers(usersData);
        
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        toast.error('Erro ao carregar dados. Usando valores padrão.');
        
        // Fallback para dados mock
        setPrograms([
          { id: 1, name: 'Educação' },
          { id: 2, name: 'Apoio Humanitário' },
          { id: 3, name: 'Formação Juvenil' },
          { id: 4, name: 'Saúde Pública' },
          { id: 5, name: 'Infraestrutura' }
        ]);
        setUsers([
          { id: 1, username: 'admin', full_name: 'Administrador Principal' },
          { id: 2, username: 'coordinator', full_name: 'Coordenador de Projetos' },
          { id: 3, username: 'manager', full_name: 'Gestor de Campo' }
        ]);
      } finally {
        setLoadingData(false);
      }
    };

    loadInitialData();
  }, []);

  // Carregar dados do projeto para edição
  useEffect(() => {
    if (isEditing && slug) {
      const loadProjectData = async () => {
        try {
          setLoadingData(true);
          const projectData = await fetchProjectDetail(slug);
          
          setProjectId(projectData.id);
          
          setFormData({
            name: projectData.name || '',
            slug: projectData.slug || '',
            short_description: projectData.short_description || '',
            description: projectData.description || '',
            content: projectData.content || '',
            excerpt: projectData.excerpt || '',
            program_id: projectData.program?.id?.toString() || '',
            category_id: projectData.category?.id?.toString() || '',
            status: projectData.status || 'planning',
            priority: projectData.priority || 'medium',
            location: projectData.location || '',
            district: projectData.district || '',
            province: projectData.province || 'Cabo Delgado',
            start_date: projectData.start_date ? new Date(projectData.start_date) : undefined,
            end_date: projectData.end_date ? new Date(projectData.end_date) : undefined,
            target_beneficiaries: projectData.target_beneficiaries || 0,
            target_budget: projectData.target_budget || 0,
            manager_id: projectData.manager?.id?.toString() || '',
            team_members: projectData.team_members || [],
            tags: projectData.tags || [],
            is_featured: projectData.is_featured || false,
            is_public: projectData.is_public !== undefined ? projectData.is_public : true,
            featured_on_homepage: projectData.featured_on_homepage || false,
            meta_description: projectData.meta_description || ''
          });
          
          toast.success('Dados do projeto carregados com sucesso!');
        } catch (error) {
          console.error('Erro ao carregar dados do projeto:', error);
          toast.error('Erro ao carregar dados do projeto');
          navigate('/dashboard?tab=projects');
        } finally {
          setLoadingData(false);
        }
      };

      loadProjectData();
    }
  }, [isEditing, slug, navigate]);

  // Auto-gerar slug
  useEffect(() => {
    if (formData.name && !isEditing) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, isEditing]);

  // Validação em tempo real
  useEffect(() => {
    if (isDirty) {
      const errors = validateForm(formData);
      setValidationErrors(errors);
    }
  }, [formData, isDirty]);

  // Atualizar campo do formulário
  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Limpar erro específico quando campo é corrigido
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    setIsDirty(true);
    
    const errors = validateForm(formData);
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      toast.error('Por favor, corrija os erros antes de continuar.');
      return;
    }

    setIsSubmitting(true);

    try {
      const hasFiles = formData.featured_image instanceof File || formData.project_document instanceof File;
      let submitData: any;
      
      if (hasFiles) {
        submitData = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (key === 'start_date' || key === 'end_date') {
              if (value instanceof Date) {
                submitData.append(key, value.toISOString().split('T')[0]);
              }
            } else if (key === 'team_members' || key === 'tags') {
              submitData.append(key, JSON.stringify(value));
            } else if (value instanceof File) {
              submitData.append(key, value);
            } else {
              submitData.append(key, value.toString());
            }
          }
        });
      } else {
        submitData = {
          ...formData,
          start_date: formData.start_date?.toISOString().split('T')[0],
          end_date: formData.end_date?.toISOString().split('T')[0]
        };
      }

      if (isDraft) {
        if (submitData instanceof FormData) {
          submitData.set('status', 'planning');
        } else {
          submitData.status = 'planning';
        }
      }

      let response;
      if (isEditing && projectId) {
        response = await updateProject(projectId, submitData);
        toast.success(`Projeto ${isDraft ? 'salvo como rascunho' : 'atualizado'} com sucesso!`);
      } else {
        response = await createProject(submitData);
        toast.success(`Projeto ${isDraft ? 'salvo como rascunho' : 'criado'} com sucesso!`);
      }
      
      setLastSaved(new Date());
      setIsDirty(false);
      navigate('/dashboard?tab=projects');

    } catch (error: any) {
      console.error('Erro ao processar projeto:', error);
      
      if (error.response?.data?.errors) {
        const serverErrors: ValidationErrors = {};
        Object.entries(error.response.data.errors).forEach(([key, messages]) => {
          if (Array.isArray(messages)) {
            serverErrors[key] = messages[0];
          }
        });
        setValidationErrors(serverErrors);
      }
      
      toast.error(error.response?.data?.message || 'Erro ao processar projeto. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file changes
  const handleFileChange = (field: 'featured_image' | 'project_document') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamanho do arquivo (máx 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Arquivo muito grande. O limite é 10MB.');
        return;
      }

      // Validar tipo de arquivo
      const allowedTypes = field === 'featured_image' 
        ? ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        : ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      
      if (!allowedTypes.includes(file.type)) {
        const typeMessage = field === 'featured_image' 
          ? 'Use apenas JPG, PNG ou WebP para imagens'
          : 'Use apenas PDF ou DOC para documentos';
        toast.error(typeMessage);
        return;
      }

      updateField(field, file);
      toast.success(`${field === 'featured_image' ? 'Imagem' : 'Documento'} carregado com sucesso!`);
    }
  };

  // Remover arquivo
  const removeFile = (field: 'featured_image' | 'project_document') => {
    updateField(field, undefined);
    toast.info(`${field === 'featured_image' ? 'Imagem' : 'Documento'} removido`);
  };

  // Componente de campo com validação
  const FormField: React.FC<{
    children: React.ReactNode;
    error?: string;
    className?: string;
  }> = ({ children, error, className }) => (
    <div className={cn('space-y-2', className)}>
      {children}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );

  // Loading state
  if (loadingData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando dados do projeto...</p>
        </div>
      </div>
    );
  }

  const isValid = Object.keys(validationErrors).length === 0;
  const hasErrors = Object.keys(validationErrors).length > 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isDirty) {
                  const confirmed = confirm('Você tem alterações não salvas. Deseja realmente sair?');
                  if (!confirmed) return;
                }
                navigate('/dashboard?tab=projects');
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {isEditing ? 'Editar Projeto' : 'Criar Novo Projeto'}
              </h1>
              <p className="text-muted-foreground">
                {isEditing ? 'Modifique as informações do projeto' : 'Preencha as informações para criar um novo projeto'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {lastSaved && (
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                Salvo {format(lastSaved, 'HH:mm', { locale: ptBR })}
              </Badge>
            )}
            {isDirty && (
              <Badge variant="secondary" className="text-xs">
                Alterações não salvas
              </Badge>
            )}
            <Button
              variant="outline"
              onClick={() => setPreviewMode(!previewMode)}
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? 'Editar' : 'Preview'}
            </Button>
          </div>
        </div>

        {/* Validation Summary */}
        {hasErrors && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-medium mb-2">Corrija os seguintes erros:</div>
              <ul className="list-disc list-inside space-y-1">
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field} className="text-sm">{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Básico
              </TabsTrigger>
              <TabsTrigger value="details" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Detalhes
              </TabsTrigger>
              <TabsTrigger value="files" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Arquivos
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Config
              </TabsTrigger>
            </TabsList>

            {/* Informações Básicas */}
            <TabsContent value="basic">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Informações Básicas
                  </CardTitle>
                  <CardDescription>
                    Dados principais do projeto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField error={validationErrors.name}>
                        <Label htmlFor="name">Nome do Projeto *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => updateField('name', e.target.value)}
                          placeholder="Digite o nome do projeto"
                          className={validationErrors.name ? 'border-destructive' : ''}
                        />
                        <div className="text-xs text-muted-foreground">
                          {formData.name.length}/200 caracteres
                        </div>
                      </FormField>

                      <FormField error={validationErrors.slug}>
                        <Label htmlFor="slug">Slug (URL) *</Label>
                        <Input
                          id="slug"
                          value={formData.slug}
                          onChange={(e) => updateField('slug', e.target.value)}
                          placeholder="url-amigavel-do-projeto"
                          disabled={isEditing}
                          className={validationErrors.slug ? 'border-destructive' : ''}
                        />
                        <div className="text-xs text-muted-foreground">
                          URL amigável gerada automaticamente
                        </div>
                      </FormField>

                      <FormField error={validationErrors.short_description}>
                        <Label htmlFor="short_description">Descrição Curta *</Label>
                        <Textarea
                          id="short_description"
                          value={formData.short_description}
                          onChange={(e) => updateField('short_description', e.target.value)}
                          placeholder="Resumo conciso do projeto"
                          rows={3}
                          className={validationErrors.short_description ? 'border-destructive' : ''}
                        />
                        <div className="text-xs text-muted-foreground">
                          {formData.short_description.length}/300 caracteres
                        </div>
                      </FormField>
                    </div>

                    <div className="space-y-4">
                      <FormField error={validationErrors.program_id}>
                        <Label htmlFor="program_id">Programa *</Label>
                        <Select
                          value={formData.program_id}
                          onValueChange={(value) => updateField('program_id', value)}
                        >
                          <SelectTrigger className={validationErrors.program_id ? 'border-destructive' : ''}>
                            <SelectValue placeholder="Selecione um programa" />
                          </SelectTrigger>
                          <SelectContent>
                            {programs.map((program) => (
                              <SelectItem key={program.id} value={program.id.toString()}>
                                {program.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>

                      <FormField error={validationErrors.status}>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => updateField('status', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planning">Planejamento</SelectItem>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="completed">Concluído</SelectItem>
                            <SelectItem value="suspended">Suspenso</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>

                      <FormField error={validationErrors.priority}>
                        <Label htmlFor="priority">Prioridade</Label>
                        <Select
                          value={formData.priority}
                          onValueChange={(value) => updateField('priority', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                            <SelectItem value="urgent">Urgente</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>
                  </div>

                  <FormField error={validationErrors.description}>
                    <Label htmlFor="description">Descrição Completa *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Descrição detalhada do projeto, objetivos e metodologia"
                      rows={6}
                      className={validationErrors.description ? 'border-destructive' : ''}
                    />
                    <div className="text-xs text-muted-foreground">
                      {formData.description.length} caracteres • {formData.description.split(/\s+/).filter(word => word.length > 0).length} palavras
                    </div>
                  </FormField>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Detalhes */}
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Detalhes do Projeto
                  </CardTitle>
                  <CardDescription>
                    Localização, datas e informações específicas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <FormField error={validationErrors.location}>
                        <Label htmlFor="location">Localização *</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => updateField('location', e.target.value)}
                          placeholder="Cidade, região ou local específico"
                          className={validationErrors.location ? 'border-destructive' : ''}
                        />
                      </FormField>

                      <FormField error={validationErrors.district}>
                        <Label htmlFor="district">Distrito</Label>
                        <Input
                          id="district"
                          value={formData.district}
                          onChange={(e) => updateField('district', e.target.value)}
                          placeholder="Nome do distrito"
                        />
                      </FormField>

                      <FormField error={validationErrors.province}>
                        <Label htmlFor="province">Província</Label>
                        <Select
                          value={formData.province}
                          onValueChange={(value) => updateField('province', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cabo Delgado">Cabo Delgado</SelectItem>
                            <SelectItem value="Gaza">Gaza</SelectItem>
                            <SelectItem value="Inhambane">Inhambane</SelectItem>
                            <SelectItem value="Manica">Manica</SelectItem>
                            <SelectItem value="Maputo">Maputo</SelectItem>
                            <SelectItem value="Nampula">Nampula</SelectItem>
                            <SelectItem value="Niassa">Niassa</SelectItem>
                            <SelectItem value="Sofala">Sofala</SelectItem>
                            <SelectItem value="Tete">Tete</SelectItem>
                            <SelectItem value="Zambézia">Zambézia</SelectItem>
                            <SelectItem value="Maputo Cidade">Maputo Cidade</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField error={validationErrors.start_date}>
                          <Label htmlFor="start_date">Data de Início</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="start_date"
                                variant="outline"
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !formData.start_date && 'text-muted-foreground',
                                  validationErrors.start_date && 'border-destructive'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.start_date ? format(formData.start_date, 'PPP', { locale: ptBR }) : 'Selecionar data'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={formData.start_date}
                                onSelect={(date) => updateField('start_date', date)}
                                initialFocus
                                locale={ptBR}
                              />
                            </PopoverContent>
                          </Popover>
                        </FormField>

                        <FormField error={validationErrors.end_date}>
                          <Label htmlFor="end_date">Data de Término</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="end_date"
                                variant="outline"
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !formData.end_date && 'text-muted-foreground',
                                  validationErrors.end_date && 'border-destructive'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.end_date ? format(formData.end_date, 'PPP', { locale: ptBR }) : 'Selecionar data'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={formData.end_date}
                                onSelect={(date) => updateField('end_date', date)}
                                initialFocus
                                locale={ptBR}
                              />
                            </PopoverContent>
                          </Popover>
                        </FormField>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField error={validationErrors.target_beneficiaries}>
                          <Label htmlFor="target_beneficiaries">Beneficiários Alvo *</Label>
                          <div className="relative">
                            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="target_beneficiaries"
                              type="number"
                              min="1"
                              value={formData.target_beneficiaries}
                              onChange={(e) => updateField('target_beneficiaries', parseInt(e.target.value) || 0)}
                              placeholder="100"
                              className={cn(
                                'pl-10',
                                validationErrors.target_beneficiaries && 'border-destructive'
                              )}
                            />
                          </div>
                        </FormField>

                        <FormField error={validationErrors.target_budget}>
                          <Label htmlFor="target_budget">Orçamento (MZN) *</Label>
                          <div className="relative">
                            <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="target_budget"
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.target_budget}
                              onChange={(e) => updateField('target_budget', parseFloat(e.target.value) || 0)}
                              placeholder="50000"
                              className={cn(
                                'pl-10',
                                validationErrors.target_budget && 'border-destructive'
                              )}
                            />
                          </div>
                        </FormField>
                      </div>

                      <FormField error={validationErrors.manager_id}>
                        <Label htmlFor="manager_id">Gestor do Projeto</Label>
                        <Select
                          value={formData.manager_id}
                          onValueChange={(value) => updateField('manager_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um gestor" />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id.toString()}>
                                {user.full_name || user.username}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormField>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Arquivos */}
            <TabsContent value="files">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Arquivos e Documentos
                  </CardTitle>
                  <CardDescription>
                    Imagem em destaque e documentos do projeto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Imagem em Destaque */}
                    <div className="space-y-4">
                      <Label>Imagem em Destaque</Label>
                      <div className="text-sm text-muted-foreground mb-2">
                        JPG, PNG, WebP - máximo 10MB
                      </div>
                      
                      {formData.featured_image ? (
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Image className="h-5 w-5 text-green-600" />
                              <div>
                                <p className="font-medium">
                                  {formData.featured_image instanceof File 
                                    ? formData.featured_image.name 
                                    : 'Imagem atual'
                                  }
                                </p>
                                {formData.featured_image instanceof File && (
                                  <p className="text-sm text-muted-foreground">
                                    {(formData.featured_image.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile('featured_image')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground mb-4">
                            Clique para selecionar uma imagem
                          </p>
                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleFileChange('featured_image')}
                            className="hidden"
                            id="featured_image"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('featured_image')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Selecionar Imagem
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Documento do Projeto */}
                    <div className="space-y-4">
                      <Label>Documento do Projeto</Label>
                      <div className="text-sm text-muted-foreground mb-2">
                        PDF, DOC - máximo 10MB
                      </div>
                      
                      {formData.project_document ? (
                        <div className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="h-5 w-5 text-blue-600" />
                              <div>
                                <p className="font-medium">
                                  {formData.project_document instanceof File 
                                    ? formData.project_document.name 
                                    : 'Documento atual'
                                  }
                                </p>
                                {formData.project_document instanceof File && (
                                  <p className="text-sm text-muted-foreground">
                                    {(formData.project_document.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile('project_document')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground mb-4">
                            Clique para selecionar um documento
                          </p>
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={handleFileChange('project_document')}
                            className="hidden"
                            id="project_document"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('project_document')?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Selecionar Documento
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Configurações */}
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configurações
                  </CardTitle>
                  <CardDescription>
                    Visibilidade e configurações avançadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Projeto Público</Label>
                            <p className="text-xs text-muted-foreground">
                              Visível na galeria pública de projetos
                            </p>
                          </div>
                          <Switch
                            checked={formData.is_public}
                            onCheckedChange={(checked) => updateField('is_public', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Projeto em Destaque</Label>
                            <p className="text-xs text-muted-foreground">
                              Aparece na seção de projetos destacados
                            </p>
                          </div>
                          <Switch
                            checked={formData.is_featured}
                            onCheckedChange={(checked) => updateField('is_featured', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Destaque na Homepage</Label>
                            <p className="text-xs text-muted-foreground">
                              Aparece na página inicial do site
                            </p>
                          </div>
                          <Switch
                            checked={formData.featured_on_homepage}
                            onCheckedChange={(checked) => updateField('featured_on_homepage', checked)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <FormField error={validationErrors.meta_description}>
                        <Label htmlFor="meta_description">Meta Descrição (SEO)</Label>
                        <Textarea
                          id="meta_description"
                          value={formData.meta_description}
                          onChange={(e) => updateField('meta_description', e.target.value)}
                          placeholder="Descrição para motores de busca"
                          rows={3}
                        />
                        <div className="text-xs text-muted-foreground">
                          {formData.meta_description.length}/160 caracteres • Ideal: 120-160 caracteres
                        </div>
                      </FormField>

                      <FormField error={validationErrors.excerpt}>
                        <Label htmlFor="excerpt">Resumo Executivo</Label>
                        <Textarea
                          id="excerpt"
                          value={formData.excerpt}
                          onChange={(e) => updateField('excerpt', e.target.value)}
                          placeholder="Resumo para exibição em listas"
                          rows={4}
                        />
                        <div className="text-xs text-muted-foreground">
                          Resumo opcional para cards e listas
                        </div>
                      </FormField>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {isValid ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Formulário válido
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {Object.keys(validationErrors).length} erro{Object.keys(validationErrors).length > 1 ? 's' : ''} encontrado{Object.keys(validationErrors).length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => handleSubmit(e, true)}
                    disabled={isSubmitting}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Rascunho
                  </Button>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        {isEditing ? 'Atualizando...' : 'Criando...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {isEditing ? 'Atualizar Projeto' : 'Criar Projeto'}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
