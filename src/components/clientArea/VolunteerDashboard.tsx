// src/components/clientArea/VolunteerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Heart, 
  Clock, 
  Users, 
  Star, 
  Calendar,
  Award,
  Target,
  MapPin,
  CheckCircle,
  Plus,
  Settings,
  TrendingUp,
  Trophy,
  Loader2
} from 'lucide-react';
import { DashboardStats } from '@/types/clientArea';
import { fetchMatchingRequests, fetchSkills } from '@/lib/clientAreaApi';
import { MatchingRequest, Skill } from '@/types/clientArea';
import api from '@/lib/api';
import { toast } from 'sonner';

interface VolunteerDashboardProps {
  stats: DashboardStats | null;
}

interface VolunteerOpportunity {
  id: number;
  title: string;
  description: string;
  location?: string;
  is_remote: boolean;
  estimated_hours: number;
  people_helped_estimate: number;
  urgency_level: string;
  status: string;
  required_skills: Skill[];
  applications_count: number;
  created_at: string;
}

const translateUrgency = (value: string) => {
  switch (value) {
    case 'low': return 'Baixa';
    case 'medium': return 'Média';
    case 'high': return 'Alta';
    case 'critical': return 'Crítica';
    default: return value;
  }
};

interface VolunteerProfile {
  id: number;
  skills: Skill[];
  bio: string;
  availability: string;
  max_hours_per_week: number;
  total_hours_contributed: number;
  total_people_helped: number;
  volunteer_level: string;
  hours_to_next_level: number;
  average_rating: number;
  active_participations_count: number;
  completed_participations_count: number;
}

interface VolunteerParticipation {
  id: number;
  opportunity_title: string;
  status: string;
  actual_hours?: number;
  people_helped?: number;
  admin_rating?: number;
  completion_date?: string;
  created_at: string;
}

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  earned_date: string;
}

