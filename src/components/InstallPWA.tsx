// PWA INSTALL COMPONENTS - DESABILITADOS
// Estes componentes foram desabilitados para remover a funcionalidade de download offline do site

import React from 'react';

interface InstallPWAProps {
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  showIcon?: boolean;
}

// Componente desabilitado
export const InstallPWAButton: React.FC<InstallPWAProps> = () => {
  return null;
};

// Componente desabilitado
export const InstallPWABanner: React.FC = () => {
  return null;
};
