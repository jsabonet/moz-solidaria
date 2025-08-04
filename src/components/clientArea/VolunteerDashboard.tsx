// src/components/clientArea/VolunteerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  Clock, 
  Users, 
  Star, 
  Calendar,
  Award,
  Target,
  MapPin,
  CheckCircle
} from 'lucide-react';
import { DashboardStats } from '@/types/clientArea';
import { fetchMatchingRequests, fetchSkills } from '@/lib/clientAreaApi';
import { MatchingRequest, Skill } from '@/types/clientArea';

interface VolunteerDashboardProps {
  stats: DashboardStats | null;
}

const VolunteerDashboard: React.FC<VolunteerDashboardProps> = ({ stats }) => {
  const [availableRequests, setAvailableRequests] = useState<MatchingRequest[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [requests, skillsData] = await Promise.all([
          fetchMatchingRequests(),
          fetchSkills()
        ]);
        setAvailableRequests(requests.filter(r => r.status === 'open'));
        setSkills(skillsData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const volunteerStats = stats?.stats || {};

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

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
            <div className="text-2xl font-bold">{volunteerStats.hours_contributed || 0}h</div>
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
            <div className="text-2xl font-bold">{volunteerStats.people_helped || 0}</div>
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
            <div className="text-2xl font-bold">{volunteerStats.average_rating || 0}/5</div>
            <p className="text-xs text-muted-foreground">
              Baseado em {volunteerStats.total_reviews || 0} avaliações
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nível Voluntário</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{volunteerStats.volunteer_level || 'Iniciante'}</div>
            <p className="text-xs text-muted-foreground">
              Próximo nível em {volunteerStats.hours_to_next_level || 20}h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progresso Mensal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Meta Mensal de Voluntariado</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span>Progresso: {volunteerStats.monthly_hours || 0} horas</span>
            <span>Meta: {volunteerStats.monthly_goal || 20} horas</span>
          </div>
          <Progress 
            value={(volunteerStats.monthly_hours || 0) / (volunteerStats.monthly_goal || 20) * 100} 
            className="w-full" 
          />
          <p className="text-xs text-muted-foreground">
            {((volunteerStats.monthly_hours || 0) / (volunteerStats.monthly_goal || 20) * 100).toFixed(1)}% da meta mensal alcançada
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Oportunidades Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5" />
              <span>Oportunidades Disponíveis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground">Carregando oportunidades...</p>
            ) : (
              <div className="space-y-3">
                {availableRequests.slice(0, 4).map((request) => (
                  <div key={request.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{request.title}</h4>
                      <Badge variant={getUrgencyColor(request.urgency_level)}>
                        {request.urgency_level}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {request.description.slice(0, 100)}...
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" />
                        {request.location || 'Remoto'}
                      </span>
                      <Button size="sm" variant="outline">
                        Candidatar-se
                      </Button>
                    </div>
                  </div>
                ))}
                {availableRequests.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma oportunidade disponível no momento.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Suas Habilidades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5" />
              <span>Suas Habilidades</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {skills.slice(0, 8).map((skill) => (
                <Badge key={skill.id} variant="secondary" className="justify-center">
                  {skill.name}
                </Badge>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              Gerenciar Habilidades
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Calendar className="h-6 w-6 mb-2" />
              <span className="text-sm">Agendar Voluntariado</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">Encontrar Beneficiários</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Award className="h-6 w-6 mb-2" />
              <span className="text-sm">Minhas Certificações</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Star className="h-6 w-6 mb-2" />
              <span className="text-sm">Feedback Recebido</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Atividades */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Voluntariado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recent_activities?.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Concluído</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            )) || (
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
