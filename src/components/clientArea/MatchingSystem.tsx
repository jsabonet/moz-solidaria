// src/components/clientArea/MatchingSystem.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  MapPin, 
  Clock, 
  Star,
  Heart,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { 
  fetchMatchingRequests, 
  createMatchingRequest, 
  acceptMatchingRequest,
  fetchCauses,
  fetchSkills 
} from '@/lib/clientAreaApi';
import { MatchingRequest, Cause, Skill } from '@/types/clientArea';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';

const MatchingSystem: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MatchingRequest[]>([]);
  const [causes, setCauses] = useState<Cause[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form state for creating new requests
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    cause: '',
    skills_needed: [] as string[],
    urgency_level: 'medium' as const,
    location: '',
    estimated_hours: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [requestsData, causesData, skillsData] = await Promise.all([
        fetchMatchingRequests(),
        fetchCauses(),
        fetchSkills()
      ]);
      setRequests(requestsData);
      setCauses(causesData);
      setSkills(skillsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do sistema de matching');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    try {
      const requestData = {
        ...newRequest,
        skills_needed: newRequest.skills_needed.map(id => parseInt(id)),
        cause: parseInt(newRequest.cause),
        estimated_hours: newRequest.estimated_hours ? parseInt(newRequest.estimated_hours) : undefined
      };
      
      const createdRequest = await createMatchingRequest(requestData);
      setRequests(prev => [createdRequest, ...prev]);
      setIsCreateDialogOpen(false);
      setNewRequest({
        title: '',
        description: '',
        cause: '',
        skills_needed: [],
        urgency_level: 'medium',
        location: '',
        estimated_hours: ''
      });
      toast.success('Solicitação criada com sucesso!');
    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      toast.error('Erro ao criar solicitação');
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    try {
      const updatedRequest = await acceptMatchingRequest(requestId);
      setRequests(prev => 
        prev.map(r => r.id === requestId ? updatedRequest : r)
      );
      toast.success('Solicitação aceita com sucesso!');
    } catch (error) {
      console.error('Erro ao aceitar solicitação:', error);
      toast.error('Erro ao aceitar solicitação');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'matched': return 'text-purple-600';
      case 'open': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUrgency = filterUrgency === 'all' || request.urgency_level === filterUrgency;
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    
    return matchesSearch && matchesUrgency && matchesStatus;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <CardTitle>Sistema de Matching</CardTitle>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Solicitação
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Nova Solicitação de Ajuda</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={newRequest.title}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título da solicitação"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newRequest.description}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva detalhadamente a ajuda necessária"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cause">Causa</Label>
                      <Select 
                        value={newRequest.cause} 
                        onValueChange={(value) => setNewRequest(prev => ({ ...prev, cause: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma causa" />
                        </SelectTrigger>
                        <SelectContent>
                          {causes.map(cause => (
                            <SelectItem key={cause.id} value={cause.id.toString()}>
                              {cause.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="urgency">Urgência</Label>
                      <Select 
                        value={newRequest.urgency_level} 
                        onValueChange={(value) => setNewRequest(prev => ({ ...prev, urgency_level: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Baixa</SelectItem>
                          <SelectItem value="medium">Média</SelectItem>
                          <SelectItem value="high">Alta</SelectItem>
                          <SelectItem value="critical">Crítica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Localização</Label>
                      <Input
                        id="location"
                        value={newRequest.location}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="Cidade, Província"
                      />
                    </div>

                    <div>
                      <Label htmlFor="estimated_hours">Horas Estimadas</Label>
                      <Input
                        id="estimated_hours"
                        type="number"
                        value={newRequest.estimated_hours}
                        onChange={(e) => setNewRequest(prev => ({ ...prev, estimated_hours: e.target.value }))}
                        placeholder="Ex: 8"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Habilidades Necessárias</Label>
                    <div className="grid grid-cols-3 gap-2 mt-2 max-h-32 overflow-y-auto">
                      {skills.map(skill => (
                        <label key={skill.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={newRequest.skills_needed.includes(skill.id.toString())}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewRequest(prev => ({
                                  ...prev,
                                  skills_needed: [...prev.skills_needed, skill.id.toString()]
                                }));
                              } else {
                                setNewRequest(prev => ({
                                  ...prev,
                                  skills_needed: prev.skills_needed.filter(id => id !== skill.id.toString())
                                }));
                              }
                            }}
                          />
                          <span className="text-sm">{skill.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreateRequest}>
                      Criar Solicitação
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar solicitações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterUrgency} onValueChange={setFilterUrgency}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por urgência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as urgências</SelectItem>
                <SelectItem value="critical">Crítica</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="open">Aberto</SelectItem>
                <SelectItem value="matched">Pareado</SelectItem>
                <SelectItem value="in_progress">Em Progresso</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Solicitações */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{request.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {request.description}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  <Badge variant={getUrgencyColor(request.urgency_level)}>
                    {request.urgency_level}
                  </Badge>
                  <span className={`text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                {request.location || 'Localização não especificada'}
              </div>
              
              {request.estimated_hours && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  ~{request.estimated_hours} horas
                </div>
              )}

              {request.skills_needed && request.skills_needed.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {request.skills_needed.slice(0, 3).map((skill) => (
                    <Badge key={skill.id} variant="outline" className="text-xs">
                      {skill.name}
                    </Badge>
                  ))}
                  {request.skills_needed.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{request.skills_needed.length - 3} mais
                    </Badge>
                  )}
                </div>
              )}

              <div className="pt-2 border-t">
                {request.status === 'open' ? (
                  <Button 
                    className="w-full" 
                    onClick={() => handleAcceptRequest(request.id)}
                  >
                    <Heart className="h-4 w-4 mr-2" />
                    Quero Ajudar
                  </Button>
                ) : request.status === 'matched' ? (
                  <div className="flex items-center justify-center text-sm text-purple-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Pareado com voluntário
                  </div>
                ) : request.status === 'completed' ? (
                  <div className="flex items-center justify-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Ajuda concluída
                  </div>
                ) : (
                  <div className="flex items-center justify-center text-sm text-blue-600">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Em progresso
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma solicitação encontrada</h3>
            <p className="text-muted-foreground">
              {searchTerm || filterUrgency !== 'all' || filterStatus !== 'all'
                ? 'Tente ajustar os filtros de busca.'
                : 'Seja o primeiro a criar uma solicitação de ajuda!'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MatchingSystem;
