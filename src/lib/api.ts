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
  
  try {
    const res = await fetch(`${API_BASE}/auth/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        username, 
        password 
      }),
    });
    
    if (!res.ok) {
      console.log('❌ JWT auth falhou, status:', res.status);
      const errorText = await res.text();
      throw new Error(`Credenciais inválidas: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('✅ JWT login successful:', data);
    
    // Buscar dados reais do usuário usando o token JWT
    try {
      const userRes = await fetch(`${API_BASE}/auth/user/`, {
        headers: {
          'Authorization': `Bearer ${data.access}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (userRes.ok) {
        const userData = await userRes.json();
        console.log('✅ Dados do usuário JWT obtidos:', userData);
        return {
          token: data.access,
          refresh: data.refresh,
          user: userData
        };
      } else {
        console.warn('❌ Erro ao buscar dados do usuário, status:', userRes.status);
      }
    } catch (userError) {
      console.warn('❌ Erro ao buscar dados do usuário:', userError);
    }
    
    // Fallback com dados básicos (mas ainda usando JWT token)
    return {
      token: data.access,
      refresh: data.refresh,
      user: {
        id: 1,
        username: username,
        is_staff: false,
        is_superuser: false
      }
    };
    
  } catch (error) {
    console.error('❌ JWT authentication completely failed:', error);
    throw error;
  }
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
  const res = await fetch(`${API_BASE}/client-area/profile/`, {
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
    // Verificar se é um token JWT (mais longo) ou DRF Token
    if (token.includes('.')) {
      // JWT Token
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // DRF Token
      headers['Authorization'] = `Token ${token}`;
    }
  }
  
  return headers;
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
    // Check if it's a JWT token (starts with ey) or DRF Token
    if (token.startsWith('ey')) {
      // JWT token
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // DRF Token
      config.headers.Authorization = `Token ${token}`;
    }
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
