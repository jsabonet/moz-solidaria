// src/components/ProjectGalleryManager.tsx
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Edit, 
  Eye, 
  Download,
  Plus,
  Grid3X3,
  List,
  Filter,
  Search,
  Tag,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProjectImage {
  id: string;
  url: string;
  title: string;
  description: string;
  category: 'before' | 'progress' | 'after' | 'team' | 'community' | 'infrastructure' | 'events';
  tags: string[];
  uploadDate: Date;
  author: string;
  featured: boolean;
  order: number;
}

interface ProjectGalleryManagerProps {
  projectId: string;
  projectTitle: string;
  onGalleryUpdate?: (images: ProjectImage[]) => void;
}

const ProjectGalleryManager: React.FC<ProjectGalleryManagerProps> = ({
  projectId,
  projectTitle,
  onGalleryUpdate
}) => {
  const [images, setImages] = useState<ProjectImage[]>([
    {
      id: '1',
      url: '/project-gallery/before-1.jpg',
      title: 'Situação inicial da comunidade',
      description: 'Estado das condições de acesso à água antes do início do projeto',
      category: 'before',
      tags: ['situação inicial', 'água', 'comunidade'],
      uploadDate: new Date('2024-01-20'),
      author: 'João Silva',
      featured: true,
      order: 1
    },
    {
      id: '2',
      url: '/project-gallery/progress-1.jpg',
      title: 'Escavação do primeiro poço',
      description: 'Início dos trabalhos de construção do poço na comunidade A',
      category: 'progress',
      tags: ['construção', 'poço', 'progresso'],
      uploadDate: new Date('2024-03-15'),
      author: 'Maria Santos',
      featured: false,
      order: 2
    },
    {
      id: '3',
      url: '/project-gallery/team-1.jpg',
      title: 'Equipe técnica em ação',
      description: 'Nossa equipe trabalhando na instalação das bombas',
      category: 'team',
      tags: ['equipe', 'instalação', 'bombas'],
      uploadDate: new Date('2024-05-10'),
      author: 'Pedro Costa',
      featured: false,
      order: 3
    },
    {
      id: '4',
      url: '/project-gallery/community-1.jpg',
      title: 'Celebração com a comunidade',
      description: 'Momento de alegria com os beneficiários do projeto',
      category: 'community',
      tags: ['celebração', 'comunidade', 'beneficiários'],
      uploadDate: new Date('2024-07-20'),
      author: 'Ana Ferreira',
      featured: true,
      order: 4
    }
  ]);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingImage, setEditingImage] = useState<ProjectImage | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'progress' as ProjectImage['category'],
    tags: '',
    featured: false
  });

  const categoryLabels = {
    before: 'Antes',
    progress: 'Progresso',
    after: 'Depois',
    team: 'Equipe',
    community: 'Comunidade',
    infrastructure: 'Infraestrutura',
    events: 'Eventos'
  };

  const categoryColors = {
    before: 'bg-red-100 text-red-800',
    progress: 'bg-blue-100 text-blue-800',
    after: 'bg-green-100 text-green-800',
    team: 'bg-purple-100 text-purple-800',
    community: 'bg-orange-100 text-orange-800',
    infrastructure: 'bg-gray-100 text-gray-800',
    events: 'bg-yellow-100 text-yellow-800'
  };

  const filteredImages = images
    .filter(img => filterCategory === 'all' || img.category === filterCategory)
    .filter(img => 
      img.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      img.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => a.order - b.order);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Simular upload (em produção, usar API real)
    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const newImage: ProjectImage = {
        id: Date.now().toString(),
        url: e.target?.result as string,
        title: uploadForm.title,
        description: uploadForm.description,
        category: uploadForm.category,
        tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        uploadDate: new Date(),
        author: 'Admin',
        featured: uploadForm.featured,
        order: images.length + 1
      };

      const updatedImages = [...images, newImage];
      setImages(updatedImages);
      onGalleryUpdate?.(updatedImages);
      
      setUploadForm({
        title: '',
        description: '',
        category: 'progress',
        tags: '',
        featured: false
      });
      setShowUploadDialog(false);
      toast.success('Imagem adicionada com sucesso!');
    };

    reader.readAsDataURL(file);
  };

  const handleDeleteImage = (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    onGalleryUpdate?.(updatedImages);
    toast.success('Imagem removida com sucesso!');
  };

  const handleToggleFeatured = (imageId: string) => {
    const updatedImages = images.map(img => 
      img.id === imageId ? { ...img, featured: !img.featured } : img
    );
    setImages(updatedImages);
    onGalleryUpdate?.(updatedImages);
    toast.success('Status destacado atualizado!');
  };

  const handleEditImage = (image: ProjectImage) => {
    setEditingImage(image);
    setUploadForm({
      title: image.title,
      description: image.description,
      category: image.category,
      tags: image.tags.join(', '),
      featured: image.featured
    });
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!editingImage) return;

    const updatedImages = images.map(img => 
      img.id === editingImage.id 
        ? {
            ...img,
            title: uploadForm.title,
            description: uploadForm.description,
            category: uploadForm.category,
            tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
            featured: uploadForm.featured
          }
        : img
    );

    setImages(updatedImages);
    onGalleryUpdate?.(updatedImages);
    setEditingImage(null);
    setShowEditDialog(false);
    setUploadForm({
      title: '',
      description: '',
      category: 'progress',
      tags: '',
      featured: false
    });
    toast.success('Imagem atualizada com sucesso!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Galeria: {projectTitle}</h2>
          <p className="text-muted-foreground">
            Gerencie as imagens e documentação visual do projeto
          </p>
        </div>
        <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Imagem
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Imagem</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Selecionar Arquivo</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Construção do poço concluída"
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descreva o que a imagem mostra..."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={uploadForm.category}
                  onValueChange={(value: ProjectImage['category']) => 
                    setUploadForm(prev => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">Antes</SelectItem>
                    <SelectItem value="progress">Progresso</SelectItem>
                    <SelectItem value="after">Depois</SelectItem>
                    <SelectItem value="team">Equipe</SelectItem>
                    <SelectItem value="community">Comunidade</SelectItem>
                    <SelectItem value="infrastructure">Infraestrutura</SelectItem>
                    <SelectItem value="events">Eventos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                <Input
                  id="tags"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="Ex: construção, água, comunidade"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={uploadForm.featured}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, featured: e.target.checked }))}
                />
                <Label htmlFor="featured">Destacar esta imagem</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!uploadForm.title}
                >
                  Selecionar e Adicionar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{images.length}</div>
            <p className="text-xs text-muted-foreground">Total de Imagens</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{images.filter(img => img.featured).length}</div>
            <p className="text-xs text-muted-foreground">Imagens Destacadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{Object.keys(categoryLabels).length}</div>
            <p className="text-xs text-muted-foreground">Categorias</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {images.reduce((acc, img) => acc + img.tags.length, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Total de Tags</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar imagens..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredImages.map((image) => (
                <div key={image.id} className="group relative overflow-hidden rounded-lg border">
                  <div className="aspect-video bg-muted">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEditImage(image)}>
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <Badge className={categoryColors[image.category]}>
                      {categoryLabels[image.category]}
                    </Badge>
                    {image.featured && (
                      <Badge variant="secondary">Destacada</Badge>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3">
                    <h4 className="font-medium text-sm mb-1">{image.title}</h4>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {image.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{format(image.uploadDate, 'dd/MM/yyyy')}</span>
                      <span>{image.author}</span>
                    </div>
                    {image.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {image.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {image.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{image.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredImages.map((image) => (
                <div key={image.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                  <div className="w-16 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{image.title}</h4>
                      <Badge className={categoryColors[image.category]}>
                        {categoryLabels[image.category]}
                      </Badge>
                      {image.featured && (
                        <Badge variant="secondary">Destacada</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                      {image.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(image.uploadDate, 'dd/MM/yyyy')}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {image.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {image.tags.length} tags
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleEditImage(image)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleToggleFeatured(image.id)}
                    >
                      ⭐
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Imagem</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={uploadForm.title}
                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={uploadForm.description}
                onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Categoria</Label>
              <Select
                value={uploadForm.category}
                onValueChange={(value: ProjectImage['category']) => 
                  setUploadForm(prev => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-tags">Tags (separadas por vírgula)</Label>
              <Input
                id="edit-tags"
                value={uploadForm.tags}
                onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-featured"
                checked={uploadForm.featured}
                onChange={(e) => setUploadForm(prev => ({ ...prev, featured: e.target.checked }))}
              />
              <Label htmlFor="edit-featured">Destacar esta imagem</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectGalleryManager;
