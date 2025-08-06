// src/lib/api.ts
// Serviço centralizado para requisições ao backend Django

import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Interface para tipo de Post
export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: any; // Objeto com dados do autor
  category: Category; // Objeto categoria ao invés de string
  tags?: any[];
  featured_image?: string;
  featured_image_caption?: string;
  featured_image_credit?: string;
  featured_image_source_url?: string;
  is_published: boolean;
  status: 'draft' | 'published' | 'archived';
  is_featured: boolean;
  
  // Campos SEO
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  focus_keyword?: string;
  
  // Open Graph / Redes Sociais
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: 'article' | 'website' | 'blog' | 'news';
  twitter_title?: string;
  twitter_description?: string;
  twitter_card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  
  // Schema.org
  schema_type?: string;
  
  // SEO Avançado
  noindex?: boolean;
  nofollow?: boolean;
  robots_txt?: string;
  hashtags?: string;
  
  // Análise de SEO
  seo_score?: number;
  readability_score?: number;
  views_count?: number;
  read_time?: number;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

// Interface para Projetos
export interface Project {
  id?: number;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  content: string;
  excerpt: string;
  program_id: string;
  category_id?: string;
  status: 'planning' | 'active' | 'completed' | 'suspended';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location: string;
  district: string;
  province: string;
  start_date?: string;
  end_date?: string;
  target_beneficiaries: number;
  target_budget: number;
  manager_id: string;
  team_members: string[];
  tags: string[];
  is_featured: boolean;
  is_public: boolean;
  featured_on_homepage: boolean;
  featured_image?: string | File;
  project_document?: string | File;
  meta_description: string;
  created_at?: string;
  updated_at?: string;
}

// Funções de leitura
export async function fetchPosts() {
  const res = await fetch(`${API_BASE}/blog/posts/`);
  if (!res.ok) throw new Error('Erro ao buscar posts');
  const data = await res.json();
  // The API returns paginated data with 'results' array
  return data.results || data;
}

export async function fetchPostDetail(slug: string) {
  const res = await fetch(`${API_BASE}/blog/posts/${slug}/`);
  if (!res.ok) throw new Error('Erro ao buscar post');
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/blog/categories/`);
  
  if (!res.ok) {
    const errorData = await res.text();
    console.error('Erro ao buscar categorias:', res.status, errorData);
    throw new Error(`Erro ao buscar categorias: ${res.status} - ${errorData}`);
  }
  
  const data = await res.json();
  
  // The API returns paginated data with 'results' array
  return data.results || data;
}

export async function fetchTags() {
  const res = await fetch(`${API_BASE}/blog/tags/`);
  if (!res.ok) throw new Error('Erro ao buscar tags');
  return res.json();
}

// Funções de autenticação
export async function login(username: string, password: string) {
  console.log('🔑 API Login - Tentando autenticação JWT para:', username);
  
  const res = await fetch(`${API_BASE}/auth/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Credenciais inválidas: ${errorText}`);
  }
  
  const data = await res.json();
  
  // Buscar dados do usuário
  const userRes = await fetch(`${API_BASE}/auth/user/`, {
    headers: {
      'Authorization': `Bearer ${data.access}`,
      'Content-Type': 'application/json',
    },
  });
  
  let userData;
  if (userRes.ok) {
    userData = await userRes.json();
  } else {
    // Fallback para dados básicos
    userData = {
      id: 1,
      username: username,
      is_staff: true,
      is_superuser: false
    };
  }
  
  return {
    token: data.access,
    refresh: data.refresh,
    user: userData
  };
}

export async function refreshToken(refreshToken: string) {
  const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });
  if (!res.ok) throw new Error('Token inválido');
  return res.json();
}

// Buscar dados do usuário autenticado
export async function fetchUserProfile() {
  const res = await fetch(`${API_BASE}/auth/user/`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao buscar perfil do usuário');
  return res.json();
}

// Funções CRUD para Posts (com autenticação)
function getAuthHeaders(includeContentType: boolean = true) {
  const token = localStorage.getItem('authToken');
  const headers: any = {};
  
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

// Função utilitária para verificar se o usuário está autenticado
export function isAuthenticated(): boolean {
  const token = localStorage.getItem('authToken');
  return token !== null && token !== undefined && token.trim() !== '';
}

export async function createPost(postData: any) {
  // Se featured_image for File, envie como FormData
  let isFile = postData.featured_image instanceof File;
  let res;

  if (isFile) {
    const formData = new FormData();
    Object.entries(postData).forEach(([key, value]) => {
      if (key === "tags" && Array.isArray(value)) {
        value.forEach((tag: any) => formData.append("tags", tag));
      } else if (value !== undefined && value !== null) {
        if (value instanceof Blob) {
          formData.append(key, value);
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    // Usar headers de autenticação sem Content-Type para FormData
    const authHeaders = getAuthHeaders(false);
    
    res = await fetch(`${API_BASE}/blog/posts/`, {
      method: 'POST',
      headers: authHeaders,
      body: formData,
    });
  } else {
    res = await fetch(`${API_BASE}/blog/posts/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(postData),
    });
  }

  if (!res.ok) {
    const errorData = await res.text();
    console.error('API Error Response:', errorData);
    throw new Error(`Erro ao criar post: ${res.status} - ${errorData}`);
  }

  return res.json();
}

