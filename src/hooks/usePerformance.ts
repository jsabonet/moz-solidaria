// src/hooks/usePerformance.ts
import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  componentMounts: number;
  memoryUsage?: number;
}

export const usePerformance = (componentName: string) => {
  const mountTimeRef = useRef<number>(Date.now());
  const renderStartRef = useRef<number>(Date.now());
  const mountCountRef = useRef<number>(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    componentMounts: 0
  });

  useEffect(() => {
    mountCountRef.current += 1;
    const loadTime = Date.now() - mountTimeRef.current;
    
    // Medir uso de memória se disponível
    let memoryUsage: number | undefined;
    if ('memory' in performance) {
      memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }

    setMetrics(prev => ({
      ...prev,
      loadTime,
      componentMounts: mountCountRef.current,
      memoryUsage
    }));

    return () => {
      const renderTime = Date.now() - renderStartRef.current;
      setMetrics(prev => ({ ...prev, renderTime }));
    };
  }, [componentName]);

  // Função para medir tempo de ação específica
  const measureAction = async <T>(actionName: string, action: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    try {
      const result = await action();
      const duration = performance.now() - start;
      
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      throw error;
    }
  };

  // Função para reportar Web Vitals
  const reportWebVitals = () => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        // Tentar obter Core Web Vitals
        if ('web-vitals' in window) {
          // Se a biblioteca web-vitals estiver carregada
          return;
        }
        
        // Métricas básicas sem biblioteca externa
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation) {
          const metrics = {
            FCP: navigation.responseStart - navigation.requestStart,
            LCP: navigation.loadEventEnd - navigation.loadEventStart,
            TTI: navigation.domInteractive - navigation.fetchStart,
            CLS: 0 // Seria necessário calcular com observadores
          };
        }
      });
    }
  };

  return {
    metrics,
    measureAction,
    reportWebVitals
  };
};

// Hook para otimização de re-renders
export const useOptimizedState = <T>(initialValue: T, isEqual?: (a: T, b: T) => boolean) => {
  const [state, setState] = useState<T>(initialValue);
  const previousValueRef = useRef<T>(initialValue);

  const optimizedSetState = (newValue: T | ((prev: T) => T)) => {
    const value = typeof newValue === 'function' ? (newValue as (prev: T) => T)(state) : newValue;
    
    // Usar função de comparação personalizada ou comparação de referência
    const areEqual = isEqual ? isEqual(previousValueRef.current, value) : previousValueRef.current === value;
    
    if (!areEqual) {
      previousValueRef.current = value;
      setState(value);
    }
  };

  return [state, optimizedSetState] as const;
};

// Hook para debouncing (otimização de performance)
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Hook para throttling (otimização de performance)
export const useThrottle = <T>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

// Hook para lazy loading de imagens
export const useLazyImage = (src: string, options?: IntersectionObserverInit) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [options]);

  useEffect(() => {
    if (isInView && !isLoaded) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.src = src;
    }
  }, [isInView, isLoaded, src]);

  return {
    ref: imgRef,
    src: isLoaded ? src : undefined,
    isLoaded,
    isInView
  };
};
