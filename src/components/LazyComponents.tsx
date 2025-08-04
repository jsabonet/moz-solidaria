// src/components/LazyComponents.tsx
import { lazy } from 'react';
import { Loader2 } from 'lucide-react';

// Componente de Loading padrão
export const ComponentLoader = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">Carregando...</span>
    </div>
  </div>
);

// Lazy loading dos componentes do Portal de Comunidade
export const LazyClientArea = lazy(() => 
  import('@/pages/ClientArea').then(module => ({ 
    default: module.default 
  }))
);

export const LazyDonorDashboard = lazy(() => 
  import('@/components/clientArea/DonorDashboard').then(module => ({ 
    default: module.default 
  }))
);

export const LazyVolunteerDashboard = lazy(() => 
  import('@/components/clientArea/VolunteerDashboard').then(module => ({ 
    default: module.default 
  }))
);

export const LazyDonationsPage = lazy(() => 
  import('@/pages/DonationsPage').then(module => ({ 
    default: module.default 
  }))
);

export const LazyBeneficiaryDashboard = lazy(() => 
  import('@/components/clientArea/BeneficiaryDashboard').then(module => ({ 
    default: module.default 
  }))
);

export const LazyPartnerDashboard = lazy(() => 
  import('@/components/clientArea/PartnerDashboard').then(module => ({ 
    default: module.default 
  }))
);

export const LazyNotificationCenter = lazy(() => 
  import('@/components/clientArea/NotificationCenter').then(module => ({ 
    default: module.default 
  }))
);

export const LazyProfileSettings = lazy(() => 
  import('@/components/clientArea/ProfileSettings').then(module => ({ 
    default: module.default 
  }))
);

export const LazyMatchingSystem = lazy(() => 
  import('@/components/clientArea/MatchingSystem').then(module => ({ 
    default: module.default 
  }))
);

// Lazy loading de páginas principais
export const LazyBlog = lazy(() => 
  import('@/pages/Blog').then(module => ({ 
    default: module.default 
  }))
);

export const LazyBlogDetail = lazy(() => 
  import('@/pages/BlogDetail').then(module => ({ 
    default: module.default 
  }))
);

export const LazyDashboard = lazy(() => 
  import('@/pages/Dashboard').then(module => ({ 
    default: module.default 
  }))
);

export const LazyCreatePost = lazy(() => 
  import('@/pages/CreatePost').then(module => ({ 
    default: module.default 
  }))
);

export const LazyEditPost = lazy(() => 
  import('@/pages/EditPost').then(module => ({ 
    default: module.default 
  }))
);

// Componente RichTextEditor assíncrono para performance
export const LazyRichTextEditor = lazy(() => 
  import('@/components/RichTextEditorAsync').then(module => ({ 
    default: module.default 
  }))
);
