import { useState, useEffect } from 'react';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWA = () => {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone || isIOSStandalone);

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Importante: preventDefault() para capturar o evento
      e.preventDefault();
      console.log('PWA: beforeinstallprompt event captured and prevented');
      
      setInstallPrompt(e as any);
      setIsInstallable(true);
      
      // Note: Para mostrar o banner, chame installPrompt.prompt() quando apropriado
      // O browser não irá mostrar o banner automático após preventDefault()
    };

    // Handle app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!installPrompt) {
      console.log('PWA: No install prompt available');
      return false;
    }

    try {
      console.log('PWA: Showing install prompt');
      // Aqui chamamos prompt() para mostrar o banner de instalação
      await installPrompt.prompt();
      
      const choiceResult = await installPrompt.userChoice;
      console.log('PWA: User choice result:', choiceResult);
      
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA: User accepted installation');
        setIsInstalled(true);
        setIsInstallable(false);
        setInstallPrompt(null);
        return true;
      } else {
        console.log('PWA: User dismissed installation');
      }
      
      return false;
    } catch (error) {
      console.error('PWA: Install failed:', error);
      return false;
    }
  };

  return {
    isInstalled,
    isInstallable,
    install
  };
};
