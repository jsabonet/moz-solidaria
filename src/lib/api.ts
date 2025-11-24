// src/lib/api.ts
// Serviço centralizado para requisições ao backend Django

import axios from 'axios';
import { a } from 'vitest/dist/chunks/suite.d.FvehnV49.js';
import { API_BASE } from './config';

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
  likes_count?: number;
  comments_count?: number;
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
export async function fetchPosts(query?: string) {
  const url = query && query.trim()
    ? `${API_BASE}/blog/posts/?search=${encodeURIComponent(query.trim())}`
    : `${API_BASE}/blog/posts/`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erro ao buscar posts');
  const data = await res.json();
  // The API returns paginated data with 'results' array
  return data.results || data;
}

// Buscar TODOS os posts (todas as páginas)
export async function fetchAllPosts() {
  let allPosts: BlogPost[] = [];
  let nextUrl: string | null = `${API_BASE}/blog/posts/`;
  
  while (nextUrl) {
    // Garantir que a URL sempre use HTTPS em produção
    if (nextUrl.startsWith('http://') && window.location.protocol === 'https:') {
      nextUrl = nextUrl.replace('http://', 'https://');
    }
    
    const res = await fetch(nextUrl);
    if (!res.ok) throw new Error('Erro ao buscar posts');
    const data = await res.json();
    
    // Adicionar posts da página atual
    const posts = data.results || data;
    allPosts = [...allPosts, ...posts];
    
    // Verificar se há próxima página e forçar HTTPS se necessário
    nextUrl = data.next || null;
    if (nextUrl && nextUrl.startsWith('http://') && window.location.protocol === 'https:') {
      nextUrl = nextUrl.replace('http://', 'https://');
    }
  }
  
  return allPosts;
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
    throw new Error(`Erro ao buscar categorias: ${res.status} - ${errorData}`);
  }
  
  const data = await res.json();
  
  // The API returns paginated data with 'results' array
  return data.results || data;
}

// Buscar uma categoria de blog específica por ID
export async function fetchBlogCategoryById(id: number) {
  const res = await fetch(`${API_BASE}/blog/categories/${id}/`);
  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Erro ao buscar categoria do blog: ${res.status} - ${errorData}`);
  }
  return res.json();
}

// Buscar categorias específicas de Projetos (não confundir com categorias de Blog)
export async function fetchProjectCategories() {
  // Tentar múltiplos endpoints possíveis no backend
  const tryEndpoints = async () => {
    const endpoints = [
      `${API_BASE}/projects/admin/categories/`,
      `${API_BASE}/projects/public/categories/`,
      `${API_BASE}/projects/categories/`
    ];

    for (const url of endpoints) {
      try {
        // Usar authFetch para incluir Authorization quando disponível
        const res = await authFetch(url);
        if (res.ok) {
          const data = await res.json();
          const list = (data && Array.isArray(data)) ? data : (data?.results || []);
          if (Array.isArray(list) && list.length >= 0) {
            return list.map((c: any) => ({ id: c.id, name: c.name, slug: c.slug }));
          }
        }
      } catch (e) {
        // Continua tentando próximos endpoints
      }
    }
    return null;
  };

  // 1) Endpoints dedicados
  const direct = await tryEndpoints();
  if (direct) return direct;

  // 2) Fallback: extrair categorias a partir dos projetos públicos
  try {
    const projects = await fetchPublicProjects();
    const map = new Map<number, { id: number; name: string }>();
    projects.forEach((p: any) => {
      if (p.category && p.category.id) {
        map.set(p.category.id, { id: p.category.id, name: p.category.name });
      }
    });
    const arr = Array.from(map.values());
    if (arr.length > 0) return arr;
  } catch (e) {
    // Fallback falhou
  }

  // 3) Sem categorias disponíveis
  return [];
}

export async function fetchTags() {
  const res = await fetch(`${API_BASE}/blog/tags/`);
  if (!res.ok) throw new Error('Erro ao buscar tags');
  return res.json();
}

// Funções de autenticação
export async function login(username: string, password: string) {
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

// Helper centralizado para requisições autenticadas com refresh automático
async function authFetch(url: string, options: RequestInit = {}, allowRefresh: boolean = true): Promise<Response> {
  const token = localStorage.getItem('authToken');
  const refresh = localStorage.getItem('refreshToken');

  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  // Não sobrescrever Content-Type se for FormData
  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response = await fetch(url, { ...options, headers });

  // Se não autorizado e temos refresh token, tentar renovar
  if (response.status === 401 && allowRefresh && refresh) {
    try {
      const refreshRes = await fetch(`${API_BASE}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        if (data.access) {
          localStorage.setItem('authToken', data.access);
          // Tentar novamente a requisição original com novo token
          const retryHeaders = new Headers(headers);
            retryHeaders.set('Authorization', `Bearer ${data.access}`);
          response = await fetch(url, { ...options, headers: retryHeaders });
        }
      } else {
        // Refresh falhou => limpar session
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
      }
    } catch (e) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
    }
  }

  // Se ainda 401 após tentativa de refresh, redirecionar para login (fluxo dashboard)
  if (response.status === 401) {
    // Não autorizado
  }

  return response;
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
  const res = await authFetch(`${API_BASE}/projects/admin/projects/`);
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

