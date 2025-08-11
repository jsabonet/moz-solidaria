// src/components/DonorLevelBadge.tsx
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Star } from 'lucide-react';
import { DONOR_LEVELS } from '@/lib/donorApi';

interface DonorLevelBadgeProps {
  currentLevel: string;
  totalDonated: number;
  progress?: number;
  nextLevelAmount?: number;
  nextLevelName?: string;
  showProgress?: boolean;
}

const getLevelColor = (level: string) => {
  const colors = {
    'Bronze': 'bg-amber-100 text-amber-800 border-amber-300',
    'Prata': 'bg-gray-100 text-gray-800 border-gray-300',
    'Ouro': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Platina': 'bg-blue-100 text-blue-800 border-blue-300',
    'Diamante': 'bg-purple-100 text-purple-800 border-purple-300'
  };
  return colors[level as keyof typeof colors] || colors['Bronze'];
};

const getLevelIcon = (level: string) => {
  const iconProps = { className: "h-4 w-4" };
  
  switch(level) {
    case 'Bronze': return <Trophy {...iconProps} className="h-4 w-4 text-amber-600" />;
    case 'Prata': return <Trophy {...iconProps} className="h-4 w-4 text-gray-600" />;
    case 'Ouro': return <Trophy {...iconProps} className="h-4 w-4 text-yellow-600" />;
    case 'Platina': return <Trophy {...iconProps} className="h-4 w-4 text-blue-600" />;
    case 'Diamante': return <Star {...iconProps} className="h-4 w-4 text-purple-600" />;
    default: return <Trophy {...iconProps} className="h-4 w-4 text-amber-600" />;
  }
};

export const DonorLevelBadge: React.FC<DonorLevelBadgeProps> = ({
  currentLevel,
  totalDonated,
  progress = 0,
  nextLevelAmount = 0,
  nextLevelName,
  showProgress = false
}) => {
  // Forçar exibição do código oficial "MZN" (evitando símbolo antigo "MTn")
  const formatCurrency = (amount: number) => {
    if (amount == null || isNaN(amount as any)) return 'MZN 0';
    const formatted = new Intl.NumberFormat('pt-MZ', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
    return `MZN ${formatted}`; // nunca exibirá MTn
  };

  if (!showProgress) {
    return (
      <Badge variant="secondary" className={`flex items-center space-x-2 ${getLevelColor(currentLevel)}`}>
        {getLevelIcon(currentLevel)}
        <span>{currentLevel}</span>
      </Badge>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getLevelIcon(currentLevel)}
            <span>Nível {currentLevel}</span>
          </div>
          <Badge variant="outline" className={getLevelColor(currentLevel)}>
            {formatCurrency(totalDonated)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {nextLevelName && nextLevelAmount > 0 ? (
          <>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso para {nextLevelName}</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Atual: {formatCurrency(totalDonated)}</span>
                <span>Meta: {formatCurrency(nextLevelAmount + totalDonated)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span>Faltam {formatCurrency(nextLevelAmount)} para {nextLevelName}</span>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <Star className="h-4 w-4" />
            <span>Nível máximo alcançado! 🎉</span>
          </div>
        )}
        
        {/* Níveis disponíveis */}
        <div className="pt-2 border-t">
          <h4 className="text-sm font-medium mb-2">Todos os Níveis</h4>
          <div className="space-y-1">
            {Object.entries(DONOR_LEVELS).map(([key, level]) => {
              const isAchieved = totalDonated >= level.min;
              const isCurrent = currentLevel === level.name;
              
              return (
                <div key={key} className={`flex items-center justify-between text-xs px-2 py-1 rounded ${
                  isCurrent ? 'bg-primary/10 font-medium' : 
                  isAchieved ? 'bg-green-50 text-green-700' : 'text-muted-foreground'
                }`}>
                  <div className="flex items-center space-x-2">
                    {isAchieved ? (
                      <Star className="h-3 w-3 text-green-600" />
                    ) : (
                      <div className="h-3 w-3 rounded-full border border-gray-300" />
                    )}
                    <span>{level.name}</span>
                  </div>
                  <span>
                    {level.max === Infinity 
                      ? `${formatCurrency(level.min)}+` 
                      : `${formatCurrency(level.min)} - ${formatCurrency(level.max)}`
                    }
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DonorLevelBadge;
