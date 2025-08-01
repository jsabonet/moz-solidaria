// src/lib/api.ts
// Serviço centralizado para requisições ao backend Django

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
  is_published: boolean;
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
  const res = await fetch(`${API_BASE}/auth/token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Credenciais inválidas');
  return res.json();
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

// Funções CRUD para Posts (com autenticação)
function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
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
    res = await fetch(`${API_BASE}/blog/posts/`, {
      method: 'POST',
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

  // Corrigir endpoint para /blog/upload/image/
  const res = await fetch(`${API_BASE}/blog/upload/image/`, {
    method: 'POST',
    headers: {
      ...(localStorage.getItem('authToken') && { 
        'Authorization': `Bearer ${localStorage.getItem('authToken')}` 
      }),
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Erro no upload da imagem');
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