// Buscar categorias de projeto (admin) com dados completos
export async function fetchProjectCategoriesAdmin(): Promise<any[]> {
  const res = await authFetch(`${API_BASE}/projects/admin/categories/`);
  if (!res.ok) return [];
  const data = await res.json();
  const list = (Array.isArray(data) ? data : (data?.results || [])) as any[];
  return list;
}

// Criar categoria de projeto
export async function createProjectCategory(payload: {
  name: string;
  program_id: number;
  description?: string;
  color?: string;
  icon?: string;
  is_active?: boolean;
  order?: number;
}): Promise<any> {
  const res = await authFetch(`${API_BASE}/projects/admin/categories/`, {
    method: 'POST',
    body: JSON.stringify({
      name: payload.name,
      program_id: payload.program_id,
      description: payload.description || '',
      color: payload.color || 'blue',
      icon: payload.icon || '',
      is_active: payload.is_active ?? true,
      order: payload.order ?? 0,
    }),
  });
  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Erro ao criar categoria de projeto: ${res.status} - ${errorData}`);
  }
  return res.json();
}

// Garante que exista uma ProjectCategory para o programa com o mesmo nome/slug da categoria do blog
export async function ensureProjectCategoryForBlogCategory(programId: number, blogCategoryId: number): Promise<number | null> {
  // 1) Obter dados da categoria do blog
  const blogCat = await fetchBlogCategoryById(blogCategoryId);
  const targetName: string = blogCat?.name || '';
  const targetSlug: string = blogCat?.slug || '';
  if (!targetName) return null;

  // 2) Verificar se já existe uma ProjectCategory no programa com mesmo slug/nome
  try {
    const projCats = await fetchProjectCategoriesAdmin();
    const found = projCats.find((c: any) => {
      const progId = c.program?.id || c.program_id;
      const sameProgram = Number(progId) === Number(programId);
      const sameSlug = (c.slug || '').toLowerCase() === (targetSlug || '').toLowerCase();
      const sameName = (c.name || '').toLowerCase() === (targetName || '').toLowerCase();
      return sameProgram && (sameSlug || sameName);
    });
    if (found) return found.id;
  } catch (e) {
    // Falha ao listar categorias
  }

  // 3) Criar nova categoria de projeto para este programa
  try {
    const created = await createProjectCategory({ name: targetName, program_id: programId, description: blogCat?.description || '' });
    return created?.id || null;
  } catch (e) {
    return null;
  }
}

// Buscar detalhes de um projeto por slug
export async function fetchProjectDetail(slug: string) {
  try {
    // Estratégia 1: Tentar buscar via API pública por slug
    try {
      const res = await fetch(`${API_BASE}/projects/public/projects/?slug=${slug}`);
      if (res.ok) {
        const data = await res.json();
        const results = data.results || data;
        
        if (Array.isArray(results) && results.length > 0) {
          return results[0];
        }
      }
    } catch (error) {
      // Falha na busca por slug
    }

    // Estratégia 2: Tentar buscar diretamente por slug como endpoint
    try {
      const res = await fetch(`${API_BASE}/projects/public/projects/${slug}/`);
      if (res.ok) {
        const projectData = await res.json();
        return projectData;
      }
    } catch (error) {
      // Falha no endpoint direto
    }

    // Estratégia 3: Buscar em todos os projetos e filtrar por slug
    try {
      const allProjects = await fetchPublicProjects();
      const project = allProjects.find((p: any) => p.slug === slug);
      if (project) {
        return project;
      }
    } catch (error) {
      // Falha ao buscar na lista completa
    }

    // Estratégia 4: Tentar sistema de tracking como fallback
    try {
      const trackingRes = await fetch(`${API_BASE}/tracking/project-tracking/?search=${slug}`);
      if (trackingRes.ok) {
        const trackingData = await trackingRes.json();
        if (trackingData.results && trackingData.results.length > 0) {
          const project = trackingData.results.find((p: any) => p.slug === slug);
          if (project) {
            return project;
          }
        }
      }
    } catch (trackingError) {
      // Falha no sistema de tracking
    }

    // Se chegou até aqui, não encontrou o projeto
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
      return generateMockProject(slug);
    }

    throw new Error(`Projeto com slug "${slug}" não encontrado`);
    
  } catch (error) {
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
    // Tentar buscar via endpoint específico de programas
    const res = await fetch(`${API_BASE}/core/programs/`);
    if (res.ok) {
      const data = await res.json();
      
      // Se é uma resposta paginada, usar results
      if (data.results && Array.isArray(data.results)) {
        const programs = data.results.map((item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description || item.short_description || '',
          color: item.color || '#3498db',
          icon: item.icon || 'folder'
        }));
        return programs;
      }
      // Se é um array direto
      else if (Array.isArray(data)) {
        const programs = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          slug: item.slug,
          description: item.description || item.short_description || '',
          color: item.color || '#3498db',
          icon: item.icon || 'folder'
        }));
        return programs;
      }
      // Fallback para formato antigo
      return data.results || data;
    }
  } catch (error) {
    // Endpoint de programas não disponível
  }

  try {
    // Fallback: Extrair programas dos projetos públicos
    const projects = await fetchPublicProjects();
    const programsMap = new Map();
    projects.forEach(p => {
      if (p.program && p.program.id) {
        programsMap.set(p.program.id, p.program);
      }
    });
    const extractedPrograms = Array.from(programsMap.values());
    
    if (extractedPrograms.length > 0) {
      return extractedPrograms;
    }
  } catch (error) {
    // Erro ao extrair programas dos projetos
  }

  // Dados mock atualizados - baseados nos programas reais criados
  return [
    { 
      id: 1, 
      name: 'Apoio Alimentar',
      slug: 'apoio-alimentar',
      description: 'Programas de assistência alimentar para comunidades vulneráveis',
      color: '#e74c3c',
      icon: 'utensils'
    },
    { 
      id: 2, 
      name: 'Reconstrução',
      slug: 'reconstrucao',
      description: 'Programas de reconstrução de infraestruturas e habitações',
      color: '#f39c12',
      icon: 'hammer'
    }, 
    { 
      id: 3, 
      name: 'Educação',
      slug: 'educacao',
      description: 'Programas educacionais e de capacitação profissional',
      color: '#3498db',
      icon: 'graduation-cap'
    },
    { 
      id: 4, 
      name: 'Saúde',
      slug: 'saude',
      description: 'Programas de assistência médica e promoção da saúde',
      color: '#2ecc71',
      icon: 'heartbeat'
    },
    { 
      id: 5, 
      name: 'Proteção',
      slug: 'protecao',
      description: 'Programas de proteção infantil e direitos humanos',
      color: '#9b59b6',
      icon: 'shield-alt'
    },
    { 
      id: 6, 
      name: 'Apoio Psicossocial',
      slug: 'apoio-psicossocial',
      description: 'Programas de apoio psicológico e reintegração social',
      color: '#1abc9c',
      icon: 'hands-helping'
    }
  ];
}

// Buscar usuários/responsáveis disponíveis (requer autenticação)
export async function fetchProjectManagers() {
  try {
    // Usar usuário autenticado como gestor
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('Token não encontrado');
  const response = await authFetch(`${API_BASE}/auth/user/`);
    if (!response.ok) throw new Error('Endpoint não encontrado');
    const user = await response.json();
    return user ? [user] : [];
  } catch (error) {
    return [];
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
    throw new Error(`Erro no upload da imagem: ${res.status} - ${errorData}`);
  }

  const data = await res.json();
  return data.url;
}

export async function duplicatePost(slug: string) {
  // Try to fetch the original post title so we can preserve it client-side
  let originalTitle: string | null = null;
  try {
    const original = await fetchPostDetail(slug);
    if (original && typeof original.title === 'string') originalTitle = original.title;
  } catch (e) {
    // ignore - continue with duplication even if we can't fetch the original
  }

  const res = await fetch(`${API_BASE}/blog/posts/${slug}/duplicate/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  
  if (!res.ok) {
    const errorData = await res.text();
    throw new Error(`Erro ao duplicar post: ${res.status} - ${errorData}`);
  }

  const data = await res.json();

  // Attach the original title so callers can decide how to present the duplicated post
  if (originalTitle) data.original_title = originalTitle;

  // If backend prefixed the duplicated title (ex: "[Copia] ..."), prefer the original title
  try {
    const dup = data?.duplicated_post;
    if (dup && originalTitle && typeof dup.title === 'string') {
      const dupTitle = dup.title;
      const lowered = dupTitle.toLowerCase();
      if (lowered.includes('copia') || lowered.includes('cópia') || lowered.includes('[copy]') || lowered.startsWith('copy')) {
        dup.title = originalTitle;
      }
    }
  } catch (e) {
    // swallow any errors - do not break the duplication flow
  }

  return data;
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
    const url = `${API_BASE}/tracking/project-updates/?project=${projectId}`;
    
    const res = await fetch(url);
    if (!res.ok) {
      return [];
    }
    
    const data = await res.json();
    const updates = data.results || data; // Retorna o array de resultados
    
    return updates;
  } catch (error) {
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
      return [];
    }
    return await res.json();
  } catch (error) {
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
      return [];
    }
    return await res.json();
  } catch (error) {
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
      return [];
    }
    return await res.json();
  } catch (error) {
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

// === Tracking (slug-based) helpers ===
// Buscar marcos via sistema de tracking usando slug
export async function fetchTrackingMilestonesBySlug(slug: string) {
  try {
    // Endpoint principal no backend de tracking
    let res = await fetch(`${API_BASE}/tracking/projects/${encodeURIComponent(slug)}/milestones/`);
    if (!res.ok) {
      // Fallback: tentar obter via recurso completo e extrair
      const full = await fetch(`${API_BASE}/tracking/project-tracking/${encodeURIComponent(slug)}/`);
      if (full.ok) {
        const data = await full.json();
        const miles = (data && (data.milestones || data.project_milestones)) || [];
        return Array.isArray(miles) ? miles : [];
      }
      return [];
    }
    const json = await res.json();
    return json?.results || json || [];
  } catch (e) {
    return [];
  }
}

// Buscar métricas via sistema de tracking usando slug (normaliza formato)
export async function fetchTrackingMetricsBySlug(slug: string) {
  const empty = {
    peopleImpacted: 0,
    budgetUsed: 0,
    budgetTotal: 0,
    progressPercentage: 0,
    completedMilestones: 0,
    totalMilestones: 0,
    lastUpdate: null as string | null,
  };
  try {
    // Endpoint principal
    let res = await fetch(`${API_BASE}/tracking/projects/${encodeURIComponent(slug)}/metrics/`);
    let raw: any = null;
    if (res.ok) {
      raw = await res.json();
    } else {
      // Fallback: recurso completo e extrair metrics
      const full = await fetch(`${API_BASE}/tracking/project-tracking/${encodeURIComponent(slug)}/`);
      if (full.ok) {
        const data = await full.json();
        raw = data?.metrics || null;
      }
    }
    if (!raw) return empty;

    // Pode vir como objeto ou primeiro item num array
    const m = Array.isArray(raw) ? raw[0] : raw;
    const normalizeNum = (v: any) => {
      if (typeof v === 'number') return v;
      if (typeof v === 'string') {
        const n = parseFloat(v.replace(/%/g, '').trim());
        return isNaN(n) ? 0 : n;
      }
      return 0;
    };

    return {
      peopleImpacted: normalizeNum(m.people_impacted ?? m.peopleImpacted),
      budgetUsed: normalizeNum(m.budget_used ?? m.budgetUsed),
      budgetTotal: normalizeNum(m.budget_total ?? m.budgetTotal),
      progressPercentage: normalizeNum(m.progress_percentage ?? m.progressPercentage),
      completedMilestones: normalizeNum(m.completed_milestones ?? m.completedMilestones),
      totalMilestones: normalizeNum(m.total_milestones ?? m.totalMilestones),
      lastUpdate: m.last_updated || m.lastUpdate || null,
    };
  } catch (e) {
    return empty;
  }
}

// Buscar dados completos do projeto para exibição pública
export async function fetchCompleteProjectData(slug: string) {
  try {
    // Tentar buscar dados do sistema de tracking primeiro (dados mais completos e atualizados)
    let trackingData = null;
    try {
      const trackingResponse = await fetch(`${API_BASE}/tracking/project-tracking/${slug}/`);
      if (trackingResponse.ok) {
        trackingData = await trackingResponse.json();
        
        // Log específico das métricas
        if (trackingData?.metrics) {
          // Buscar dados básicos para completar campos que podem estar faltando no tracking
          const basicProject = await fetchProjectDetail(slug);

          // Base: mesclar dados básicos e de tracking (tracking pode sobrepor onde fizer sentido)
          let completeData: any = {
            ...basicProject,
            ...trackingData,
          };

          // Evidências: aceitar singular do tracking e manter as existentes
          completeData.evidences = trackingData.evidence || trackingData.evidences || completeData.evidences || [];

          // Datas principais: priorizar métricas do tracking se existirem
          completeData.start_date = trackingData.metrics.start_date || basicProject.start_date;
          completeData.end_date = trackingData.metrics.end_date || basicProject.end_date;
          completeData.created_at = basicProject.created_at || completeData.created_at;
          completeData.updated_at = basicProject.updated_at || completeData.updated_at;

          // Beneficiários
          completeData.target_beneficiaries = trackingData.target_beneficiaries ?? basicProject.target_beneficiaries ?? completeData.target_beneficiaries;

          // Orçamento: manter ambos campos para compatibilidade
          // budget (tracking) e target_budget (modelo público/admin)
          if (trackingData.budget !== undefined) {
            completeData.budget = trackingData.budget;
          }
          // Preservar target_budget e current_spending do básico se existirem
          if (basicProject.target_budget !== undefined) completeData.target_budget = basicProject.target_budget;
          if (basicProject.current_spending !== undefined) completeData.current_spending = basicProject.current_spending;

          // Imagens
          completeData.featured_image = trackingData.featured_image || basicProject.featured_image || completeData.featured_image;
          completeData.image = trackingData.image || basicProject.image || completeData.image;

          // Forçar status/priority/program/category a virem dos dados básicos, caso existam
          completeData.status = basicProject.status || trackingData.status || completeData.status;
          completeData.priority = basicProject.priority || trackingData.priority || completeData.priority;
          completeData.program = basicProject.program || trackingData.program || completeData.program;
          completeData.category = basicProject.category || trackingData.category || completeData.category;

          // Localização
          completeData.location = basicProject.location || trackingData.location || completeData.location;
          completeData.district = basicProject.district || trackingData.district || completeData.district;
          completeData.province = basicProject.province || trackingData.province || completeData.province;

          // Milestones: preferir lista do tracking se houver, senão manter as existentes
          completeData.milestones = trackingData.milestones || completeData.milestones || [];

          // Normalizar métricas com fallbacks sólidos
          const metricsFromTracking = trackingData.metrics || {};
          const budgetUsed = parseFloat(metricsFromTracking.budget_used ?? '0') || (basicProject.current_spending ?? 0) || (completeData.current_spending ?? 0) || 0;
          const budgetTotal = parseFloat(metricsFromTracking.budget_total ?? '0') || (completeData.budget ?? 0) || (basicProject.target_budget ?? 0) || (completeData.target_budget ?? 0) || 0;

          // Calcular marcos a partir da lista se métricas não informarem
          const milestonesArray = completeData.milestones || [];
          const milestonesCompletedFromList = Array.isArray(milestonesArray)
            ? milestonesArray.filter((m: any) => m?.is_completed === true || m?.status === 'completed').length
            : 0;
          const milestonesTotalFromList = Array.isArray(milestonesArray) ? milestonesArray.length : 0;

          completeData.metrics = {
            peopleImpacted: metricsFromTracking.people_impacted ?? basicProject.current_beneficiaries ?? completeData.current_beneficiaries ?? 0,
            budgetUsed,
            budgetTotal,
            progressPercentage: metricsFromTracking.progress_percentage ?? basicProject.progress_percentage ?? completeData.progress_percentage ?? 0,
            completedMilestones: metricsFromTracking.completed_milestones ?? milestonesCompletedFromList,
            totalMilestones: metricsFromTracking.total_milestones ?? milestonesTotalFromList,
            lastUpdate: metricsFromTracking.last_updated ?? basicProject.updated_at ?? completeData.updated_at ?? null,
          };

          // Atualizar campos de atalho derivados
          completeData.current_beneficiaries = completeData.metrics.peopleImpacted;
          completeData.progress_percentage = completeData.metrics.progressPercentage;
          
          // Se ainda não houver milestones, tentar tracking por slug e depois endpoints por ID
          if (!completeData.milestones || completeData.milestones.length === 0) {
            try {
              const trackingMilestones = await fetchTrackingMilestonesBySlug(slug);
              if (Array.isArray(trackingMilestones) && trackingMilestones.length > 0) {
                completeData.milestones = trackingMilestones;
              }
            } catch (e) {
              // Falha ao buscar milestones via tracking
            }

            if ((!completeData.milestones || completeData.milestones.length === 0) && basicProject?.id) {
              try {
                const fallbackMilestones = await fetchProjectMilestones(basicProject.id);
                if (Array.isArray(fallbackMilestones) && fallbackMilestones.length > 0) {
                  completeData.milestones = fallbackMilestones;
                }
              } catch (e) {
                // Falha ao buscar milestones fallback
              }
            }

            // Recalcular contagem de marcos se conseguirmos preencher
            if (Array.isArray(completeData.milestones)) {
              completeData.metrics.totalMilestones = completeData.milestones.length;
              completeData.metrics.completedMilestones = completeData.milestones.filter((m: any) => m?.is_completed === true || m?.status === 'completed').length;
            }
          }

          return completeData;
        } else {
          // TrackingData existe mas sem métricas
        }
      } else {
        // Resposta de tracking não ok
      }
    } catch (error) {
      // Dados de tracking não disponíveis
    }

    // Fallback: Buscar dados básicos do projeto se tracking falhou
    const project = await fetchProjectDetail(slug);
    
    if (!project) {
      throw new Error('Projeto não encontrado');
    }

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

    return completeData;
    
  } catch (error) {
    throw error;
  }
}

// Função para buscar detalhes do projeto com autenticação (para dashboard)
export async function fetchProjectDetailForEdit(slug: string) {
  const authToken = localStorage.getItem('authToken');
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Token de acesso não encontrado');
    }

    // Tentar buscar via API administrativa
  const response = await authFetch(`${API_BASE}/projects/admin/projects/?slug=${slug}`);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const data = await response.json();
    const results = data.results || data;
    
    if (Array.isArray(results) && results.length > 0) {
      return results[0];
    } else if (!Array.isArray(results) && results.id) {
      return results;
    }

    throw new Error('Projeto não encontrado');
    
  } catch (error) {
    // Fallback: tentar buscar como público para pelo menos preencher parte dos campos
    try {
      const publicProject = await fetchProjectDetail(slug);
      if (publicProject) {
        return publicProject;
      }
    } catch {}
    throw error;
  }
}


