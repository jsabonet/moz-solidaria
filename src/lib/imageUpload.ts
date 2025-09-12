// src/lib/imageUpload.ts
// Serviço de upload de imagem com múltiplos providers - versão completa

interface UploadProvider {
  upload(file: File): Promise<string>;
  name: string;
}

// Provider para Cloudinary (recomendado para produção)
class CloudinaryProvider implements UploadProvider {
  name = 'Cloudinary';
  
  async upload(file: File): Promise<string> {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName || !uploadPreset) {
      throw new Error('Configuração do Cloudinary não encontrada nas variáveis de ambiente');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'moz-solidaria'); // Organizar em pasta

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Falha no upload para Cloudinary: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    return data.secure_url;
  }
}

// Provider para backend próprio (com requests funcionando)
class BackendProvider implements UploadProvider {
  name = 'Backend Django';
  
  async upload(file: File): Promise<string> {
    const API_BASE = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location?.origin.includes('mozsolidaria.org') ? 'https://mozsolidaria.org/api/v1' : 'http://localhost:8000/api/v1');
    
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE}/blog/upload/image/`, {
      method: 'POST',
      headers: {
        ...(localStorage.getItem('authToken') && { 
          'Authorization': `Bearer ${localStorage.getItem('authToken')}` 
        }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Falha no upload para backend: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    return data.url;
  }
}

// Provider local para desenvolvimento (fallback)
class LocalProvider implements UploadProvider {
  name = 'Local (Desenvolvimento)';
  
  async upload(file: File): Promise<string> {
    // Create object URL (temporary, will be lost on page refresh)
    const url = URL.createObjectURL(file);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.warn('⚠️ Usando upload local - a imagem será perdida ao recarregar a página');
    
    return url;
  }
}

// Provider para ImgBB (alternativa gratuita)
class ImgBBProvider implements UploadProvider {
  name = 'ImgBB';
  
  async upload(file: File): Promise<string> {
    const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
    
    if (!apiKey) {
      throw new Error('Chave da API ImgBB não encontrada');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Falha no upload para ImgBB: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error('Upload para ImgBB falhou');
    }

    return data.data.url;
  }
}

// Service para gerenciar uploads com ordem de prioridade
class ImageUploadService {
  private providers: UploadProvider[] = [
    new BackendProvider(),     // Prioridade 1: Nosso backend
    new CloudinaryProvider(), // Prioridade 2: Cloudinary
    new ImgBBProvider(),       // Prioridade 3: ImgBB
    new LocalProvider(),       // Fallback: Local
  ];

  async upload(file: File): Promise<{ url: string; provider: string }> {
    // Validação do arquivo
    if (!file.type.startsWith('image/')) {
      throw new Error('Apenas arquivos de imagem são permitidos');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('Arquivo muito grande. Máximo permitido: 10MB');
    }

    let lastError: Error | null = null;

    for (const provider of this.providers) {
      try {
        console.log(`📤 Tentando upload com ${provider.name}...`);
        const url = await provider.upload(file);
        console.log(`✅ Upload realizado com sucesso via ${provider.name}`);
        console.log(`🔗 URL: ${url}`);
        return { url, provider: provider.name };
      } catch (error) {
        console.warn(`❌ Falha no upload via ${provider.name}:`, error);
        lastError = error as Error;
        continue;
      }
    }

    throw lastError || new Error('Todos os métodos de upload falharam');
  }

  // Método para testar conectividade com os providers
  async testProviders(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};
    
    for (const provider of this.providers) {
      try {
        // Teste simples com arquivo pequeno
        const testFile = new File(['test'], 'test.txt', { type: 'image/jpeg' });
        await provider.upload(testFile);
        results[provider.name] = true;
      } catch {
        results[provider.name] = false;
      }
    }
    
    return results;
  }
}

export const imageUploadService = new ImageUploadService();
export { type UploadProvider };
