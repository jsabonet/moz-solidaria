import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';

/**
 * 🔄 COMPONENTE DE LIMPEZA AUTOMÁTICA DE CACHE
 * 
 * Este componente detecta reloads da página e força a limpeza de cache
 * para garantir que as permissões sejam sempre atualizadas.
 */
export const AuthCacheManager = () => {
  const { forceRefreshUserPermissions, isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Verificar se é um reload da página
    const checkPageReload = () => {
      const pageLoadKey = 'page_load_cache_check';
      const lastCheck = sessionStorage.getItem(pageLoadKey);
      const now = Date.now();
      
      // Se não há registro ou passou mais de 10 segundos, é um novo carregamento
      const isNewPageLoad = !lastCheck || (now - parseInt(lastCheck)) > 10000;
      
      if (isNewPageLoad && isAuthenticated && user) {
        console.log('🔄 NOVO CARREGAMENTO DE PÁGINA DETECTADO - Verificando se cache precisa ser limpo...');
        sessionStorage.setItem(pageLoadKey, now.toString());
        
        // Verificar se há mudanças pendentes nas permissões
        const lastPermissionCheck = localStorage.getItem('last_permission_check');
        const needsRefresh = !lastPermissionCheck || (now - parseInt(lastPermissionCheck)) > 30000; // 30 segundos
        
        if (needsRefresh) {
          console.log('🧹 Executando limpeza preventiva de cache...');
          
          // Executar limpeza de cache de forma silenciosa
          forceRefreshUserPermissions()
            .then(() => {
              console.log('✅ Cache limpo automaticamente após carregamento da página');
              localStorage.setItem('last_permission_check', now.toString());
            })
            .catch((error) => {
              console.warn('⚠️ Erro na limpeza automática de cache:', error);
            });
        }
      }
    };

    // Executar verificação imediatamente
    if (isAuthenticated) {
      checkPageReload();
    }

    // Também executar quando o foco volta para a janela
    const handleFocus = () => {
      if (isAuthenticated && user) {
        const lastFocusCheck = sessionStorage.getItem('last_focus_check');
        const now = Date.now();
        
        // Se passou mais de 5 minutos sem foco, verificar permissões
        if (!lastFocusCheck || (now - parseInt(lastFocusCheck)) > 300000) {
          console.log('🔍 Foco retornou após longo período - Verificando permissões...');
          sessionStorage.setItem('last_focus_check', now.toString());
          
          forceRefreshUserPermissions()
            .then(() => {
              console.log('✅ Permissões atualizadas após retorno do foco');
            })
            .catch((error) => {
              console.warn('⚠️ Erro na atualização de foco:', error);
            });
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, user, forceRefreshUserPermissions]);

  // Este componente não renderiza nada, apenas gerencia o cache
  return null;
};

export default AuthCacheManager;
