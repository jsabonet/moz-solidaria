// src/components/ProjectDataBridge.tsx
import React, { useState, useEffect } from 'react';

interface ProjectMetrics {
  id: string;
  peopleImpacted: number;
  budgetUsed: number;
  budgetTotal: number;
  progressPercentage: number;
  completedMilestones: number;
  totalMilestones: number;
  startDate: Date;
  endDate?: Date;
  galleryImages: number;
  lastUpdated: Date;
}

interface ProjectUpdate {
  id: string;
  date: Date;
  title: string;
  description: string;
  type: 'milestone' | 'progress' | 'issue' | 'achievement';
  images: string[];
  metrics?: {
    peopleImpacted?: number;
    budgetSpent?: number;
    progressPercentage?: number;
  };
  author: string;
  status: 'draft' | 'published';
}

interface ProjectImage {
  id: string;
  url: string;
  title: string;
  description: string;
  category: 'before' | 'progress' | 'after' | 'team' | 'community' | 'infrastructure' | 'events';
  featured: boolean;
  uploadDate: Date;
}

class ProjectDataBridge {
  private static instance: ProjectDataBridge;
  private projectMetrics: Map<string, ProjectMetrics> = new Map();
  private projectUpdates: Map<string, ProjectUpdate[]> = new Map();
  private projectImages: Map<string, ProjectImage[]> = new Map();
  private subscribers: Map<string, ((data: any) => void)[]> = new Map();

  static getInstance(): ProjectDataBridge {
    if (!ProjectDataBridge.instance) {
      ProjectDataBridge.instance = new ProjectDataBridge();
    }
    return ProjectDataBridge.instance;
  }