export async function updatePost(slug: string, postData: any) {
  const res = await fetch(`${API_BASE}/blog/posts/${slug}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(postData),
  });
  
  if (!res.ok) {
    const errorData = await res.text();
    console.error('API Error Response:', errorData);
    throw new Error(`Erro ao atualizar post: ${res.status} - ${errorData}`);
  }
  
  return res.json();
}

export async function deletePost(slug: string) {
  const res = await fetch(`${API_BASE}/blog/posts/${slug}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao deletar post');
}

// Funções CRUD para Categorias
export async function createCategory(categoryData: Partial<Category>) {
  const res = await fetch(`${API_BASE}/blog/categories/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(categoryData),
  });
  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Erro ao criar categoria: ${res.status} - ${errorData}`);
  }
  return res.json();
}

export async function updateCategory(id: number, categoryData: Partial<Category>) {
  const res = await fetch(`${API_BASE}/blog/categories/${id}/`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(categoryData),
  });
  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Erro ao atualizar categoria: ${res.status} - ${errorData}`);
  }
  return res.json();
}

export async function deleteCategory(id: number) {
  const res = await fetch(`${API_BASE}/blog/categories/${id}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Erro ao deletar categoria: ${res.status} - ${errorData}`);
  }
}

// ============ FUNÇÕES CRUD PARA PROJETOS ============

// Buscar todos os projetos (admin - requer autenticação)
export async function fetchAdminProjects() {
  const res = await fetch(`${API_BASE}/projects/admin/projects/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao buscar projetos administrativos');
  const data = await res.json();
  return data.results || data;
}

// Buscar todos os projetos com fallback inteligente
export async function fetchProjects() {
  try {
    // Se autenticado, tentar API admin primeiro
    if (isAuthenticated()) {
      return await fetchAdminProjects();
    } else {
      // Se não autenticado, usar API pública
      return await fetchPublicProjects();
    }
  } catch (error) {
    // Se API admin falhar, tentar API pública como fallback
    console.warn('API admin falhou, tentando API pública:', error);
    return await fetchPublicProjects();
  }
}

// Buscar projetos públicos
export async function fetchPublicProjects() {
  const res = await fetch(`${API_BASE}/projects/public/projects/`);
  if (!res.ok) throw new Error('Erro ao buscar projetos públicos');
  const data = await res.json();
  return data.results || data;
}

