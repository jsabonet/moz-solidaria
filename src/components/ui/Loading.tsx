// src/components/ui/Loading.tsx
import React from 'react';
import { Heart } from 'lucide-react';

interface LoadingProps {
  /**
   * Variante do loading
   * - fullscreen: Tela inteira com overlay
   * - page: Centralizado na página
   * - inline: Compacto para uso inline
   * - card: Para uso dentro de cards
   */
  variant?: 'fullscreen' | 'page' | 'inline' | 'card';
  
  /**
   * Mensagem personalizada de loading
   */
  message?: string;
  
  /**
   * Mostrar mensagem de progresso
   */
  showProgress?: boolean;
  
  /**
   * Valor do progresso (0-100)
   */
  progress?: number;
  
  /**
   * Tamanho do spinner
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Classe CSS adicional
   */
  className?: string;
}

/**
 * 🎯 MOZ SOLIDÁRIA - COMPONENTE DE LOADING PROFISSIONAL
 * =====================================================
 * 
 * Componente de loading customizado com design alinhado ao projeto,
 * usando as cores e identidade visual da Moz Solidária.
 * 
 * Características:
 * - Animação de coração pulsante (símbolo de solidariedade)
 * - Gradiente das cores do projeto (vermelho e laranja)
 * - Múltiplas variantes para diferentes contextos
 * - Suporte a mensagens e progresso
 * - Totalmente responsivo
 * 
 * @example
 * <Loading variant="fullscreen" message="Carregando dados..." />
 * <Loading variant="inline" size="sm" />
 * <Loading variant="page" showProgress progress={45} />
 */
export const Loading: React.FC<LoadingProps> = ({
  variant = 'page',
  message = 'Carregando...',
  showProgress = false,
  progress = 0,
  size = 'md',
  className = ''
}) => {
  // Mapeamento de tamanhos
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };

  // Componente do spinner com coração
  const HeartSpinner = () => (
    <div className="relative inline-flex items-center justify-center">
      {/* Círculo externo animado com gradiente */}
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr from-mozambique-red via-solidarity-orange to-mozambique-red opacity-20 absolute animate-ping`} />
      
      {/* Círculo rotativo com borda gradiente */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg className="animate-spin" viewBox="0 0 50 50">
          <defs>
            <linearGradient id="gradient-loading" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--mozambique-red))" />
              <stop offset="50%" stopColor="hsl(var(--solidarity-orange))" />
              <stop offset="100%" stopColor="hsl(var(--mozambique-red))" />
            </linearGradient>
          </defs>
          <circle
            className="opacity-25"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
          />
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="url(#gradient-loading)"
            strokeWidth="4"
            strokeDasharray="80"
            strokeDashoffset="60"
            strokeLinecap="round"
          />
        </svg>
        
        {/* Ícone de coração no centro com animação de pulso */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Heart 
            className={`${size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-8 w-8'} text-mozambique-red fill-current animate-pulse`} 
            style={{ animationDuration: '1.5s' }}
          />
        </div>
      </div>
    </div>
  );

  // Barra de progresso
  const ProgressBar = () => (
    <div className="w-full max-w-xs mt-4">
      <div className="flex justify-between items-center mb-2">
        <span className={`${textSizeClasses[size]} text-muted-foreground`}>
          Progresso
        </span>
        <span className={`${textSizeClasses[size]} font-semibold text-mozambique-red`}>
          {Math.round(progress)}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-mozambique-red to-solidarity-orange transition-all duration-500 ease-out rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        >
          <div className="h-full w-full bg-white/30 animate-pulse" />
        </div>
      </div>
    </div>
  );

  // Renderização baseada na variante
  switch (variant) {
    case 'fullscreen':
      return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm ${className}`}>
          <div className="flex flex-col items-center space-y-4 p-8">
            <HeartSpinner />
            <div className="text-center space-y-2">
              <p className={`${textSizeClasses[size]} font-medium text-foreground`}>
                {message}
              </p>
              {showProgress && <ProgressBar />}
              <p className="text-xs text-muted-foreground">
                Moz Solidária • Unidos pela mesma causa
              </p>
            </div>
          </div>
        </div>
      );

    case 'page':
      return (
        <div className={`flex items-center justify-center min-h-[400px] w-full ${className}`}>
          <div className="flex flex-col items-center space-y-4 p-6">
            <HeartSpinner />
            <div className="text-center space-y-2">
              <p className={`${textSizeClasses[size]} font-medium text-foreground`}>
                {message}
              </p>
              {showProgress && <ProgressBar />}
            </div>
          </div>
        </div>
      );

    case 'card':
      return (
        <div className={`flex items-center justify-center py-12 w-full ${className}`}>
          <div className="flex flex-col items-center space-y-3">
            <HeartSpinner />
            <p className={`${textSizeClasses[size]} text-muted-foreground`}>
              {message}
            </p>
            {showProgress && <ProgressBar />}
          </div>
        </div>
      );

    case 'inline':
      return (
        <div className={`inline-flex items-center space-x-2 ${className}`}>
          <HeartSpinner />
          <span className={`${textSizeClasses[size]} text-muted-foreground`}>
            {message}
          </span>
        </div>
      );

    default:
      return (
        <div className={`flex items-center justify-center ${className}`}>
          <HeartSpinner />
        </div>
      );
  }
};

/**
 * Componente de loading simplificado para Lazy Loading
 * Usa automaticamente a variante 'page'
 */
export const ComponentLoader: React.FC<{ message?: string }> = ({ 
  message = 'Carregando componente...' 
}) => (
  <Loading variant="page" message={message} size="md" />
);

/**
 * Hook helper para gerenciar estado de loading
 * @example
 * const { isLoading, startLoading, stopLoading } = useLoadingState();
 */
export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = React.useState(initialState);
  const [progress, setProgress] = React.useState(0);

  const startLoading = React.useCallback(() => {
    setIsLoading(true);
    setProgress(0);
  }, []);

  const stopLoading = React.useCallback(() => {
    setIsLoading(false);
    setProgress(100);
  }, []);

  const updateProgress = React.useCallback((value: number) => {
    setProgress(Math.min(100, Math.max(0, value)));
  }, []);

  return {
    isLoading,
    progress,
    startLoading,
    stopLoading,
    updateProgress,
    setIsLoading
  };
};

export default Loading;
