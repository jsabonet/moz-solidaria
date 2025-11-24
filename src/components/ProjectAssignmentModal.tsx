// src/components/ProjectAssignmentModal.tsx
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Loader2, Users, Building } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import api from '@/lib/api';

interface Project {
  id: number;
  name: string;
  slug: string;
  status: string;
  priority: string;
}

interface Partner {
  id: number;
  name: string;
  username: string;
  email: string;
  active_projects: number;
}

interface ProjectAssignmentModalProps {
  trigger?: React.ReactNode;
  onAssignmentCreated?: () => void;
  preselectedProject?: Project;
  preselectedPartner?: Partner;
}

const ProjectAssignmentModal: React.FC<ProjectAssignmentModalProps> = ({
  trigger,
  onAssignmentCreated,
  preselectedProject,
  preselectedPartner
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form data
  const [selectedProject, setSelectedProject] = useState<Project | null>(preselectedProject || null);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(preselectedPartner || null);
  const [role, setRole] = useState<string>('implementer');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [termsConditions, setTermsConditions] = useState('');
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Data lists
  const [projects, setProjects] = useState<Project[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  
  const roleOptions = [
    { value: 'implementer', label: 'Implementador do Projeto' },
    { value: 'supporter', label: 'Apoiador do Projeto' },
    { value: 'advisor', label: 'Consultor do Projeto' },
    { value: 'sponsor', label: 'Patrocinador do Projeto' }
  ];

  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Ajuste de endpoints: usar rota administrativa correta para projetos
      // Estrutura esperada: /projects/admin/projects/ (com paginação) ou fallback público
      let projectsData: any[] = [];
      try {
        const projectsRes = await api.get('/projects/admin/projects/');
        const raw = projectsRes.data;
        projectsData = raw.results || raw || [];
      } catch (adminErr) {
        // Fallback para rota pública se admin não disponível
        try {
          const publicRes = await api.get('/projects/public/projects/');
          const rawPub = publicRes.data;
          projectsData = rawPub.results || rawPub || [];
        } catch (publicErr) {
          // Error handled silently - empty projects list
        }
      }

      const partnersRes = await api.get('/partnerships/messages/partner_users/');

      // Normalizar estrutura para garantir que campos essenciais existam
      const normalizedProjects = (projectsData || []).map((p: any) => ({
        id: p.id,
        title: p.title || p.name || p.project_title || `Projeto #${p?.id ?? '?'}`,
        slug: p.slug,
        status: p.status || p.current_status || 'desconhecido',
        priority: p.priority || p.project_priority || null,
      }));

      setProjects(normalizedProjects as any);
      setPartners(partnersRes.data || []);
    } catch (error) {
      // Error handled silently - empty data
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedProject || !selectedPartner) return;
    
    setSubmitting(true);
    try {
      const payload = {
        project: selectedProject.id,
        partner: selectedPartner.id,
        role,
        assignment_notes: assignmentNotes,
        terms_and_conditions: termsConditions,
        start_date: startDate ? format(startDate, 'yyyy-MM-dd') : null,
        expected_end_date: endDate ? format(endDate, 'yyyy-MM-dd') : null
      };
      
      await api.post('/partnerships/assignments/', payload);
      
      setOpen(false);
      resetForm();
      onAssignmentCreated?.();
    } catch (error) {
      // Error handled silently - assignment not created
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    if (!preselectedProject) setSelectedProject(null);
    if (!preselectedPartner) setSelectedPartner(null);
    setRole('implementer');
    setAssignmentNotes('');
    setTermsConditions('');
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const formatDate = (date: Date | undefined) => {
    return date ? format(date, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data';
  };

  const defaultTrigger = (
    <Button size="sm" className="gap-2">
      <Users className="h-4 w-4" />
      Atribuir Projeto
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Atribuir Projeto a Parceiro
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Carregando dados...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Seleção de Projeto */}
            <div className="space-y-2">
              <Label htmlFor="project-select">Projeto</Label>
              <Select
                value={selectedProject?.id.toString()}
                onValueChange={(value) => {
                  const project = projects.find(p => p.id.toString() === value);
                  setSelectedProject(project || null);
                }}
                disabled={!!preselectedProject}
              >
                <SelectTrigger id="project-select">
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects.length === 0 && (
                    <div className="px-2 py-2 text-xs text-muted-foreground">
                      Nenhum projeto disponível para atribuição.
                    </div>
                  )}
                  {projects.map((project: any) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{project.title}</span>
                        <div className="flex gap-1 ml-2">
                          {project.status && (
                            <Badge variant="outline" className="text-xs">
                              {project.status}
                            </Badge>
                          )}
                          {project.priority && (
                            <Badge variant="secondary" className="text-xs">
                              {project.priority}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seleção de Parceiro */}
            <div className="space-y-2">
              <Label htmlFor="partner-select">Parceiro</Label>
              <Select
                value={selectedPartner?.id.toString()}
                onValueChange={(value) => {
                  const partner = partners.find(p => p.id.toString() === value);
                  setSelectedPartner(partner || null);
                }}
                disabled={!!preselectedPartner}
              >
                <SelectTrigger id="partner-select">
                  <SelectValue placeholder="Selecione um parceiro" />
                </SelectTrigger>
                <SelectContent>
                  {partners.map(partner => (
                    <SelectItem key={partner.id} value={partner.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <span className="font-medium">{partner.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            @{partner.username}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs ml-2">
                          {partner.active_projects} projetos ativos
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Papel/Função */}
            <div className="space-y-2">
              <Label htmlFor="role-select">Função do Parceiro</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data de Início</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDate(startDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Data Prevista de Término</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDate(endDate)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Notas da Atribuição */}
            <div className="space-y-2">
              <Label htmlFor="assignment-notes">Notas da Atribuição</Label>
              <Textarea
                id="assignment-notes"
                placeholder="Descreva detalhes específicos desta atribuição..."
                value={assignmentNotes}
                onChange={(e) => setAssignmentNotes(e.target.value)}
                rows={3}
              />
            </div>

            {/* Termos e Condições */}
            <div className="space-y-2">
              <Label htmlFor="terms-conditions">Termos e Condições Específicos</Label>
              <Textarea
                id="terms-conditions"
                placeholder="Condições específicas para esta parceria..."
                value={termsConditions}
                onChange={(e) => setTermsConditions(e.target.value)}
                rows={3}
              />
            </div>

            {/* Botões de Ação */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting || !selectedProject || !selectedPartner}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Criando...
                  </>
                ) : (
                  'Criar Atribuição'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProjectAssignmentModal;
