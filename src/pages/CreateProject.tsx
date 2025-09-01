// src/pages/CreateProject.tsx
// Versão melhorada com validação e interface aprimorada

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { createProject, updateProject, fetchProjectDetail, fetchProjectDetailForEdit, fetchPrograms, fetchProjectManagers, fetchCategories, isAuthenticated } from '@/lib/api';

// Interfaces
interface FormData {
  name: string;
  slug: string;
  short_description: string;
  description: string;
  content: string;
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
  budget: number;
  is_featured: boolean;
  is_public: boolean;
  featured_image?: File | string;
  meta_description: string;
  meta_keywords: string;
}

interface Program {
  id: number;
  name: string;
}

interface CategoryOption {
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

  if (formData.budget <= 0) {
    errors.budget = 'Orçamento deve ser maior que zero';
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
    name: '', slug: '', short_description: '', description: '', content: '',
    program_id: '', category_id: '', status: 'planning', priority: 'medium',
    location: '', district: '', province: 'Cabo Delgado', start_date: undefined,
    end_date: undefined, target_beneficiaries: 0, budget: 0, is_featured: false,
    is_public: true, meta_description: '', meta_keywords: ''
  });
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
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
        
        const [programsData, usersData, categoriesData] = await Promise.all([
          fetchPrograms().catch(() => []),
          fetchProjectManagers().catch(() => []),
          fetchCategories().catch(() => [])
        ]);
        
        setPrograms(programsData);
        setUsers(usersData);
        setCategories(categoriesData);
        
        // Log para debug
        console.log('📋 Programas carregados:', programsData);
        console.log('👥 Usuários carregados:', usersData);
        console.log('🏷️ Categorias carregadas:', categoriesData);
        
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        toast.error('Erro ao carregar dados. Usando valores padrão.');
        
        // Fallback para dados mock - programas baseados no sistema real
        setPrograms([
          { id: 1, name: 'Apoio Alimentar e Nutricional' },
          { id: 2, name: 'Reconstrução e Habitação' }, 
          { id: 3, name: 'Educação e Capacitação' },
          { id: 4, name: 'Saúde Comunitária' },
          { id: 5, name: 'Proteção e Direitos Humanos' },
          { id: 6, name: 'Apoio Psicossocial' }
        ]);
        setCategories([
          { id: 1, name: 'Educação' },
          { id: 2, name: 'Saúde' },
          { id: 3, name: 'Infraestrutura' },
          { id: 4, name: 'Assistência Social' },
          { id: 5, name: 'Habitação' },
          { id: 6, name: 'Proteção Social' }
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
          console.log('🔄 Carregando dados do projeto para edição:', slug);
          const projectData = await fetchProjectDetailForEdit(slug);
          console.log('📊 Dados do projeto recebidos:', projectData);
          
          setProjectId(projectData.id);
          
          const formDataToSet = {
            name: projectData.name || '',
            slug: projectData.slug || '',
            short_description: projectData.short_description || '',
            description: projectData.description || '',
            content: projectData.content || '',
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
            budget: projectData.budget ? parseFloat(projectData.budget) : 0,
            is_featured: projectData.is_featured || false,
            is_public: projectData.is_public !== undefined ? projectData.is_public : true,
            meta_description: projectData.meta_description || '',
            meta_keywords: projectData.meta_keywords || ''
          };
          
          console.log('📝 Dados do formulário que serão definidos:', formDataToSet);
          setFormData(formDataToSet);
          
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

  // Auto-gerar slug com debounce para evitar re-renderizações excessivas
  useEffect(() => {
    if (formData.name && !isEditing) {
      const timeoutId = setTimeout(() => {
        const slug = formData.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        
        // Só atualiza se o slug for diferente do atual
        if (slug !== formData.slug) {
          setFormData(prev => ({ ...prev, slug }));
        }
      }, 300); // Debounce de 300ms

      return () => clearTimeout(timeoutId);
    }
  }, [formData.name, isEditing, formData.slug]);

  // Validação em tempo real com useMemo para evitar re-renderizações
  const computedValidationErrors = useMemo(() => {
    if (!isDirty) return {};
    return validateForm(formData);
  }, [formData, isDirty]);

  // Atualizar estado de errors apenas quando validationErrors mudar
  useEffect(() => {
    setValidationErrors(computedValidationErrors);
  }, [computedValidationErrors]);

  // Atualizar campo do formulário (otimizado com useCallback)
  const updateField = useCallback((field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
    
    // Limpar erro específico quando campo é corrigido
    setValidationErrors(prev => {
      if (prev[field]) {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Submissão do formulário (otimizado com useCallback)
  const handleSubmit = useCallback(async (e: React.FormEvent, isDraft: boolean = false) => {
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
      const hasFiles = formData.featured_image instanceof File;
      let submitData: any;
      const basePayload: any = {
        name: formData.name,
        description: formData.description,
        short_description: formData.short_description,
        content: formData.content,
        program_id: formData.program_id ? parseInt(formData.program_id) : undefined,
        category_id: formData.category_id ? parseInt(formData.category_id) : undefined,
        location: formData.location,
        district: formData.district,
        province: formData.province,
        status: formData.status,
        priority: formData.priority,
        start_date: formData.start_date ? formData.start_date.toISOString().split('T')[0] : undefined,
        end_date: formData.end_date ? formData.end_date.toISOString().split('T')[0] : undefined,
        target_beneficiaries: formData.target_beneficiaries,
        budget: formData.budget,
        meta_description: formData.meta_description,
        meta_keywords: formData.meta_keywords,
        is_featured: formData.is_featured,
        is_public: formData.is_public,
        accepts_donations: true
      };
      if (hasFiles) {
        submitData = new FormData();
        Object.entries(basePayload).forEach(([k,v]) => { if (v!==undefined && v!==null) submitData.append(k, String(v)); });
        submitData.append('featured_image', formData.featured_image as File);
      } else {
        submitData = basePayload;
      }

      if (isDraft) {
        if (submitData instanceof FormData) submitData.set('status','planning'); else submitData.status='planning';
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
  }, [formData, isEditing, projectId, navigate]);

  // Handle file changes (otimizado com useCallback)
  const handleFileChange = useCallback((field: 'featured_image') => (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar tamanho do arquivo (máx 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('Arquivo muito grande. O limite é 10MB.');
        return;
      }

      // Validar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Use apenas JPG, PNG ou WebP para imagens');
        return;
      }

      updateField(field, file);
      toast.success('Imagem carregada com sucesso!');
    }
  }, [updateField]);

  // Remover imagem (otimizado com useCallback)
  const removeFile = useCallback((field: 'featured_image') => {
    updateField(field, undefined);
    toast.info('Imagem removida');
  }, [updateField]);

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
                            {programs.length === 0 ? (
                              <SelectItem value="" disabled>
                                Nenhum programa disponível
                              </SelectItem>
                            ) : (
                              programs.map((program) => (
                                <SelectItem key={program.id} value={program.id.toString()}>
                                  {program.name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        {programs.length === 0 && (
                          <div className="text-xs text-muted-foreground text-amber-600">
                            ⚠️ Nenhum programa carregado. Verifique a conexão com o servidor.
                          </div>
                        )}
                        <div className="text-xs text-muted-foreground">
                          Programas disponíveis: {programs.length}
                        </div>
                      </FormField>

                      <FormField error={validationErrors.category_id}>
                        <Label htmlFor="category_id">Categoria</Label>
                        <Select
                          value={formData.category_id}
                          onValueChange={(value) => updateField('category_id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id.toString()}>
                                {cat.name}
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

                  <FormField>
                    <Label htmlFor="content">Conteúdo / Detalhes Adicionais</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => updateField('content', e.target.value)}
                      placeholder="Texto detalhado, metodologia, parceiros, etc."
                      rows={6}
                    />
                  </FormField>

                  <FormField>
                    <Label htmlFor="meta_keywords">Meta Keywords (SEO) - separadas por vírgula</Label>
                    <Input
                      id="meta_keywords"
                      value={formData.meta_keywords}
                      onChange={(e) => updateField('meta_keywords', e.target.value)}
                      placeholder="educação, saúde, crianças"
                    />
                    <div className="text-xs text-muted-foreground">Palavras-chave para SEO (opcional)</div>
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

                        <FormField error={validationErrors.budget}>
                          <Label htmlFor="budget">Orçamento (MZN) *</Label>
                          <div className="relative">
                            <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="budget"
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.budget}
                              onChange={(e) => updateField('budget', parseFloat(e.target.value) || 0)}
                              placeholder="50000"
                              className={cn(
                                'pl-10', validationErrors.budget && 'border-destructive'
                              )}
                            />
                          </div>
                        </FormField>
                      </div>

                      {/* Campo gestor removido (não existe no modelo Project) */}
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
                                {typeof formData.featured_image === 'string' && (
                                  <img
                                    src={formData.featured_image}
                                    alt="Imagem atual"
                                    className="mt-2 h-32 w-full object-cover rounded"
                                  />
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

                    {/* Campo de documento removido (não suportado pelo modelo Project) */}
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

                        {/* Destaque na homepage removido: não existe no modelo */}
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

                      {/* Campo excerpt removido: não existe no modelo */}
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
