// src/components/ProjectDataBridgeNew.tsx
import React from 'react';
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

// Tipos para os dados reais da API
export interface ProjectMetrics {
  id: number;
  project: number;
  people_impacted: number;
  budget_used: string;
  budget_total: string;
  progress_percentage: number;
  completed_milestones: number;
  total_milestones: number;
  start_date: string;
  end_date?: string;
  actual_end_date?: string;
  last_updated: string;
}

export interface ProjectUpdate {
  id: number;
  project: number;
  title: string;
  description: string;
  type: 'progress' | 'milestone' | 'issue' | 'achievement' | 'financial' | 'community';
  status: 'draft' | 'published' | 'archived';
  people_impacted?: number;
  budget_spent?: string;
  progress_percentage?: number;
  author: number;
  author_name?: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: number;
  project: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
  target_date: string;
  completed_date?: string;
  progress: number;
  order: number;
  dependencies: number[];
  created_at: string;
  updated_at: string;
}

export interface ProjectGalleryImage {
  id: number;
  project: number;
  image: string;
  title: string;
  description: string;
  category: 'before' | 'during' | 'after' | 'team' | 'community' | 'infrastructure' | 'other';
  featured: boolean;
  uploaded_by: number;
  uploaded_by_name?: string;
}

export interface ProjectEvidence {
  id: number;
  project: number;
  file: string;
  title: string;
  description: string;
  type: 'document' | 'image' | 'video' | 'report' | 'certificate' | 'other';
  uploaded_by: number;
  uploaded_by_name?: string;
  created_at?: string;
}

export interface ProjectTrackingData {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  metrics: ProjectMetrics;
  updates: ProjectUpdate[];
  milestones: ProjectMilestone[];
  gallery_images: ProjectGalleryImage[];
  evidence: ProjectEvidence[];
  total_updates: number;
  total_images: number;
  featured_images: ProjectGalleryImage[];
  recent_updates: ProjectUpdate[];
}

interface ProjectDataStore {
  projects: Map<string, ProjectTrackingData>;
  loading: Set<string>;
  errors: Map<string, string>;
  lastFetch: Map<string, number>;
  
  // Actions
  fetchProjectData: (slug: string, force?: boolean) => Promise<ProjectTrackingData | null>;
  updateProjectMetrics: (slug: string, metrics: Partial<ProjectMetrics>) => Promise<boolean>;
  addProjectUpdate: (slug: string, update: Omit<ProjectUpdate, 'id' | 'created_at' | 'updated_at' | 'project' | 'author' | 'author_name'>) => Promise<ProjectUpdate | null>;
  addProjectMilestone: (slug: string, milestone: Omit<ProjectMilestone, 'id' | 'created_at' | 'updated_at' | 'project'>) => Promise<ProjectMilestone | null>;
  addGalleryImage: (slug: string, imageData: FormData) => Promise<ProjectGalleryImage | null>;
  addProjectEvidence: (slug: string, evidenceData: FormData) => Promise<ProjectEvidence | null>;
  deleteProjectEvidence: (slug: string, evidenceId: number) => Promise<boolean>;
  toggleImageFeatured: (slug: string, imageId: number) => Promise<boolean>;
  completeMilestone: (slug: string, milestoneId: number) => Promise<boolean>;
  
  // Subscriptions
  subscribe: (slug: string, callback: (data: ProjectTrackingData) => void) => () => void;
  clearCache: (slug?: string) => void;
}

// Configuração da API
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || (
  process.env.NODE_ENV === 'production'
    ? 'https://api.moz-solidaria.org'
    : (typeof window !== 'undefined' && window.location ? window.location.origin : 'http://localhost:8000')
);

const API_ENDPOINTS = {
  projectTracking: (slug: string) => `${API_BASE_URL}/api/v1/tracking/project-tracking/${encodeURIComponent(slug)}/`,
  projectMetrics: (slug: string) => `${API_BASE_URL}/api/v1/tracking/projects/${encodeURIComponent(slug)}/metrics/`,
  projectUpdates: (slug: string) => `${API_BASE_URL}/api/v1/tracking/projects/${encodeURIComponent(slug)}/updates/`,
  projectMilestones: (slug: string) => `${API_BASE_URL}/api/v1/tracking/projects/${encodeURIComponent(slug)}/milestones/`,
  projectGallery: (slug: string) => `${API_BASE_URL}/api/v1/tracking/projects/${encodeURIComponent(slug)}/gallery/`,
  projectEvidence: (slug: string) => `${API_BASE_URL}/api/v1/tracking/projects/${encodeURIComponent(slug)}/evidence/`,
};