  // Subscrições para atualizações em tempo real
  subscribe(projectId: string, callback: (data: any) => void): () => void {
    if (!this.subscribers.has(projectId)) {
      this.subscribers.set(projectId, []);
    }
    this.subscribers.get(projectId)!.push(callback);

    // Retorna função de unsubscribe
    return () => {
      const callbacks = this.subscribers.get(projectId);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  private notify(projectId: string, data: any) {
    const callbacks = this.subscribers.get(projectId);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  // Gestão de Métricas
  updateProjectMetrics(projectId: string, metrics: Partial<ProjectMetrics>) {
    const existing = this.projectMetrics.get(projectId) || {
      id: projectId,
      peopleImpacted: 0,
      budgetUsed: 0,
      budgetTotal: 100000,
      progressPercentage: 0,
      completedMilestones: 0,
      totalMilestones: 10,
      startDate: new Date(),
      galleryImages: 0,
      lastUpdated: new Date()
    };

    const updated = { ...existing, ...metrics, lastUpdated: new Date() };
    this.projectMetrics.set(projectId, updated);
    
    this.notify(projectId, { type: 'metrics', data: updated });
    return updated;
  }

  getProjectMetrics(projectId: string): ProjectMetrics | null {
    return this.projectMetrics.get(projectId) || null;
  }

  // Gestão de Atualizações
  addProjectUpdate(projectId: string, update: Omit<ProjectUpdate, 'id'>) {
    const updates = this.projectUpdates.get(projectId) || [];
    const newUpdate = { ...update, id: Date.now().toString() };
    
    updates.unshift(newUpdate);
    this.projectUpdates.set(projectId, updates);

    // Atualizar métricas automaticamente se fornecidas
    if (update.metrics) {
      const currentMetrics = this.getProjectMetrics(projectId);
      if (currentMetrics) {
        const updatedMetrics: Partial<ProjectMetrics> = {};
        
        if (update.metrics.peopleImpacted) {
          updatedMetrics.peopleImpacted = currentMetrics.peopleImpacted + update.metrics.peopleImpacted;
        }
        
        if (update.metrics.budgetSpent) {
          updatedMetrics.budgetUsed = currentMetrics.budgetUsed + update.metrics.budgetSpent;
        }
        
        if (update.metrics.progressPercentage) {
          updatedMetrics.progressPercentage = update.metrics.progressPercentage;
        }

        this.updateProjectMetrics(projectId, updatedMetrics);
      }
    }

    this.notify(projectId, { type: 'updates', data: updates });
    return newUpdate;
  }

  getProjectUpdates(projectId: string): ProjectUpdate[] {
    return this.projectUpdates.get(projectId) || [];
  }

  // Gestão de Galeria
  addProjectImage(projectId: string, image: Omit<ProjectImage, 'id'>) {
    const images = this.projectImages.get(projectId) || [];
    const newImage = { ...image, id: Date.now().toString() };
    
    images.push(newImage);
    this.projectImages.set(projectId, images);

    // Atualizar contador de imagens nas métricas
    const currentMetrics = this.getProjectMetrics(projectId);
    if (currentMetrics) {
      this.updateProjectMetrics(projectId, { galleryImages: images.length });
    }

    this.notify(projectId, { type: 'gallery', data: images });
    return newImage;
  }

  getProjectImages(projectId: string): ProjectImage[] {
    return this.projectImages.get(projectId) || [];
  }

  getFeaturedImages(projectId: string): ProjectImage[] {
    return this.getProjectImages(projectId).filter(img => img.featured);
  }

  // Dados para a página de detalhes do projeto
  getProjectDetailData(projectId: string) {
    const metrics = this.getProjectMetrics(projectId);
    const updates = this.getProjectUpdates(projectId);
    const images = this.getProjectImages(projectId);
    const featuredImages = this.getFeaturedImages(projectId);

    return {
      metrics,
      updates: updates.filter(u => u.status === 'published').slice(0, 5), // Últimas 5 atualizações
      images: featuredImages.slice(0, 8), // Até 8 imagens em destaque
      gallery: images,
      stats: {
        totalUpdates: updates.length,
        totalImages: images.length,
        lastUpdate: updates.length > 0 ? updates[0].date : null
      }
    };
  }

  // Simulação de dados iniciais para desenvolvimento
  initializeSampleData() {
    // Projeto 1 - Água para Comunidades
    this.updateProjectMetrics('1', {
      peopleImpacted: 1245,
      budgetUsed: 75000,
      budgetTotal: 120000,
      progressPercentage: 68,
      completedMilestones: 8,
      totalMilestones: 12,
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-12-31'),
      galleryImages: 15
    });

    // Adicionar algumas atualizações
    this.addProjectUpdate('1', {
      date: new Date('2024-08-01'),
      title: 'Construção de 3 poços completada',
      description: 'Finalizamos a construção de 3 novos poços de água nas comunidades de Maputo.',
      type: 'milestone',
      images: ['/project-images/well1.jpg'],
      metrics: {
        peopleImpacted: 420,
        budgetSpent: 25000,
        progressPercentage: 25
      },
      author: 'João Silva',
      status: 'published'
    });

    // Adicionar imagens
    this.addProjectImage('1', {
      url: '/project-gallery/before-1.jpg',
      title: 'Situação inicial da comunidade',
      description: 'Estado das condições antes do projeto',
      category: 'before',
      featured: true,
      uploadDate: new Date('2024-01-20')
    });

    this.addProjectImage('1', {
      url: '/project-gallery/progress-1.jpg',
      title: 'Construção em andamento',
      description: 'Escavação do primeiro poço',
      category: 'progress',
      featured: true,
      uploadDate: new Date('2024-03-15')
    });

    // Projeto 2 - Educação Rural
    this.updateProjectMetrics('2', {
      peopleImpacted: 850,
      budgetUsed: 45000,
      budgetTotal: 80000,
      progressPercentage: 56,
      completedMilestones: 5,
      totalMilestones: 9,
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-11-30'),
      galleryImages: 12
    });
  }
}

// Hook React para usar o ProjectDataBridge
export const useProjectData = (projectId: string) => {
  const [data, setData] = useState(() => 
    ProjectDataBridge.getInstance().getProjectDetailData(projectId)
  );

  useEffect(() => {
    const bridge = ProjectDataBridge.getInstance();
    
    const unsubscribe = bridge.subscribe(projectId, (updateData) => {
      setData(bridge.getProjectDetailData(projectId));
    });

    return unsubscribe;
  }, [projectId]);

  const updateMetrics = (metrics: any) => {
    ProjectDataBridge.getInstance().updateProjectMetrics(projectId, metrics);
  };

  const addUpdate = (update: any) => {
    return ProjectDataBridge.getInstance().addProjectUpdate(projectId, update);
  };

  const addImage = (image: any) => {
    return ProjectDataBridge.getInstance().addProjectImage(projectId, image);
  };

  return {
    data,
    updateMetrics,
    addUpdate,
    addImage
  };
};

// Inicializar dados de exemplo
if (typeof window !== 'undefined') {
  ProjectDataBridge.getInstance().initializeSampleData();
}

export default ProjectDataBridge;
