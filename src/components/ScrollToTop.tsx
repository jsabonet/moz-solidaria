// src/components/ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 📜 COMPONENTE SCROLL TO TOP
 * 
 * Garante que toda navegação entre páginas comece no topo da página,
 * resolvendo o problema de páginas carregando no meio ou fim.
 * 
 * Este componente é executado automaticamente em toda mudança de rota.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll imediato para o topo ao mudar de rota
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // 'instant' para scroll imediato, sem animação
    });

    // Fallback: garantir scroll após 50ms (para casos de lazy loading)
    const timeoutId = setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [pathname]); // Executar sempre que o pathname mudar

  return null; // Componente não renderiza nada
};

export default ScrollToTop;
