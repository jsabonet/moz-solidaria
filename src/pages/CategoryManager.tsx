import React, { useState, useEffect } from 'react';
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Heart, Settings, Eye, Plus, Edit, Trash2, Tag } from 'lucide-react';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '@/lib/api';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  posts_count: number;
  created_at: string;
}

interface CategoryFormData {
  name: string;
  description: string;
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
    });
    setEditingCategory(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nome da categoria é obrigatório');
      return;
    }

    setSaving(true);
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        toast.success('Categoria atualizada com sucesso!');
        setIsEditDialogOpen(false);
      } else {
        await createCategory(formData);
        toast.success('Categoria criada com sucesso!');
        setIsCreateDialogOpen(false);
      }
      
      resetForm();
      // Força o recarregamento das categorias com contagem atualizada
      await loadCategories();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar categoria');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCategory(id);
      toast.success('Categoria excluída com sucesso!');
      // Força o recarregamento das categorias
      await loadCategories();
    } catch (error: any) {
      // Verificar se é um erro de categoria com posts associados
      if (error.message.includes('400') || error.message.includes('possui') || error.message.includes('associado')) {
        toast.error('Não é possível excluir esta categoria pois ela possui posts associados. Remova ou altere a categoria dos posts primeiro.');
      } else {
        toast.error(error.message || 'Erro ao excluir categoria');
      }
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="flex h-14 md:h-16 items-center px-3 md:px-6">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 md:h-8 md:w-8 text-primary" />
              <h1 className="text-sm md:text-xl font-bold hidden sm:block">MOZ SOLIDÁRIA - Categorias</h1>
              <h1 className="text-sm font-bold sm:hidden">Categorias</h1>
            </div>
          </div>
          <div className="ml-auto flex items-center space-x-2 md:space-x-4">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Eye className="h-4 w-4 mr-2" />
              Ver Site
            </Button>
            <Button variant="outline" size="sm" className="md:hidden px-2">
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" className="hidden md:flex">
              <Settings className="h-4 w-4 mr-2" />
              Configurações
            </Button>
            <Button size="sm" className="md:hidden px-2">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="p-3 md:p-6">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Gerenciar Categorias</h2>
              <p className="text-muted-foreground">
                Organize seus posts em categorias para melhor navegação
              </p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Categoria
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Categoria</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova categoria para organizar seus posts
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome da Categoria</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Digite o nome da categoria"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição (Opcional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descreva esta categoria"
                      rows={3}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Criando...' : 'Criar Categoria'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Tag className="h-8 w-8 text-primary" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Total de Categorias</p>
                    <p className="text-2xl font-bold">{categories.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Plus className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Posts Categorizados</p>
                    <p className="text-2xl font-bold">
                      {categories.reduce((sum, cat) => sum + cat.posts_count, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Eye className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-muted-foreground">Categoria Mais Usada</p>
                    <p className="text-lg font-bold">
                      {categories.length > 0 
                        ? categories.reduce((prev, current) => 
                            (prev.posts_count > current.posts_count) ? prev : current
                          ).name
                        : 'Nenhuma'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Categories Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Lista de Categorias</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadCategories}
                  disabled={loading}
                >
                  {loading ? 'Carregando...' : 'Atualizar'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8">
                  <Loading 
                    variant="card" 
                    message="Carregando categorias..." 
                    size="md" 
                  />
                </div>
              ) : categories.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Posts Vinculados</TableHead>
                      <TableHead>Criada em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <Tag className="h-4 w-4 text-primary" />
                            <span>{category.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">
                            {category.description || 'Sem descrição'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary">
                              {category.posts_count || 0}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {category.posts_count === 1 ? 'post' : 'posts'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(category.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(category)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir a categoria "{category.name}"?
                                    {category.posts_count > 0 && (
                                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">
                                        <strong>Atenção:</strong> Esta categoria possui {category.posts_count} post(s) associado(s). 
                                        A exclusão só será possível após remover ou alterar a categoria destes posts.
                                      </div>
                                    )}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(category.id)}
                                    className="bg-destructive text-destructive-foreground"
                                    disabled={category.posts_count > 0}
                                  >
                                    {category.posts_count > 0 ? 'Não é possível excluir' : 'Excluir'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">Nenhuma categoria criada ainda</p>
                  <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeira Categoria
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Categoria</DialogTitle>
              <DialogDescription>
                Modifique as informações da categoria
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Nome da Categoria</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Digite o nome da categoria"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Descrição (Opcional)</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva esta categoria"
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CategoryManager;