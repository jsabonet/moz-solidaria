import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import { toast } from 'sonner';

interface InstallPWAProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
}

export const InstallPWAButton: React.FC<InstallPWAProps> = ({ 
  className = '',
  variant = 'outline',
  size = 'default',
  showIcon = true
}) => {
  const { isInstallable, isInstalled, install } = usePWA();

  const handleInstall = async () => {
    try {
      const success = await install();
      if (success) {
        toast.success('App instalado com sucesso!');
      } else {
        toast.info('Instalação cancelada pelo usuário');
      }
    } catch (error) {
      console.error('Error installing PWA:', error);
      toast.error('Erro ao instalar o app');
    }
  };

  // Não mostrar o botão se não for instalável ou já estiver instalado
  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    <Button
      onClick={handleInstall}
      variant={variant}
      size={size}
      className={className}
    >
      {showIcon && <Download className="h-4 w-4 mr-2" />}
      Instalar App
    </Button>
  );
};

export const InstallPWABanner: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWA();

  const handleInstall = async () => {
    const success = await install();
    if (success) {
      toast.success('App instalado com sucesso!');
    }
  };

  const handleDismiss = () => {
    // Você pode adicionar lógica para lembrar que o usuário dispensou o banner
    localStorage.setItem('pwa-banner-dismissed', 'true');
  };

  // Não mostrar se não for instalável, já instalado, ou foi dispensado
  if (!isInstallable || isInstalled || localStorage.getItem('pwa-banner-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white border border-border rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start space-x-3">
        <div className="bg-primary/10 p-2 rounded-full">
          <Smartphone className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-foreground">
            Instalar Moz Solidária
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            Acesse rapidamente e receba notificações importantes
          </p>
          <div className="flex space-x-2 mt-3">
            <Button size="sm" onClick={handleInstall}>
              Instalar
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss}>
              Agora não
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