// Buscar detalhes de um projeto por slug
export async function fetchProjectDetail(slug: string) {
  try {
    console.log('🔍 API - Buscando projeto com slug:', slug);
    
    // Estratégia 1: Tentar buscar via API pública por slug
    try {
      const res = await fetch(`${API_BASE}/projects/public/projects/?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        const results = data.results || data;
        
        if (Array.isArray(results) && results.length > 0) {
          console.log('✅ API - Projeto encontrado via busca por slug:', results[0]);
          return results[0];
        }
      }
    } catch (error) {
      console.warn('⚠️ API - Falha na busca por slug:', error);
    }

    // Estratégia 2: Tentar buscar diretamente por slug como endpoint
    try {
      const res = await fetch(`${API_BASE}/projects/public/projects/${slug}/`);
      if (res.ok) {
        const projectData = await res.json();
        console.log('✅ API - Projeto encontrado via endpoint direto:', projectData);
        return projectData;
      }
    } catch (error) {
      console.warn('⚠️ API - Falha no endpoint direto:', error);
    }

    // Estratégia 3: Buscar em todos os projetos e filtrar por slug
    try {
      const allProjects = await fetchPublicProjects();
      const project = allProjects.find((p: any) => p.slug === slug);
      if (project) {
        console.log('✅ API - Projeto encontrado na lista completa:', project);
        return project;
      }
    } catch (error) {
      console.warn('⚠️ API - Falha ao buscar na lista completa:', error);
    }

    // Estratégia 4: Tentar sistema de tracking como fallback
    try {
      const trackingRes = await fetch(`${API_BASE}/tracking/project-tracking/?search=${slug}`);
      if (trackingRes.ok) {
        const trackingData = await trackingRes.json();
        if (trackingData.results && trackingData.results.length > 0) {
          const project = trackingData.results.find((p: any) => p.slug === slug);
          if (project) {
            console.log('✅ API - Projeto encontrado no sistema de tracking:', project);
            return project;
          }
        }
      }
    } catch (trackingError) {
      console.warn('⚠️ API - Falha no sistema de tracking:', trackingError);
    }

    // Se chegou até aqui, não encontrou o projeto
    console.error('❌ API - Projeto não encontrado em nenhuma fonte:', slug);
    
    // Retornar dados mock como último recurso se for um slug conhecido
    const knownSlugs = [
      'reconstrucao-escola-nangade',
      'distribuicao-cestas-basicas', 
      'formacao-marcenaria',
      'campanha-vacinacao',
      'construcao-poco-agua',
      'apoio-psicologico-mulheres'
    ];

    if (knownSlugs.includes(slug)) {
      console.log('🔄 API - Retornando dados mock para slug conhecido:', slug);
      return generateMockProject(slug);
    }

    throw new Error(`Projeto com slug "${slug}" não encontrado`);
    
  } catch (error) {
    console.error('❌ API - Erro geral ao buscar projeto:', error);
    throw error;
  }
}

// Função auxiliar para gerar projeto mock baseado no slug
function generateMockProject(slug: string) {
  const mockProjects: { [key: string]: any } = {
    'reconstrucao-escola-nangade': {
      id: 1,
      name: "Reconstrução da Escola Primária de Nangade",
      slug: "reconstrucao-escola-nangade",
      description: "Projeto completo de reconstrução da escola primária com novas salas de aula, biblioteca e laboratório de informática.",
      short_description: "Reconstrução completa da escola primária beneficiando 300+ crianças.",
      content: "<p>Este projeto visa a reconstrução completa da escola primária de Nangade, que foi danificada durante os conflitos na região. O projeto inclui a construção de 6 novas salas de aula, uma biblioteca moderna, laboratório de informática e infraestrutura de saneamento.</p><p>A escola atenderá mais de 300 crianças da comunidade local, proporcionando um ambiente seguro e adequado para o aprendizado.</p>",
      excerpt: "Reconstrução completa da escola primária beneficiando 300+ crianças com novas salas, biblioteca e laboratório.",
      program: {
        id: 1,
        name: "Educação",
        color: "blue"
      },
      status: "active",
      priority: "high",
      progress_percentage: 75,
      location: "Nangade, Cabo Delgado",
      district: "Nangade",
      province: "Cabo Delgado",
      start_date: "2025-01-15",
      end_date: "2025-08-30",
      target_beneficiaries: 300,
      current_beneficiaries: 200,
      target_budget: 50000,
      current_spending: 37500,
      featured_image: "https://images.unsplash.com/photo-1661345665867-63e6b12b774a?q=80&w=735&auto=format&fit=crop",
      gallery_images: [
        "https://images.unsplash.com/photo-1661345665867-63e6b12b774a?q=80&w=735&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1497486751825-1233686d5d80?q=80&w=735&auto=format&fit=crop"
      ],
      is_featured: true,
      is_public: true,
      tags: ["educação", "infraestrutura", "reconstrução", "crianças"],
      meta_description: "Projeto de reconstrução da escola primária de Nangade em Cabo Delgado, beneficiando mais de 300 crianças da comunidade local.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updates: []
    },
    'distribuicao-cestas-basicas': {
      id: 2,
      name: "Distribuição de Cestas Básicas",
      slug: "distribuicao-cestas-basicas",
      description: "Programa contínuo de distribuição de cestas básicas para famílias em vulnerabilidade social.",
      short_description: "Apoio alimentar mensal para 150 famílias deslocadas.",
      content: "<p>Este programa oferece apoio alimentar essencial para famílias deslocadas em Mocímboa da Praia. Cada cesta básica contém alimentos suficientes para uma família de 5 pessoas por um mês.</p>",
      excerpt: "Apoio alimentar mensal para 150 famílias deslocadas em situação de vulnerabilidade social.",
      program: {
        id: 2,
        name: "Apoio Humanitário",
        color: "red"
      },
      status: "active",
      priority: "urgent",
      progress_percentage: 40,
      location: "Mocímboa da Praia",
      district: "Mocímboa da Praia",
      province: "Cabo Delgado",
      start_date: "2025-02-01",
      target_beneficiaries: 150,
      current_beneficiaries: 60,
      target_budget: 25000,
      current_spending: 10000,
      featured_image: "https://images.unsplash.com/photo-1694286080449-8b142ef76d6d?q=80&w=1170&auto=format&fit=crop",
      is_featured: false,
      is_public: true,
      tags: ["alimentação", "famílias", "apoio humanitário"],
      meta_description: "Programa de distribuição de cestas básicas para famílias deslocadas em Mocímboa da Praia.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updates: []
    }
    // Adicione outros projetos mock conforme necessário
  };

  return mockProjects[slug] || mockProjects['reconstrucao-escola-nangade'];
}

// Funções CRUD para Projetos
export async function createProject(postData: any) {
  const isFormData = postData instanceof FormData;
  
  // Debug log detalhado
  if (isFormData) {
    console.log('📤 Enviando FormData para API:');
    for (let [key, value] of postData.entries()) {
      console.log(`  ${key}:`, value);
    }
  } else {
    console.log('📤 Enviando JSON para API:', postData);
  }
  
  const res = await fetch(`${API_BASE}/projects/admin/projects/`, {
    method: 'POST',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: isFormData ? postData : JSON.stringify(postData),
  });
  
  if (!res.ok) {
    const errorData = await res.text();
    console.error('❌ Erro da API:', {
      status: res.status,
      statusText: res.statusText,
      error: errorData
    });
    throw new Error(`Erro ao criar projeto: ${res.status} - ${errorData}`);
  }
  
  return res.json();
}

export async function updateProject(id: number, postData: any) {
  const isFormData = postData instanceof FormData;
  
  const res = await fetch(`${API_BASE}/projects/admin/projects/${id}/`, {
    method: 'PUT',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
    body: isFormData ? postData : JSON.stringify(postData),
  });
  
  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Erro ao atualizar projeto: ${res.status} - ${errorData}`);
  }
  
  return res.json();
}

export async function deleteProject(id: number) {
  const res = await fetch(`${API_BASE}/projects/admin/projects/${id}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    },
  });
  
  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Erro ao deletar projeto: ${res.status} - ${errorData}`);
  }
}

