import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { usePWA } from '@/hooks/usePWA';
import { Download, Smartphone, Check, X } from 'lucide-react';

const PWAInstallPrompt = () => {
  const { isInstalled, isInstallable, install } = usePWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await install();
    setIsInstalling(false);
    
    if (success) {
      setShowPrompt(false);
    }
  };

  // Don't show if already installed or not installable
  if (isInstalled || !isInstallable) {
    return null;
  }

  return (
    <>
      {/* Floating install button */}
      <div className="fixed bottom-4 right-4 z-50 md:bottom-6 md:right-6">
        <Button
          onClick={() => setShowPrompt(true)}
          className="rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-mozambique-red to-solidarity-orange hover:from-solidarity-orange hover:to-mozambique-red"
          size="icon"
        >
          <Download className="h-6 w-6" />
        </Button>
      </div>

      {/* Install dialog */}
      <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10 w-fit">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold">
              Instalar App Móvel
            </DialogTitle>
            <DialogDescription className="text-center">
              Instale a Moz Solidária no seu dispositivo para uma experiência melhor
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Acesso offline</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Notificações push</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Experiência nativa</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Atualizações automáticas</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPrompt(false)}
                className="flex-1"
              >
                <X className="h-4 w-4 mr-2" />
                Agora não
              </Button>
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="flex-1 bg-gradient-to-r from-mozambique-red to-solidarity-orange hover:from-solidarity-orange hover:to-mozambique-red"
              >
                <Download className="h-4 w-4 mr-2" />
                {isInstalling ? 'Instalando...' : 'Instalar'}
              </Button>
            </div>

            <div className="text-center">
              <Badge variant="secondary" className="text-xs">
                Grátis • Seguro • Sem anúncios
              </Badge>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PWAInstallPrompt;
