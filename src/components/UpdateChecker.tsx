import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BuildInfo {
  version: string;
  buildTime: string;
  gitHash: string;
  buildId: string;
  cacheBuster: number;
}

interface UpdateCheckerProps {
  checkInterval?: number; // em milissegundos (padrão: 5 minutos)
  showToast?: boolean;
}

export const UpdateChecker: React.FC<UpdateCheckerProps> = ({ 
  checkInterval = 5 * 60 * 1000, // 5 minutos
  showToast = true 
}) => {
  const [currentBuildId, setCurrentBuildId] = useState<string | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  // Obter build info atual na inicialização
  useEffect(() => {
    const getCurrentBuildInfo = async () => {
      try {
        const response = await fetch('/build-info.json', {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        if (response.ok) {
          const buildInfo: BuildInfo = await response.json();
          setCurrentBuildId(buildInfo.buildId);
          
          // Armazenar no localStorage para comparação
          localStorage.setItem('app-build-id', buildInfo.buildId);
        }
      } catch (error) {
        console.log('Could not fetch build info:', error);
      }
    };

    getCurrentBuildInfo();
  }, []);

  // Verificar atualizações periodicamente
  useEffect(() => {
    if (!currentBuildId) return;

    const checkForUpdates = async () => {
      try {
        const response = await fetch(`/build-info.json?t=${Date.now()}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',  
            'Pragma': 'no-cache'
          }
        });

        if (response.ok) {
          const buildInfo: BuildInfo = await response.json();
          const storedBuildId = localStorage.getItem('app-build-id');
          
          if (storedBuildId && buildInfo.buildId !== storedBuildId) {
            setIsUpdateAvailable(true);
            
            if (showToast) {
              toast.info('Nova versão disponível!', {
                description: 'Clique em "Atualizar" para obter a versão mais recente.',
                action: {
                  label: 'Atualizar',
                  onClick: () => handleUpdate()
                },
                duration: 0, // Toast persistente
                id: 'app-update-available'
              });
            }
          }
        }
      } catch (error) {
        console.log('Error checking for updates:', error);
      }
    };

    const interval = setInterval(checkForUpdates, checkInterval);
    return () => clearInterval(interval);
  }, [currentBuildId, checkInterval, showToast]);

  const handleUpdate = () => {
    // Limpar cache e recarregar
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }
    
    // Limpar localStorage específico do app
    const keysToKeep = ['user-preferences', 'auth-token']; // Manter dados importantes
    Object.keys(localStorage).forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    // Recarregar com bypass de cache
    window.location.reload();
  };

  // Verificar na visibilidade da página (quando usuário volta ao tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentBuildId) {
        // Pequeno delay para evitar múltiplas verificações
        setTimeout(async () => {
          try {
            const response = await fetch(`/build-info.json?t=${Date.now()}`, {
              cache: 'no-cache'
            });
            
            if (response.ok) {
              const buildInfo: BuildInfo = await response.json();
              const storedBuildId = localStorage.getItem('app-build-id');
              
              if (storedBuildId && buildInfo.buildId !== storedBuildId && !isUpdateAvailable) {
                setIsUpdateAvailable(true);
                
                if (showToast) {
                  toast.info('Nova versão disponível!', {
                    description: 'Uma atualização foi detectada.',
                    action: {
                      label: 'Atualizar',
                      onClick: () => handleUpdate()
                    },
                    duration: 0,
                    id: 'app-update-available'
                  });
                }
              }
            }
          } catch (error) {
            console.log('Error checking for updates on visibility change:', error);
          }
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentBuildId, isUpdateAvailable, showToast]);

  // Component não retorna JSX, apenas executa lógica
  return null;
};

// Hook para usar o UpdateChecker em outros componentes
export const useUpdateChecker = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [buildId, setBuildId] = useState<string | null>(null);

  useEffect(() => {
    const checkBuildInfo = async () => {
      try {
        const response = await fetch('/build-info.json', { cache: 'no-cache' });
        if (response.ok) {
          const buildInfo: BuildInfo = await response.json();
          setBuildId(buildInfo.buildId);
          
          const stored = localStorage.getItem('app-build-id');
          if (stored && stored !== buildInfo.buildId) {
            setUpdateAvailable(true);
          } else {
            localStorage.setItem('app-build-id', buildInfo.buildId);
          }
        }
      } catch (error) {
        console.log('Could not check build info:', error);
      }
    };

    checkBuildInfo();
  }, []);

  const forceUpdate = () => {
    if ('caches' in window) {
      caches.keys().then(names => names.forEach(name => caches.delete(name)));
    }
    window.location.reload();
  };

  return { updateAvailable, buildId, forceUpdate };
};
