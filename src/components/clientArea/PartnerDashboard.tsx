// src/components/clientArea/PartnerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Building, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Target,
  Handshake,
  Award,
  Globe
} from 'lucide-react';
import { DashboardStats } from '@/types/clientArea';

interface PartnerDashboardProps {
  stats: DashboardStats | null;
}

const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ stats }) => {
  const partnerStats = stats?.stats || {};

  // Dados dinâmicos baseados nas estatísticas reais do backend
  const organizationName = partnerStats.organization_name || "Organização Parceira";
  const organizationType = (partnerStats.organization_type as unknown as string) || "ngo";
  const partnershipLevel = (partnerStats.partnership_level as unknown as string) || "operational";
  const contactPerson = partnerStats.contact_person || "Responsável";
  const expertiseCount = partnerStats.areas_of_expertise_count || 0;

  const getPartnershipTypeColor = (type: string) => {
    switch (type) {
      case 'ngo': return 'bg-green-500 text-white';
      case 'government': return 'bg-blue-500 text-white';
      case 'private': return 'bg-purple-500 text-white';
      case 'international': return 'bg-orange-500 text-white';
      case 'academic': return 'bg-indigo-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partnerStats.active_projects || 0}</div>
            <p className="text-xs text-muted-foreground">
              Projetos em andamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beneficiários Impactados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partnerStats.beneficiaries_impacted || 0}</div>
            <p className="text-xs text-muted-foreground">
              Pessoas alcançadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recursos Investidos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">MT {partnerStats.resources_invested || '0.00'}</div>
            <p className="text-xs text-muted-foreground">
              Valor total investido
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{partnerStats.success_rate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Projetos bem-sucedidos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progresso de Projetos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Progresso dos Projetos Ativos</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Projeto Alimentação Escolar</span>
                <span>85% concluído</span>
              </div>
              <Progress value={85} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Programa de Capacitação</span>
                <span>60% concluído</span>
              </div>
              <Progress value={60} className="w-full" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Construção de Poços</span>
                <span>30% concluído</span>
              </div>
              <Progress value={30} className="w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tipo de Parceria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Handshake className="h-5 w-5" />
              <span>Tipo de Parceria</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">{organizationName}</span>
              <Badge className={getPartnershipTypeColor(organizationType)}>
                {organizationType === 'ngo' ? 'ONG' : 
                 organizationType === 'government' ? 'Governo' : 
                 organizationType === 'private' ? 'Privada' : 'Outro'}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Nível de parceria: {partnershipLevel === 'strategic' ? 'Estratégica' : 
                                 partnershipLevel === 'operational' ? 'Operacional' : 
                                 partnershipLevel === 'financial' ? 'Financeira' : 'Técnica'}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Responsável:</span>
                <p className="font-medium">{contactPerson}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Áreas de Expertise:</span>
                <p className="font-medium">{expertiseCount} área{expertiseCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recursos Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="h-5 w-5" />
              <span>Recursos Disponíveis</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Financiamento</span>
              <Badge variant="secondary">MT 50.000/mês</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Voluntários Corporativos</span>
              <Badge variant="secondary">25 pessoas</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Infraestrutura</span>
              <Badge variant="secondary">Escritórios e Veículos</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Expertise Técnica</span>
              <Badge variant="secondary">TI e Gestão</Badge>
            </div>
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
              <Building className="h-6 w-6 mb-2" />
              <span className="text-sm">Novo Projeto</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Users className="h-6 w-6 mb-2" />
              <span className="text-sm">Gerenciar Equipe</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span className="text-sm">Relatórios</span>
            </Button>
            <Button variant="outline" className="flex flex-col items-center p-4 h-auto">
              <Calendar className="h-6 w-6 mb-2" />
              <span className="text-sm">Agendar Reunião</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Parcerias */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.recent_activities?.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">Em Andamento</Badge>
                  <p className="text-sm text-muted-foreground mt-1">{activity.timestamp}</p>
                </div>
              </div>
            )) || (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma atividade de parceria ainda.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Impacto Social */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5" />
            <span>Impacto Social Gerado</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {partnerStats.families_helped || 0}
              </div>
              <p className="text-sm text-muted-foreground">Famílias Ajudadas</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {partnerStats.students_sponsored || 0}
              </div>
              <p className="text-sm text-muted-foreground">Estudantes Patrocinados</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {partnerStats.jobs_created || 0}
              </div>
              <p className="text-sm text-muted-foreground">Empregos Criados</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {partnerStats.communities_reached || 0}
              </div>
              <p className="text-sm text-muted-foreground">Comunidades Alcançadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PartnerDashboard;