// Utilitário para fazer requisições autenticadas
async function apiRequest(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  const defaultHeaders: Record<string, string> = {};
  
  // Only add Content-Type for JSON requests
  if (options.body && typeof options.body === 'string') {
    defaultHeaders['Content-Type'] = 'application/json';
  }
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    // Se recebemos 401 e temos refresh token, tentar renovar
    if (response.status === 401 && refreshToken) {
      
      try {
        const refreshResponse = await fetch(`${API_BASE_URL}/api/v1/auth/token/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (refreshResponse.ok) {
          const newTokens = await refreshResponse.json();
          localStorage.setItem('authToken', newTokens.access);
          
          // Repetir requisição original com novo token
          const retryHeaders = {
            ...defaultHeaders,
            'Authorization': `Bearer ${newTokens.access}`,
            ...options.headers,
          };

          const retryResponse = await fetch(url, {
            ...options,
            headers: retryHeaders,
          });

          if (retryResponse.ok) {
            const retryData = await retryResponse.json();
            return retryData;
          } else {
            const retryErrorText = await retryResponse.text();
            throw new Error(`API Error (após renovação): ${retryResponse.status} ${retryResponse.statusText} - ${retryErrorText}`);
          }
        } else {
          // Limpar tokens inválidos
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('userData');
          throw new Error('Token expirado e não foi possível renovar. Faça login novamente.');
        }
      } catch (refreshError) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userData');
        throw new Error('Sessão expirada. Faça login novamente.');
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Para status 204 (No Content) ou métodos DELETE bem-sucedidos, não tentar parsear JSON
    if (response.status === 204 || (options.method === 'DELETE' && response.ok)) {
      return null; // ou return true, dependendo da sua preferência
    }

    // Verificar se há conteúdo para parsear
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return data;
    } else {
      // Se não é JSON, retornar texto
      const text = await response.text();
      return text;
    }
  } catch (error) {
    throw error;
  }
}

export const useProjectDataStore = create<ProjectDataStore>()(
  subscribeWithSelector((set, get) => ({
    projects: new Map(),
    loading: new Set(),
    errors: new Map(),
    lastFetch: new Map(),

    fetchProjectData: async (slug: string, force = false) => {
      const { projects, loading, lastFetch } = get();
      
      // Verificar cache (válido por 5 minutos)
      const lastFetchTime = lastFetch.get(slug) || 0;
      const cacheValidTime = 5 * 60 * 1000; // 5 minutos
      const isCacheValid = Date.now() - lastFetchTime < cacheValidTime;
      
      if (!force && isCacheValid && projects.has(slug)) {
        return projects.get(slug) || null;
      }
      
      if (loading.has(slug)) {
        return projects.get(slug) || null;
      }

      try {
        set(state => ({
          loading: new Set([...state.loading, slug]),
          errors: new Map([...state.errors.entries()].filter(([key]) => key !== slug))
        }));

        const data = await apiRequest(API_ENDPOINTS.projectTracking(slug));
        
        // Normalizar dados para garantir arrays válidos
        const normalizedData = {
          ...data,
          updates: Array.isArray(data.updates) ? data.updates : [],
          milestones: Array.isArray(data.milestones) ? data.milestones : [],
          gallery_images: Array.isArray(data.gallery_images) ? data.gallery_images : [],
          evidence: Array.isArray(data.evidence) ? data.evidence : [],
          featured_images: Array.isArray(data.featured_images) ? data.featured_images : [],
          recent_updates: Array.isArray(data.recent_updates) ? data.recent_updates : [],
        };
        
        set(state => ({
          projects: new Map([...state.projects, [slug, normalizedData]]),
          lastFetch: new Map([...state.lastFetch, [slug, Date.now()]]),
          loading: new Set([...state.loading].filter(s => s !== slug))
        }));

        return normalizedData;
      } catch (error) {
        set(state => ({
          errors: new Map([...state.errors, [slug, error instanceof Error ? error.message : 'Erro desconhecido']]),
          loading: new Set([...state.loading].filter(s => s !== slug))
        }));

        return null;
      }
    },

    updateProjectMetrics: async (slug: string, metrics: Partial<ProjectMetrics>) => {
      try {
        const currentData = get().projects.get(slug);
        if (!currentData) return false;

        const updatedMetrics = await apiRequest(
          `${API_ENDPOINTS.projectMetrics(slug)}${currentData.metrics.id}/`,
          {
            method: 'PATCH',
            body: JSON.stringify(metrics),
          }
        );

        set(state => {
          const newProjects = new Map(state.projects);
          const projectData = newProjects.get(slug) as ProjectTrackingData;
          if (projectData) {
            projectData.metrics = { ...projectData.metrics, ...updatedMetrics };
            newProjects.set(slug, projectData);
          }
          return { projects: newProjects };
        });

        return true;
      } catch (error) {
        return false;
      }
    },

    addProjectUpdate: async (slug: string, updateData) => {
      try {
        // Validate required fields
        if (!updateData.title || !updateData.description) {
          throw new Error('Título e descrição são obrigatórios');
        }

        // Clean and validate data
        const cleanUpdateData = {
          title: updateData.title.trim(),
          description: updateData.description.trim(),
          type: updateData.type || 'progress',
          status: updateData.status || 'published',
          ...(updateData.people_impacted && { people_impacted: Number(updateData.people_impacted) }),
          ...(updateData.budget_spent && { budget_spent: updateData.budget_spent.toString() }),
          ...(updateData.progress_percentage !== undefined && { progress_percentage: Number(updateData.progress_percentage) })
        };

        const newUpdate = await apiRequest(API_ENDPOINTS.projectUpdates(slug), {
          method: 'POST',
          body: JSON.stringify(cleanUpdateData),
        });

        // Ao invés de atualizar manualmente, forçar um refresh completo dos dados
        await get().fetchProjectData(slug, true);

        return newUpdate;
      } catch (error) {
        throw error;
      }
    },

    addProjectMilestone: async (slug: string, milestoneData) => {
      try {
        // Validate required fields
        if (!milestoneData.title || !milestoneData.description || !milestoneData.target_date) {
          throw new Error('Título, descrição e data alvo são obrigatórios');
        }

        // Clean and validate data
        const cleanMilestoneData = {
          title: milestoneData.title.trim(),
          description: milestoneData.description.trim(),
          target_date: milestoneData.target_date,
          status: milestoneData.status || 'pending',
          progress: milestoneData.progress || 0,
          order: milestoneData.order || 0,
        };

        const newMilestone = await apiRequest(API_ENDPOINTS.projectMilestones(slug), {
          method: 'POST',
          body: JSON.stringify(cleanMilestoneData),
        });

        // Atualizar dados do projeto
        await get().fetchProjectData(slug, true);

        return newMilestone;
      } catch (error) {
        throw error;
      }
    },

    addGalleryImage: async (slug: string, imageData: FormData) => {
      try {
        const response = await fetch(API_ENDPOINTS.projectGallery(slug), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: imageData,
        });

        if (!response.ok) {
          throw new Error('Erro ao fazer upload da imagem');
        }

        const newImage = await response.json();

        set(state => {
          const newProjects = new Map(state.projects);
          const projectData = newProjects.get(slug) as ProjectTrackingData;
          if (projectData) {
            // Garantir que gallery_images seja sempre um array
            const currentImages = Array.isArray(projectData.gallery_images) ? projectData.gallery_images : [];
            projectData.gallery_images = [newImage, ...currentImages];
            projectData.total_images = projectData.gallery_images.length;
            
            // Atualizar imagens em destaque se necessário
            if (newImage.featured) {
              const currentFeatured = Array.isArray(projectData.featured_images) ? projectData.featured_images : [];
              projectData.featured_images = projectData.gallery_images
                .filter(img => img.featured)
                .slice(0, 8);
            }
            
            newProjects.set(slug, projectData);
          }
          return { projects: newProjects };
        });

        return newImage;
      } catch (error) {
        return null;
      }
    },

    toggleImageFeatured: async (slug: string, imageId: number) => {
      try {
        const updatedImage = await apiRequest(
          `${API_ENDPOINTS.projectGallery(slug)}${imageId}/toggle-featured/`,
          { method: 'POST' }
        );

        set(state => {
          const newProjects = new Map(state.projects);
          const projectData = newProjects.get(slug) as ProjectTrackingData;
          if (projectData) {
            // Garantir que gallery_images seja sempre um array
            const currentImages = Array.isArray(projectData.gallery_images) ? projectData.gallery_images : [];
            projectData.gallery_images = currentImages.map(img =>
              img.id === imageId ? updatedImage : img
            );
            
            // Garantir que featured_images seja sempre um array
            projectData.featured_images = projectData.gallery_images
              .filter(img => img.featured)
              .slice(0, 8);
              
            newProjects.set(slug, projectData);
          }
          return { projects: newProjects };
        });

        return true;
      } catch (error) {
        return false;
      }
    },

    completeMilestone: async (slug: string, milestoneId: number) => {
      try {
        const updatedMilestone = await apiRequest(
          `${API_ENDPOINTS.projectMilestones(slug)}${milestoneId}/complete/`,
          { method: 'POST' }
        );

        set(state => {
          const newProjects = new Map(state.projects);
          const projectData = newProjects.get(slug) as ProjectTrackingData;
          if (projectData) {
            // Garantir que milestones seja sempre um array
            const currentMilestones = Array.isArray(projectData.milestones) ? projectData.milestones : [];
            projectData.milestones = currentMilestones.map(milestone =>
              milestone.id === milestoneId ? updatedMilestone : milestone
            );
            
            // Atualizar métricas relacionadas
            const completedCount = projectData.milestones.filter(m => m.status === 'completed').length;
            if (projectData.metrics) {
              projectData.metrics.completed_milestones = completedCount;
            }
            
            newProjects.set(slug, projectData);
          }
          return { projects: newProjects };
        });

        return true;
      } catch (error) {
        return false;
      }
    },

    addProjectEvidence: async (slug: string, evidenceData: FormData) => {
      try {
        const response = await fetch(API_ENDPOINTS.projectEvidence(slug), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          },
          body: evidenceData, // FormData para upload de arquivos
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Upload Error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const newEvidence = await response.json();

        // Atualizar dados do projeto
        await get().fetchProjectData(slug, true);

        return newEvidence;
      } catch (error) {
        throw error;
      }
    },

    deleteProjectEvidence: async (slug: string, evidenceId: number) => {
      try {
        await apiRequest(
          `${API_ENDPOINTS.projectEvidence(slug)}${evidenceId}/`,
          { method: 'DELETE' }
        );

        // Atualizar estado local removendo a evidência
        set(state => {
          const newProjects = new Map(state.projects);
          const projectData = newProjects.get(slug) as ProjectTrackingData;
          if (projectData) {
            // Garantir que evidence seja sempre um array
            const currentEvidence = Array.isArray(projectData.evidence) ? projectData.evidence : [];
            projectData.evidence = currentEvidence.filter(evidence => evidence.id !== evidenceId);
            newProjects.set(slug, projectData);
          }
          return { projects: newProjects };
        });

        return true;
      } catch (error) {
        // Verificar se é erro 404 (evidência já foi deletada)
        if (error instanceof Error && error.message.includes('404')) {
          // Mesmo assim, remover do estado local
          set(state => {
            const newProjects = new Map(state.projects);
            const projectData = newProjects.get(slug) as ProjectTrackingData;
            if (projectData) {
              const currentEvidence = Array.isArray(projectData.evidence) ? projectData.evidence : [];
              projectData.evidence = currentEvidence.filter(evidence => evidence.id !== evidenceId);
              newProjects.set(slug, projectData);
            }
            return { projects: newProjects };
          });
          
          return true; // Considerar como sucesso
        }
        
        throw error; // Re-lançar outros erros
      }
    },

    subscribe: (slug: string, callback: (data: ProjectTrackingData) => void) => {
      // We'll handle subscriptions in the hook instead
      return () => {};
    },

    clearCache: (slug?: string) => {
      if (slug) {
        set(state => {
          const newProjects = new Map(state.projects);
          const newLastFetch = new Map(state.lastFetch);
          const newErrors = new Map(state.errors);
          
          newProjects.delete(slug);
          newLastFetch.delete(slug);
          newErrors.delete(slug);
          
          return {
            projects: newProjects,
            lastFetch: newLastFetch,
            errors: newErrors
          };
        });
      } else {
        set({
          projects: new Map(),
          lastFetch: new Map(),
          errors: new Map(),
          loading: new Set()
        });
      }
    },
  }))
);

// Hook para usar dados de um projeto específico
export function useProjectData(slug: string, autoFetch = true) {
  const store = useProjectDataStore();
  
  const projectData = store.projects.get(slug);
  const isLoading = store.loading.has(slug);
  const error = store.errors.get(slug);
  
  // Auto-fetch na primeira montagem se não tiver dados
  React.useEffect(() => {
    if (autoFetch && !projectData && !isLoading) {
      store.fetchProjectData(slug);
    }
  }, [slug, autoFetch, projectData, isLoading, store]);
  
  return {
    data: projectData,
    isLoading,
    error,
    refetch: () => store.fetchProjectData(slug, true),
    updateMetrics: (metrics: Partial<ProjectMetrics>) => store.updateProjectMetrics(slug, metrics),
    addUpdate: (update: Omit<ProjectUpdate, 'id' | 'created_at' | 'updated_at'>) => store.addProjectUpdate(slug, update),
    addImage: (imageData: FormData) => store.addGalleryImage(slug, imageData),
    toggleImageFeatured: (imageId: number) => store.toggleImageFeatured(slug, imageId),
    completeMilestone: (milestoneId: number) => store.completeMilestone(slug, milestoneId),
  };
}

// Hook para subscription de mudanças
export function useProjectDataSubscription(slug: string, callback: (data: ProjectTrackingData) => void) {
  React.useEffect(() => {
    const unsubscribe = useProjectDataStore.subscribe(
      (state) => state.projects.get(slug),
      (data) => {
        if (data) {
          callback(data);
        }
      }
    );
    return unsubscribe;
  }, [slug, callback]);
}