// Buscar programas disponíveis
export async function fetchPrograms() {
  try {
    const res = await fetch(`${API_BASE}/core/programs/`);
    if (!res.ok) throw new Error('Endpoint não encontrado');
    const data = await res.json();
    return data.results || data;
  } catch (error) {
    // Fallback para dados mock se endpoint não existir
    console.warn('Usando dados mock para programas:', error);
    return [
      { id: 1, name: 'Educação' },
      { id: 2, name: 'Apoio Humanitário' },
      { id: 3, name: 'Formação Juvenil' },
      { id: 4, name: 'Saúde Pública' },
      { id: 5, name: 'Infraestrutura' }
    ];
  }
}

// Buscar usuários/responsáveis disponíveis (requer autenticação)
export async function fetchProjectManagers() {
  try {
    const res = await fetch(`${API_BASE}/auth/users/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Endpoint não encontrado');
    const data = await res.json();
    return data.results || data;
  } catch (error) {
    // Fallback para dados mock se endpoint não existir
    console.warn('Usando dados mock para gestores:', error);
    return [
      { id: 1, username: 'admin', full_name: 'Administrador Principal' },
      { id: 2, username: 'coordinator', full_name: 'Coordenador de Projetos' },
      { id: 3, username: 'manager', full_name: 'Gestor de Campo' }
    ];
  }
}

// Newsletter
export async function subscribeNewsletter(email: string) {
  const res = await fetch(`${API_BASE}/blog/newsletter/subscribe/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error('Erro ao inscrever no newsletter');
  return res.json();
}

// Upload de imagem
export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('image', file);

  // Usar headers de autenticação sem Content-Type para FormData
  const authHeaders = getAuthHeaders(false);

  const res = await fetch(`${API_BASE}/blog/upload/image/`, {
    method: 'POST',
    headers: authHeaders,
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.text();
    console.error('Upload Error Response:', errorData);
    throw new Error(`Erro no upload da imagem: ${res.status} - ${errorData}`);
  }

  const data = await res.json();
  return data.url;
}

export async function duplicatePost(slug: string) {
  const res = await fetch(`${API_BASE}/blog/posts/${slug}/duplicate/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    const errorData = await res.text();
    console.error('API Error Response:', errorData);
    throw new Error(`Erro ao duplicar post: ${res.status} - ${errorData}`);
  }
  
  return res.json();
}

// Interface para comentários
export interface Comment {
  id: number;
  content: string;
  author_name: string;
  author_email: string;
  user?: {
    id: number;
    username: string;
  };
  post: {
    id: number;
    title: string;
    slug: string;
  };
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

// Gestão de comentários (admin)
export async function fetchComments(params?: {
  status?: 'all' | 'approved' | 'pending';
  page?: number;
  search?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.status && params.status !== 'all') {
    queryParams.append('is_approved', params.status === 'approved' ? 'true' : 'false');
  }
  if (params?.page) {
    queryParams.append('page', params.page.toString());
  }
  if (params?.search) {
    queryParams.append('search', params.search);
  }

  const url = `${API_BASE}/blog/admin/comments/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    throw new Error('Erro ao buscar comentários');
  }
  
  return res.json();
}

export async function approveComment(commentId: number) {
  const res = await fetch(`${API_BASE}/blog/admin/comments/${commentId}/approve/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    throw new Error('Erro ao aprovar comentário');
  }
  
  return res.json();
}

export async function rejectComment(commentId: number) {
  const res = await fetch(`${API_BASE}/blog/admin/comments/${commentId}/reject/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    throw new Error('Erro ao rejeitar comentário');
  }
  
  return res.json();
}

export async function deleteComment(commentId: number) {
  const res = await fetch(`${API_BASE}/blog/admin/comments/${commentId}/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    throw new Error('Erro ao deletar comentário');
  }
  
  return res.status === 204;
}

export async function bulkCommentAction(action: 'approve' | 'reject' | 'delete', commentIds: number[]) {
  const res = await fetch(`${API_BASE}/blog/admin/comments/bulk_action/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      action,
      comment_ids: commentIds
    }),
  });
  
  if (!res.ok) {
    throw new Error(`Erro ao executar ação em massa: ${action}`);
  }
  
  return res.json();
}

