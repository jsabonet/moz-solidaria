import { useEffect, useState } from 'react';
// (toast import removido; auto update agora é silencioso)

interface BuildInfo {
  version: string;
  buildTime: string;
  gitHash: string;
  buildId: string;
  cacheBuster: number;
}

interface UpdateCheckerProps {
  checkInterval?: number; // ms (default 5m)
  autoReloadDelayMs?: number; // tempo entre detectar e recarregar (default 3000)
  hardReload?: boolean; // se true usa location.reload(true) style (força) / fallback normal
  log?: boolean; // habilita logs no console
}

export const UpdateChecker: React.FC<UpdateCheckerProps> = ({ 
  checkInterval = 5 * 60 * 1000,
  autoReloadDelayMs = 3000,
  hardReload = false,
  log = false,
}) => {
  const [currentBuildId, setCurrentBuildId] = useState<string | null>(null);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [reloadScheduled, setReloadScheduled] = useState(false);

  const scheduleReload = (newId: string) => {
    if (reloadScheduled) return;
    setReloadScheduled(true);
    // Limpeza leve de caches antes do reload
    if ('caches' in window) {
      caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))).catch(() => {}));
    }
    // Preserva tokens, remove chaves voláteis
    const keep = new Set(['auth-token','refresh-token','user-preferences','app-build-id']);
    try {
      Object.keys(localStorage).forEach(k => { if (!keep.has(k)) localStorage.removeItem(k); });
    } catch {}
    setTimeout(() => {
      // Atualiza build id local antes de recarregar para evitar loops caso SW atrasado
      localStorage.setItem('app-build-id', newId);
      if (hardReload) {
        // Sem garantia em navegadores modernos, mas tentativa de forçar
        window.location.href = window.location.href.split('#')[0] + (window.location.search ? '' : '');
        window.location.reload();
      } else {
        window.location.reload();
      }
    }, Math.max(500, autoReloadDelayMs));
  };

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
        // Error handled silently
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
            scheduleReload(buildInfo.buildId);
          }
        }
      } catch (error) {
        // Error handled silently
      }
    };

    const interval = setInterval(checkForUpdates, checkInterval);
    return () => clearInterval(interval);
  }, [currentBuildId, checkInterval]);

  // Retém API para uso externo caso necessário (não exposto agora)
  const handleUpdate = () => scheduleReload(currentBuildId || '');

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
                scheduleReload(buildInfo.buildId);
              }
            }
          } catch (error) {
            // Error handled silently
          }
        }, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [currentBuildId, isUpdateAvailable]);

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
        // Error handled silently
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
