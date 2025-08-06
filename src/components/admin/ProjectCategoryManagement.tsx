import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Tag,
  Palette,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";

interface Program {
  id: number;
  name: string;
  slug: string;
  color: string;
}

interface ProjectCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
  program: Program;
  is_active: boolean;
  order: number;
  projects_count?: number;
  created_at: string;
}

const colorOptions = [
  { value: 'blue', label: 'Azul', class: 'bg-blue-500' },
  { value: 'green', label: 'Verde', class: 'bg-green-500' },
  { value: 'red', label: 'Vermelho', class: 'bg-red-500' },
  { value: 'yellow', label: 'Amarelo', class: 'bg-yellow-500' },
  { value: 'purple', label: 'Roxo', class: 'bg-purple-500' },
  { value: 'orange', label: 'Laranja', class: 'bg-orange-500' },
  { value: 'pink', label: 'Rosa', class: 'bg-pink-500' },
  { value: 'gray', label: 'Cinza', class: 'bg-gray-500' },
];

const iconOptions = [
  'Building', 'Heart', 'Users', 'GraduationCap', 'Stethoscope', 'Hammer',
  'Lightbulb', 'Leaf', 'Shield', 'Globe', 'BookOpen', 'Home'
];

const ProjectCategoryManagement = () => {
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProjectCategory | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>("all");

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue',
    icon: 'Tag',
    program_id: '',
    is_active: true,
    order: 0
  });

  useEffect(() => {
    fetchCategories();
    fetchPrograms();
  }, []);

  const fetchCategories = async () => {
    try {
      // Em produção viria da API: /api/project-categories/
      const mockCategories: ProjectCategory[] = [
        {
          id: 1,
          name: "Construção de Escolas",
          slug: "construcao-escolas",
          description: "Projetos focados na construção e reforma de infraestrutura educacional",
          color: "blue",
          icon: "Building",
          program: { id: 1, name: "Educação", slug: "educacao", color: "blue" },
          is_active: true,
          order: 1,
          projects_count: 5,
          created_at: "2025-01-10"
        },
        {
          id: 2,
          name: "Formação de Professores",
          slug: "formacao-professores",
          description: "Capacitação e treinamento de educadores locais",
          color: "green",
          icon: "GraduationCap",
          program: { id: 1, name: "Educação", slug: "educacao", color: "blue" },
          is_active: true,
          order: 2,
          projects_count: 3,
          created_at: "2025-01-10"
        },
        {
          id: 3,
          name: "Distribuição de Alimentos",
          slug: "distribuicao-alimentos",
          description: "Projetos de segurança alimentar e nutrição",
          color: "red",
          icon: "Heart",
          program: { id: 2, name: "Apoio Humanitário", slug: "apoio-humanitario", color: "red" },
          is_active: true,
          order: 1,
          projects_count: 8,
          created_at: "2025-01-10"
        },
        {
          id: 4,
          name: "Abrigos Temporários",
          slug: "abrigos-temporarios",
          description: "Construção e manutenção de abrigos para deslocados",
          color: "orange",
          icon: "Home",
          program: { id: 2, name: "Apoio Humanitário", slug: "apoio-humanitario", color: "red" },
          is_active: true,
          order: 2,
          projects_count: 2,
          created_at: "2025-01-10"
        },
        {
          id: 5,
          name: "Campanhas de Vacinação",
          slug: "campanhas-vacinacao",
          description: "Projetos de prevenção e vacinação comunitária",
          color: "purple",
          icon: "Stethoscope",
          program: { id: 3, name: "Saúde Pública", slug: "saude-publica", color: "purple" },
          is_active: true,
          order: 1,
          projects_count: 4,
          created_at: "2025-01-10"
        }
      ];

      setCategories(mockCategories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      // Em produção viria da API: /api/programs/
      const mockPrograms: Program[] = [
        { id: 1, name: "Educação", slug: "educacao", color: "blue" },
        { id: 2, name: "Apoio Humanitário", slug: "apoio-humanitario", color: "red" },
        { id: 3, name: "Saúde Pública", slug: "saude-publica", color: "purple" },
        { id: 4, name: "Infraestrutura", slug: "infraestrutura", color: "orange" }
      ];

      setPrograms(mockPrograms);
    } catch (error) {
      console.error('Erro ao carregar programas:', error);
    }
  };

  const filteredCategories = selectedProgram === "all" 
    ? categories 
    : categories.filter(cat => cat.program.id.toString() === selectedProgram);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory 
        ? `/api/project-categories/${editingCategory.id}/`
        : '/api/project-categories/';

      // Simular envio da API
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (editingCategory) {
        // Atualizar categoria existente
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id 
            ? { 
                ...cat, 
                ...formData,
                program: programs.find(p => p.id.toString() === formData.program_id) || cat.program
              }
            : cat
        ));
        toast.success('Categoria atualizada com sucesso!');
      } else {
        // Criar nova categoria
        const newCategory: ProjectCategory = {
          id: Date.now(),
          ...formData,
          slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
          program: programs.find(p => p.id.toString() === formData.program_id)!,
          projects_count: 0,
          created_at: new Date().toISOString()
        };
        setCategories(prev => [...prev, newCategory]);
        toast.success('Categoria criada com sucesso!');
      }

      handleCloseModal();
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      toast.error('Erro ao salvar categoria');
    }
  };

  const handleEdit = (category: ProjectCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      color: category.color,
      icon: category.icon,
      program_id: category.program.id.toString(),
      is_active: category.is_active,
      order: category.order
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;

    try {
      // Simular exclusão da API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCategories(prev => prev.filter(cat => cat.id !== id));
      toast.success('Categoria excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  const toggleActiveStatus = async (id: number) => {
    try {
      setCategories(prev => prev.map(cat => 
        cat.id === id ? { ...cat, is_active: !cat.is_active } : cat
      ));
      toast.success('Status atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast.error('Erro ao atualizar status');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      color: 'blue',
      icon: 'Tag',
      program_id: '',
      is_active: true,
      order: 0
    });
  };

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      orange: 'bg-orange-500',
      pink: 'bg-pink-500',
      gray: 'bg-gray-500'
    };
    return colorMap[color] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Categorias de Projetos</h2>
          <p className="text-muted-foreground">
            Gerencie as categorias específicas dentro de cada programa
          </p>
        </div>
        
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="program_id">Programa</Label>
                <Select 
                  value={formData.program_id} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, program_id: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um programa" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map(program => (
                      <SelectItem key={program.id} value={program.id.toString()}>
                        {program.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="name">Nome da Categoria</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Construção de Escolas"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição da categoria..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="color">Cor</Label>
                  <Select 
                    value={formData.color} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map(color => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${color.class}`} />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="icon">Ícone</Label>
                  <Select 
                    value={formData.icon} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map(icon => (
                        <SelectItem key={icon} value={icon}>
                          {icon}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="order">Ordem</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingCategory ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="program-filter">Filtrar por programa:</Label>
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os programas</SelectItem>
                {programs.map(program => (
                  <SelectItem key={program.id} value={program.id.toString()}>
                    {program.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">Total de Categorias</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{categories.filter(c => c.is_active).length}</div>
            <p className="text-xs text-muted-foreground">Categorias Ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{categories.reduce((acc, cat) => acc + (cat.projects_count || 0), 0)}</div>
            <p className="text-xs text-muted-foreground">Total de Projetos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{programs.length}</div>
            <p className="text-xs text-muted-foreground">Programas Ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Categorias ({filteredCategories.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCategories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Projetos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ordem</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {category.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{category.program.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${getColorClass(category.color)}`} />
                        <span className="capitalize">{category.color}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{category.projects_count || 0}</span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActiveStatus(category.id)}
                        className={category.is_active ? "text-green-600" : "text-red-600"}
                      >
                        {category.is_active ? (
                          <>
                            <Eye className="h-4 w-4 mr-1" />
                            Ativa
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4 mr-1" />
                            Inativa
                          </>
                        )}
                      </Button>
                    </TableCell>
                    <TableCell>{category.order}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(category)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                Nenhuma categoria encontrada
              </h3>
              <p className="text-muted-foreground">
                {selectedProgram === "all" 
                  ? "Ainda não há categorias criadas."
                  : "Não há categorias para o programa selecionado."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectCategoryManagement;