// Instância axios para uso direto nos componentes
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken'); // Corrigido para usar 'authToken'
      localStorage.removeItem('refreshToken'); // Corrigido para usar 'refreshToken'
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// === PROJECT DETAILS API FUNCTIONS ===

// Buscar atualizações do projeto (via endpoint público se disponível)
export async function fetchProjectUpdates(projectId: string | number) {
  try {
    // Primeiro tenta endpoint público
    let res = await fetch(`${API_BASE}/projects/public/projects/${projectId}/updates/`);
    if (!res.ok) {
      // Fallback para endpoint administrativo
      res = await fetch(`${API_BASE}/projects/admin/projects/${projectId}/updates/`);
    }
    if (!res.ok) {
      console.warn(`Updates endpoint not found for project ${projectId}`);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.warn('Erro ao buscar atualizações do projeto:', error);
    return [];
  }
}

// Buscar evidências/documentos do projeto (via endpoint público se disponível)
export async function fetchProjectEvidences(projectId: string | number) {
  try {
    // Primeiro tenta endpoint público
    let res = await fetch(`${API_BASE}/projects/public/projects/${projectId}/evidences/`);
    if (!res.ok) {
      // Fallback para endpoint administrativo
      res = await fetch(`${API_BASE}/projects/admin/projects/${projectId}/evidences/`);
    }
    if (!res.ok) {
      console.warn(`Evidences endpoint not found for project ${projectId}`);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.warn('Erro ao buscar evidências do projeto:', error);
    return [];
  }
}

// Buscar galeria de imagens do projeto (via endpoint público se disponível)
export async function fetchProjectGallery(projectId: string | number) {
  try {
    // Primeiro tenta endpoint público
    let res = await fetch(`${API_BASE}/projects/public/projects/${projectId}/gallery/`);
    if (!res.ok) {
      // Fallback para endpoint administrativo
      res = await fetch(`${API_BASE}/projects/admin/projects/${projectId}/gallery/`);
    }
    if (!res.ok) {
      console.warn(`Gallery endpoint not found for project ${projectId}`);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.warn('Erro ao buscar galeria do projeto:', error);
    return [];
  }
}

// Buscar marcos/milestones do projeto (via endpoint público se disponível)
export async function fetchProjectMilestones(projectId: string | number) {
  try {
    // Primeiro tenta endpoint público
    let res = await fetch(`${API_BASE}/projects/public/projects/${projectId}/milestones/`);
    if (!res.ok) {
      // Fallback para endpoint administrativo
      res = await fetch(`${API_BASE}/projects/admin/projects/${projectId}/milestones/`);
    }
    if (!res.ok) {
      console.warn(`Milestones endpoint not found for project ${projectId}`);
      return [];
    }
    return await res.json();
  } catch (error) {
    console.warn('Erro ao buscar marcos do projeto:', error);
    return [];
  }
}

// Buscar métricas detalhadas do projeto (via endpoint público se disponível)
export async function fetchProjectMetrics(projectId: string | number) {
  try {
    // Primeiro tenta endpoint público
    let res = await fetch(`${API_BASE}/projects/public/projects/${projectId}/metrics/`);
    if (!res.ok) {
      // Fallback para endpoint administrativo
      res = await fetch(`${API_BASE}/projects/admin/projects/${projectId}/metrics/`);
    }
    if (!res.ok) {
      console.warn(`Metrics endpoint not found for project ${projectId}`);
      return {
        peopleImpacted: 0,
        budgetUsed: 0,
        budgetTotal: 0,
        progressPercentage: 0,
        completedMilestones: 0,
        totalMilestones: 0,
        lastUpdate: null
      };
    }
    return await res.json();
  } catch (error) {
    console.warn('Erro ao buscar métricas do projeto:', error);
    return {
      peopleImpacted: 0,
      budgetUsed: 0,
      budgetTotal: 0,
      progressPercentage: 0,
      completedMilestones: 0,
      totalMilestones: 0,
      lastUpdate: null
    };
  }
}

// Buscar dados completos do projeto para exibição pública
export async function fetchCompleteProjectData(slug: string) {
  try {
    console.log('🔍 Buscando dados completos do projeto:', slug);
    
    // Tentar buscar dados do sistema de tracking primeiro (dados mais completos e atualizados)
    let trackingData = null;
    try {
      console.log('� Tentando buscar dados de tracking...');
      const trackingResponse = await fetch(`${API_BASE}/tracking/project-tracking/${slug}/`);
      if (trackingResponse.ok) {
        trackingData = await trackingResponse.json();
        console.log('✅ Dados de tracking carregados:', trackingData);
        
        // Log específico das métricas
        if (trackingData?.metrics) {
          console.log('🔢 Métricas do tracking encontradas:', {
            people_impacted: trackingData.metrics.people_impacted,
            progress_percentage: trackingData.metrics.progress_percentage,
            completed_milestones: trackingData.metrics.completed_milestones,
            total_milestones: trackingData.metrics.total_milestones
          });
          
          // Buscar dados básicos para completar campos que podem estar faltando no tracking
          console.log('📋 Buscando dados básicos para complementar...');
          const basicProject = await fetchProjectDetail(slug);
          
          // Se tracking tem dados completos, usar diretamente mas complementar com dados básicos
          const completeData = {
            ...trackingData,
            // Preservar campos importantes dos dados básicos que podem não estar no tracking
            target_beneficiaries: trackingData.target_beneficiaries || basicProject.target_beneficiaries,
            budget: trackingData.budget || basicProject.budget,
            raised_amount: trackingData.raised_amount || basicProject.raised_amount,
            funding_percentage: trackingData.funding_percentage || basicProject.funding_percentage,
            featured_image: trackingData.featured_image || basicProject.featured_image,
            image: trackingData.image || basicProject.image,
            // Normalizar métricas para o formato esperado pelo frontend
            metrics: {
              peopleImpacted: trackingData.metrics.people_impacted,
              budgetUsed: parseFloat(trackingData.metrics.budget_used || '0'),
              budgetTotal: parseFloat(trackingData.metrics.budget_total || '0'),
              progressPercentage: trackingData.metrics.progress_percentage,
              completedMilestones: trackingData.metrics.completed_milestones,
              totalMilestones: trackingData.metrics.total_milestones,
              lastUpdate: trackingData.metrics.last_updated
            },
            // Atualizar campos do projeto com dados do tracking
            current_beneficiaries: trackingData.metrics.people_impacted,
            progress_percentage: trackingData.metrics.progress_percentage
          };
          
          console.log('✅ Dados completos processados do tracking:', {
            project: completeData.name,
            target_beneficiaries: completeData.target_beneficiaries,
            featured_image: completeData.featured_image,
            gallery_images_count: completeData.gallery_images?.length || 0,
            peopleImpacted: completeData.metrics.peopleImpacted,
            progressPercentage: completeData.metrics.progressPercentage,
            completedMilestones: completeData.metrics.completedMilestones,
            totalMilestones: completeData.metrics.totalMilestones
          });
          
          return completeData;
        } else {
          console.warn('⚠️ TrackingData existe mas sem métricas:', Object.keys(trackingData || {}));
        }
      } else {
        console.warn('⚠️ Resposta de tracking não ok:', trackingResponse.status);
      }
    } catch (error) {
      console.warn('⚠️ Dados de tracking não disponíveis:', error);
    }

    // Fallback: Buscar dados básicos do projeto se tracking falhou
    console.log('📋 Fallback: Buscando dados básicos do projeto...');
    const project = await fetchProjectDetail(slug);
    
    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    console.log('📦 Dados básicos do projeto carregados:', project);

    // Tentar buscar dados complementares (opcional, não bloqueia se não existir)
    const [updates, evidences, gallery, milestones, metrics] = await Promise.allSettled([
      fetchProjectUpdates(project.id),
      fetchProjectEvidences(project.id),
      fetchProjectGallery(project.id),
      fetchProjectMilestones(project.id),
      fetchProjectMetrics(project.id)
    ]);

    // Processar resultados (sempre retorna array vazio se falhar)
    const completeData = {
      ...project,
      updates: updates.status === 'fulfilled' ? updates.value : [],
      evidences: evidences.status === 'fulfilled' ? evidences.value : [],
      gallery_images: gallery.status === 'fulfilled' ? gallery.value : [],
      milestones: milestones.status === 'fulfilled' ? milestones.value : [],
      metrics: metrics.status === 'fulfilled' ? metrics.value : {
        // Usar dados básicos do projeto
        peopleImpacted: project.current_beneficiaries ?? 0,
        budgetUsed: project.current_spending ?? 0,
        budgetTotal: project.target_budget ?? 0,
        progressPercentage: project.progress_percentage ?? 0,
        completedMilestones: 0,
        totalMilestones: 0,
        lastUpdate: project.updated_at ?? null
      }
    };

    console.log('📊 Dados básicos processados (fallback):', {
      project: completeData.name,
      peopleImpacted: completeData.metrics.peopleImpacted,
      progressPercentage: completeData.metrics.progressPercentage,
      source: 'project_basic'
    });

    return completeData;
    
  } catch (error) {
    console.error('❌ Erro ao buscar dados completos:', error);
    throw error;
  }
}
