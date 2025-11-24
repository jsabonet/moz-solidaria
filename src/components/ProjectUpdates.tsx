import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  FileText,
  User,
  Star,
  Image as ImageIcon,
  Save,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface ProjectUpdate {
  id: number;
  project: number;
  title: string;
  content: string;
  author: {
    id: number;
    full_name: string;
    username: string;
  };
  beneficiaries_reached?: number;
  budget_spent?: number;
  featured_image?: string;
  is_milestone: boolean;
  created_at: string;
  updated_at: string;
}

interface ProjectUpdatesProps {
  projectId: number;
  projectName: string;
}

interface UpdateFormData {
  title: string;
  content: string;
  beneficiaries_reached: number;
  budget_spent: number;
  is_milestone: boolean;
  featured_image?: File;
}

const ProjectUpdates: React.FC<ProjectUpdatesProps> = ({ projectId, projectName }) => {
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<ProjectUpdate | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<UpdateFormData>({
    title: '',
    content: '',
    beneficiaries_reached: 0,
    budget_spent: 0,
    is_milestone: false,
  });

  // Carregar atualizações do projeto
  useEffect(() => {
    loadUpdates();
  }, [projectId]);

  const loadUpdates = async () => {
    try {
      setLoading(true);
      // Simulação da API - substituir pela chamada real
      const mockUpdates: ProjectUpdate[] = [
        {
          id: 1,
          project: projectId,
          title: "Início da construção das salas de aula",
          content: "Iniciamos hoje a construção das primeiras 3 salas de aula. A fundação foi concluída e estamos avançando com as paredes. O cronograma está sendo seguido conforme planejado.",
          author: {
            id: 1,
            full_name: "João Silva",
            username: "joao.silva"
          },
          beneficiaries_reached: 50,
          budget_spent: 15000,
          is_milestone: true,
          created_at: "2025-01-15T10:00:00Z",
          updated_at: "2025-01-15T10:00:00Z"
        },
        {
          id: 2,
          project: projectId,
          title: "Entrega de materiais escolares",
          content: "Realizamos a distribuição de cadernos, lápis e uniformes para 100 crianças. A comunidade está muito agradecida pelo apoio.",
          author: {
            id: 2,
            full_name: "Maria Santos",
            username: "maria.santos"
          },
          beneficiaries_reached: 100,
          budget_spent: 5000,
          is_milestone: false,
          created_at: "2025-01-20T14:30:00Z",
          updated_at: "2025-01-20T14:30:00Z"
        }
      ];
      
      setUpdates(mockUpdates);
    } catch (error) {
      toast.error('Erro ao carregar atualizações do projeto');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      beneficiaries_reached: 0,
      budget_spent: 0,
      is_milestone: false,
    });
    setEditingUpdate(null);
  };

  const openDialog = (update?: ProjectUpdate) => {
    if (update) {
      setEditingUpdate(update);
      setFormData({
        title: update.title,
        content: update.content,
        beneficiaries_reached: update.beneficiaries_reached || 0,
        budget_spent: update.budget_spent || 0,
        is_milestone: update.is_milestone,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Título e conteúdo são obrigatórios');
      return;
    }

    setSubmitting(true);
    try {
      // Simulação da API - substituir pela chamada real
      if (editingUpdate) {
        // Atualizar update existente
        const updatedUpdate: ProjectUpdate = {
          ...editingUpdate,
          ...formData,
          updated_at: new Date().toISOString()
        };
        
        setUpdates(prev => prev.map(u => u.id === editingUpdate.id ? updatedUpdate : u));
        toast.success('Atualização modificada com sucesso!');
      } else {
        // Criar nova atualização
        const newUpdate: ProjectUpdate = {
          id: Date.now(), // Simulação de ID
          project: projectId,
          ...formData,
          author: {
            id: 1,
            full_name: "Administrador",
            username: "admin"
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        setUpdates(prev => [newUpdate, ...prev]);
        toast.success('Nova atualização criada com sucesso!');
      }
      
      closeDialog();
    } catch (error) {
      toast.error('Erro ao salvar atualização');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (updateId: number) => {
    try {
      // Simulação da API - substituir pela chamada real
      setUpdates(prev => prev.filter(u => u.id !== updateId));
      toast.success('Atualização removida com sucesso!');
    } catch (error) {
      toast.error('Erro ao remover atualização');
    }
  };

  const handleInputChange = (field: keyof UpdateFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return <div className="text-center py-8">Carregando atualizações...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Atualizações do Projeto</h3>
          <p className="text-muted-foreground">
            Gerencie as atualizações e marcos de "{projectName}"
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Atualização
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUpdate ? 'Editar Atualização' : 'Nova Atualização'}
              </DialogTitle>
              <DialogDescription>
                {editingUpdate 
                  ? 'Modifique as informações da atualização'
                  : 'Adicione uma nova atualização ao projeto'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Ex: Conclusão da primeira fase"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder="Descreva o progresso, conquistas e próximos passos..."
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="beneficiaries">Beneficiários Alcançados</Label>
                  <Input
                    id="beneficiaries"
                    type="number"
                    value={formData.beneficiaries_reached}
                    onChange={(e) => handleInputChange('beneficiaries_reached', parseInt(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="budget">Orçamento Gasto (MZN)</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={formData.budget_spent}
                    onChange={(e) => handleInputChange('budget_spent', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="milestone"
                  checked={formData.is_milestone}
                  onCheckedChange={(checked) => handleInputChange('is_milestone', checked)}
                />
                <Label htmlFor="milestone">
                  Marcar como marco importante
                </Label>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit" disabled={submitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {submitting 
                    ? 'Salvando...' 
                    : editingUpdate 
                      ? 'Salvar Alterações' 
                      : 'Criar Atualização'
                  }
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Atualizações */}
      {updates.length > 0 ? (
        <div className="space-y-4">
          {updates.map((update) => (
            <Card key={update.id} className={update.is_milestone ? 'border-primary/50 bg-primary/5' : ''}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{update.title}</h4>
                      {update.is_milestone && (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Marco
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground gap-4">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {update.author.full_name}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(update.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openDialog(update)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remover Atualização</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja remover a atualização "{update.title}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(update.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Remover
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm mb-4 whitespace-pre-wrap">{update.content}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  {update.beneficiaries_reached && update.beneficiaries_reached > 0 && (
                    <div className="flex items-center gap-1 text-green-600">
                      <span className="font-medium">{update.beneficiaries_reached}</span>
                      <span>beneficiários alcançados</span>
                    </div>
                  )}
                  
                  {update.budget_spent && update.budget_spent > 0 && (
                    <div className="flex items-center gap-1 text-blue-600">
                      <span className="font-medium">{update.budget_spent.toLocaleString()} MZN</span>
                      <span>investidos</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma atualização ainda</h3>
            <p className="text-muted-foreground mb-4">
              Comece adicionando a primeira atualização do projeto
            </p>
            <Button onClick={() => openDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Primeira Atualização
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectUpdates;
