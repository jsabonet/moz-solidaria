import { useEffect } from 'react';
import { BlogPost } from '@/lib/api';
import { SEOConfig } from '@/config/seo';

interface SEOHeadProps {
  post?: BlogPost;
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  page?: keyof typeof SEOConfig.pages;
}

const SEOHead: React.FC<SEOHeadProps> = ({ 
  post, 
  title: customTitle, 
  description: customDescription,
  keywords: customKeywords,
  image: customImage,
  url: customUrl,
  type = 'website',
  page
}) => {
  useEffect(() => {
    // Configuração SEO baseada na página atual
    const pageConfig = page ? SEOConfig.pages[page] : null;
    
    // Determinar valores para meta tags com prioridade hierárquica
    const pageTitle = post?.title || post?.meta_title || customTitle || pageConfig?.title || SEOConfig.site.title;
    const pageDescription = post?.meta_description || post?.excerpt || customDescription || pageConfig?.description || SEOConfig.site.description;
    const pageKeywords = post?.meta_keywords || customKeywords || pageConfig?.keywords || SEOConfig.keywords.primary.join(', ');
    const pageImage = post?.og_image || post?.featured_image || customImage || SEOConfig.site.defaultImage;
    const pageUrl = customUrl || (post ? `${SEOConfig.site.url}/blog/${post.slug}` : window.location.href);
    const canonicalUrl = post?.canonical_url || pageUrl;
    
    // Atualizar título da página
    document.title = post ? `${pageTitle} | ${SEOConfig.site.name}` : pageTitle;
    
    // Função para atualizar ou criar meta tag
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      
      // Remover todas as meta tags existentes com o mesmo name/property para evitar duplicatas
      const existingTags = document.querySelectorAll(`meta[${attribute}="${name}"]`);
      existingTags.forEach(tag => tag.remove());
      
      // Criar nova meta tag
      const tag = document.createElement('meta');
      tag.setAttribute(attribute, name);
      tag.content = content;
      document.head.appendChild(tag);
      
    };

    // Função para atualizar robots meta tag baseada nos campos do post
    const updateRobotsTag = () => {
      const robotsDirectives = [];
      
      if (post?.noindex) {
        robotsDirectives.push('noindex');
      } else {
        robotsDirectives.push('index');
      }
      
      if (post?.nofollow) {
        robotsDirectives.push('nofollow');
      } else {
        robotsDirectives.push('follow');
      }
      
      if (post?.robots_txt) {
        robotsDirectives.push(post.robots_txt);
      }
      
      const robotsContent = robotsDirectives.join(', ');
      updateMetaTag('robots', robotsContent);
    };

    // Função para configurar favicon e ícones relacionados
    const updateFavicon = () => {
      // Verificar se já existe favicon-96x96.png, caso contrário adicionar
      const existingFaviconPng = document.querySelector('link[rel="icon"][href="/favicon-96x96.png"]');
      if (!existingFaviconPng) {
        const favicon = document.createElement('link');
        favicon.rel = 'icon';
        favicon.type = 'image/png';
        favicon.sizes = '96x96';
        favicon.href = '/favicon-96x96.png';
        document.head.appendChild(favicon);
      }

      // Verificar se já existe shortcut icon, caso contrário adicionar
      const existingShortcutIcon = document.querySelector('link[rel="shortcut icon"]');
      if (!existingShortcutIcon) {
        const shortcutIcon = document.createElement('link');
        shortcutIcon.rel = 'shortcut icon';
        shortcutIcon.href = '/favicon-96x96.png';
        document.head.appendChild(shortcutIcon);
      }

      // Garantir que o manifest está linkado
      const existingManifest = document.querySelector('link[rel="manifest"]');
      if (!existingManifest) {
        const manifestLink = document.createElement('link');
        manifestLink.rel = 'manifest';
        manifestLink.href = '/manifest.json';
        document.head.appendChild(manifestLink);
      }
    };
    
    // Meta tags básicas
    updateMetaTag('description', pageDescription);
    
    // Meta tags essenciais para SEO
    updateMetaTag('viewport', 'width=device-width, initial-scale=1');
    updateMetaTag('charset', 'UTF-8');
    updateMetaTag('language', 'pt-PT');
    updateMetaTag('author', 'Moz Solidária');
    updateMetaTag('publisher', 'Moz Solidária');
    updateMetaTag('theme-color', '#dc2626');
    
    // Geo meta tags para localização
    updateMetaTag('geo.region', 'MZ-P');
    updateMetaTag('geo.placename', 'Cabo Delgado, Moçambique');
    updateMetaTag('geo.position', '-11.35;40.35');
    updateMetaTag('ICBM', '-11.35, 40.35');
    
    // Link canonical
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }
    const canonical = document.createElement('link');
    canonical.rel = 'canonical';
    canonical.href = canonicalUrl;
    document.head.appendChild(canonical);
    
    // Atualizar robots meta tag
    updateRobotsTag();
    
    // Configurar favicon e ícones
    updateFavicon();
    
    // Meta keywords - PRIORIZAR palavras-chave específicas do formulário
    let keywordsToUse = '';
    
    if (customKeywords && customKeywords.trim()) {
      // 0. PRIORIDADE MÁXIMA: keywords passadas diretamente (para páginas estáticas)
      keywordsToUse = customKeywords.trim();
    } else if (post?.meta_keywords && post.meta_keywords.trim()) {
      // 1. PRIORIDADE: usar meta_keywords específicas do post (do formulário)
      keywordsToUse = post.meta_keywords.trim();
    } else if (post?.focus_keyword) {
      // 2. FALLBACK: gerar automaticamente se não há keywords específicas
      const keywords = [post.focus_keyword];
      
      // Adicionar categoria e tags como palavras-chave secundárias
      if (post.category?.name) {
        keywords.push(post.category.name);
      }
      if (post.tags && Array.isArray(post.tags)) {
        keywords.push(...post.tags.map(tag => typeof tag === 'string' ? tag : tag.name || '').filter(Boolean));
      }
      
      // Remover duplicatas e criar string de keywords
      const uniqueKeywords = [...new Set(keywords.filter(Boolean))];
      keywordsToUse = uniqueKeywords.join(', ');
      
    }
    
    if (keywordsToUse) {
      updateMetaTag('keywords', keywordsToUse);
    }
    
    // Open Graph tags
    updateMetaTag('og:type', post?.og_type || (post ? 'article' : type), true);
    updateMetaTag('og:title', post?.og_title || pageTitle, true);
    updateMetaTag('og:description', post?.og_description || pageDescription, true);
    updateMetaTag('og:image', pageImage, true);
    updateMetaTag('og:url', pageUrl, true);
    updateMetaTag('og:site_name', SEOConfig.site.name, true);
    
    // Article specific tags
    if (post) {
      updateMetaTag('article:published_time', post.published_at || post.created_at, true);
      updateMetaTag('article:modified_time', post.updated_at, true);
      updateMetaTag('article:author', post.author?.first_name && post.author?.last_name 
        ? `${post.author.first_name} ${post.author.last_name}` 
        : post.author?.username || 'Moz Solidária', true);
      
      if (post.category) {
        updateMetaTag('article:section', post.category.name, true);
      }
      
      if (post.tags?.length) {
        // Remove existing article:tag meta tags
        document.querySelectorAll('meta[property="article:tag"]').forEach(tag => tag.remove());
        
        // Add new article:tag meta tags
        post.tags.forEach(tag => {
          const tagElement = document.createElement('meta');
          tagElement.setAttribute('property', 'article:tag');
          tagElement.content = tag.name;
          document.head.appendChild(tagElement);
        });
      }
    }
    
    // Twitter Card tags
    const twitterCardType = post?.twitter_card || 'summary_large_image';
    updateMetaTag('twitter:card', twitterCardType);
    updateMetaTag('twitter:title', post?.twitter_title || post?.og_title || pageTitle);
    updateMetaTag('twitter:description', post?.twitter_description || post?.og_description || pageDescription);
    updateMetaTag('twitter:image', pageImage);
    updateMetaTag('twitter:site', '@mozsolidaria');
    
    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = post?.canonical_url || pageUrl;
    
    // Robots meta tag
    let robotsTag = document.querySelector('meta[name="robots"]') as HTMLMetaElement;
    if (!robotsTag) {
      robotsTag = document.createElement('meta');
      robotsTag.name = 'robots';
      document.head.appendChild(robotsTag);
    }
    robotsTag.content = 'index,follow';
    
    // Schema.org structured data
    if (post) {
      const schemaData: any = {
        "@context": "https://schema.org",
        "@type": post.schema_type || "Article",
        "headline": post.title,
        "description": post.meta_description || post.excerpt,
        "url": pageUrl,
        "datePublished": post.published_at || post.created_at,
        "dateModified": post.updated_at,
        "author": {
          "@type": "Person",
          "name": post.author?.first_name && post.author?.last_name 
            ? `${post.author.first_name} ${post.author.last_name}` 
            : post.author?.username || 'Moz Solidária'
        },
        "publisher": {
          "@type": "Organization",
          "name": "Moz Solidária",
          "logo": {
            "@type": "ImageObject",
            "url": "/logo-moz-solidaria.png"
          }
        }
      };
      
      // Add image if available
      if (post.featured_image) {
        schemaData.image = {
          "@type": "ImageObject",
          "url": post.featured_image,
          "caption": post.featured_image_caption
        };
      }
      
      // Add category as articleSection
      if (post.category) {
        schemaData.articleSection = post.category.name;
      }
      
      // Add keywords
      if (post.tags?.length) {
        schemaData.keywords = post.tags.map(tag => tag.name);
      }
      
      // Add word count and reading time
      if (post.read_time) {
        schemaData.timeRequired = `PT${post.read_time}M`;
      }
      
      // Remove existing schema script
      const existingSchema = document.querySelector('script[type="application/ld+json"]');
      if (existingSchema) {
        existingSchema.remove();
      }
      
      // Add new schema script
      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.textContent = JSON.stringify(schemaData, null, 2);
      document.head.appendChild(schemaScript);
    }
    
    // Cleanup function
    return () => {
      // Reset to default values when component unmounts
      document.title = SEOConfig.site.title;
    };
  }, [post, customTitle, customDescription, customImage, customUrl, type]);

  return null; // This component doesn't render anything
};

export default SEOHead;