const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({ stats }) => {
  const [opportunities, setOpportunities] = useState<VolunteerOpportunity[]>([]);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [volunteerProfile, setVolunteerProfile] = useState<VolunteerProfile | null>(null);
  const [participations, setParticipations] = useState<VolunteerParticipation[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [applyingTo, setApplyingTo] = useState<number | null>(null);
  const [applicationMessage, setApplicationMessage] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [opportunitiesRes, skillsRes, profileRes, participationsRes, achievementsRes] = await Promise.all([
          api.get('/volunteers/opportunities/?status=open'),
          api.get('/volunteers/skills/'),
          api.get('/volunteers/profiles/my_profile/'),
          api.get('/volunteers/participations/'),
          api.get('/volunteers/achievements/')
        ]);
        
        setOpportunities(opportunitiesRes.data.results || opportunitiesRes.data || []);
        
        // Process skills data
        const skillsData = skillsRes.data.results || skillsRes.data || [];
        setAllSkills(skillsData);
        
        setVolunteerProfile(profileRes.data);
        setParticipations(participationsRes.data.results || participationsRes.data || []);
        setAchievements(achievementsRes.data.results || achievementsRes.data || []);
        
        // Set selected skills for modal
        if (profileRes.data.skills) {
          setSelectedSkills(profileRes.data.skills.map((skill: Skill) => skill.id));
        }
      } catch (error) {
        toast.error('Erro ao carregar dados do voluntário');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleApplyToOpportunity = async (opportunityId: number) => {
    setApplyingTo(opportunityId);
    try {
      await api.post(`/volunteers/opportunities/${opportunityId}/apply/`, {
        message: applicationMessage
      });
      
      toast.success('Candidatura enviada com sucesso!');
      setApplicationMessage('');
      
      // Refresh opportunities to update application count
      const response = await api.get('/volunteers/opportunities/?status=open');
      setOpportunities(response.data.results || response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao enviar candidatura');
    } finally {
      setApplyingTo(null);
    }
  };

  const handleUpdateSkills = async () => {
    try {
      await api.post('/volunteers/profiles/update_skills/', {
        skill_ids: selectedSkills
      });
      
      // Refresh profile
      const profileRes = await api.get('/volunteers/profiles/my_profile/');
      setVolunteerProfile(profileRes.data);
      
      toast.success('Habilidades atualizadas com sucesso!');
      setSkillsModalOpen(false);
    } catch (error) {
      toast.error('Erro ao atualizar habilidades');
    }
  };

  const toggleSkill = (skillId: number) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  const volunteerStats = volunteerProfile || stats?.stats || {};

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
      case 'accepted': return 'text-yellow-600';
      case 'applied': return 'text-gray-600';
      default: return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horas Contribuídas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{volunteerStats.total_hours_contributed || 0}h</div>
            <p className="text-xs text-muted-foreground">
              Total de horas voluntárias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pessoas Ajudadas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{volunteerStats.total_people_helped || 0}</div>
            <p className="text-xs text-muted-foreground">
              Beneficiários atendidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avaliação Média</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{volunteerStats.average_rating?.toFixed(1) || 0}/5</div>
            <p className="text-xs text-muted-foreground">
              Baseado em {volunteerStats.completed_participations_count || 0} avaliações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nível Voluntário</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{volunteerStats.volunteer_level || 'Novato'}</div>
            <p className="text-xs text-muted-foreground">
              Próximo nível em {volunteerStats.hours_to_next_level || 10}h
            </p>
            {volunteerStats.hours_to_next_level > 0 && (
              <Progress 
                value={((volunteerStats.total_hours_contributed || 0) / 
                       ((volunteerStats.total_hours_contributed || 0) + (volunteerStats.hours_to_next_level || 1))) * 100} 
                className="mt-2"
              />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Oportunidades Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Heart className="h-5 w-5" />
                <span>Oportunidades Disponíveis</span>
              </span>
              <Badge variant="outline">{opportunities.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {opportunities.slice(0, 5).map((opportunity) => (
                <div key={opportunity.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{opportunity.title}</h4>
                    <Badge variant={getUrgencyColor(opportunity.urgency_level)}>
                      {translateUrgency(opportunity.urgency_level)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {opportunity.description.slice(0, 100)}...
                  </p>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="flex items-center text-muted-foreground">
                      <MapPin className="h-3 w-3 mr-1" />
                      {opportunity.is_remote ? 'Remoto' : opportunity.location || 'Local não especificado'}
                    </span>
                    <span className="flex items-center text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {opportunity.estimated_hours}h
                    </span>
                  </div>
                  {opportunity.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {opportunity.required_skills.slice(0, 3).map((skill) => (
                        <Badge key={skill.id} variant="secondary" className="text-xs">
                          {skill.name}
                        </Badge>
                      ))}
                      {opportunity.required_skills.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{opportunity.required_skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="w-full">
                        Candidatar-se
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Candidatar-se: {opportunity.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {opportunity.description}
                          </p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Localização:</strong> {opportunity.is_remote ? 'Remoto' : opportunity.location}
                            </div>
                            <div>
                              <strong>Horas estimadas:</strong> {opportunity.estimated_hours}h
                            </div>
                            <div>
                              <strong>Pessoas a ajudar:</strong> {opportunity.people_helped_estimate}
                            </div>
                            <div>
                              <strong>Urgência:</strong> {translateUrgency(opportunity.urgency_level)}
                            </div>
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Mensagem (opcional)</label>
                          <Textarea
                            placeholder="Conte um pouco sobre sua motivação para esta oportunidade..."
                            value={applicationMessage}
                            onChange={(e) => setApplicationMessage(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <Button 
                          onClick={() => handleApplyToOpportunity(opportunity.id)}
                          disabled={applyingTo === opportunity.id}
                          className="w-full"
                        >
                          {applyingTo === opportunity.id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Enviando...
                            </>
                          ) : (
                            'Enviar Candidatura'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
              {opportunities.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  Nenhuma oportunidade disponível no momento.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Suas Habilidades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Suas Habilidades</span>
              </span>
              <Dialog open={skillsModalOpen} onOpenChange={setSkillsModalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Gerenciar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Gerenciar Habilidades</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Selecione suas habilidades para que possamos recomendar oportunidades adequadas:
                    </p>
                    {allSkills.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">Nenhuma habilidade disponível.</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Entre em contato com o administrador para adicionar habilidades.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                        {allSkills.map((skill) => (
                          <div key={skill.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`skill-${skill.id}`}
                              checked={selectedSkills.includes(skill.id)}
                              onCheckedChange={() => toggleSkill(skill.id)}
                            />
                            <label 
                              htmlFor={`skill-${skill.id}`}
                              className="text-sm cursor-pointer"
                            >
                              {skill.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setSkillsModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleUpdateSkills}>
                        Salvar Habilidades
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {volunteerProfile?.skills?.slice(0, 8).map((skill) => (
                <Badge key={skill.id} variant="secondary" className="justify-center">
                  {skill.name}
                </Badge>
              ))}
              {(!volunteerProfile?.skills || volunteerProfile.skills.length === 0) && (
                <p className="text-muted-foreground text-center py-4 col-span-2">
                  Nenhuma habilidade cadastrada ainda.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conquistas */}
      {achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Suas Conquistas</span>
              <Badge variant="outline">{achievements.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="border rounded-lg p-3 text-center">
                  <div className="text-2xl mb-2">🏆</div>
                  <h4 className="font-medium text-sm">{achievement.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {achievement.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(achievement.earned_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Voluntariado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Histórico de Voluntariado</span>
            <Badge variant="outline">{participations.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {participations.slice(0, 10).map((participation) => (
              <div key={participation.id} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    participation.status === 'completed' ? 'bg-green-500' :
                    participation.status === 'in_progress' ? 'bg-blue-500' :
                    participation.status === 'accepted' ? 'bg-yellow-500' :
                    'bg-gray-500'
                  }`}></div>
                  <div>
                    <p className="font-medium">{participation.opportunity_title}</p>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span className={getStatusColor(participation.status)}>
                        {participation.status === 'completed' ? 'Concluído' :
                         participation.status === 'in_progress' ? 'Em Andamento' :
                         participation.status === 'accepted' ? 'Aceito' :
                         participation.status === 'applied' ? 'Candidato' : 'Status desconhecido'}
                      </span>
                      {participation.actual_hours && (
                        <span>{participation.actual_hours}h trabalhadas</span>
                      )}
                      {participation.people_helped && (
                        <span>{participation.people_helped} pessoas ajudadas</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {participation.admin_rating && (
                    <div className="flex items-center space-x-1 mb-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">{participation.admin_rating}/5</span>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {participation.completion_date ? 
                      new Date(participation.completion_date).toLocaleDateString('pt-BR') :
                      new Date(participation.created_at).toLocaleDateString('pt-BR')
                    }
                  </p>
                </div>
              </div>
            ))}
            {participations.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma atividade de voluntariado ainda.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VolunteerDashboard;
