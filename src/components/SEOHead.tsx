import { useEffect } from 'react';
import { BlogPost } from '@/lib/api';

interface SEOHeadProps {
  post?: BlogPost;
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({ 
  post, 
  title: customTitle, 
  description: customDescription,
  keywords: customKeywords,
  image: customImage,
  url: customUrl,
  type = 'website'
}) => {
  useEffect(() => {
    // Determinar valores para meta tags
    const pageTitle = post?.meta_title || post?.title || customTitle || 'Moz Solidária';
    const pageDescription = post?.meta_description || post?.excerpt || customDescription || 'Transformando vidas em Cabo Delgado com esperança e ação';
    const pageImage = post?.og_image || post?.featured_image || customImage || '/logo-moz-solidaria.png';
    const pageUrl = customUrl || (post ? `/blog/${post.slug}` : window.location.href);
    const siteTitle = 'Moz Solidária';
    
    // Atualizar título da página
    document.title = post ? `${pageTitle} | ${siteTitle}` : pageTitle;
    
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
      
      console.log(`🏷️ SEOHead - Meta tag atualizada: ${attribute}="${name}" content="${content}"`);
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
    
    // Meta tags básicas
    updateMetaTag('description', pageDescription);
    
    // Atualizar robots meta tag
    updateRobotsTag();
    
    // Meta keywords - PRIORIZAR palavras-chave específicas do formulário
    let keywordsToUse = '';
    
    if (customKeywords && customKeywords.trim()) {
      // 0. PRIORIDADE MÁXIMA: keywords passadas diretamente (para páginas estáticas)
      keywordsToUse = customKeywords.trim();
      console.log('🏷️ SEOHead - Usando keywords customizadas:', keywordsToUse);
    } else if (post?.meta_keywords && post.meta_keywords.trim()) {
      // 1. PRIORIDADE: usar meta_keywords específicas do post (do formulário)
      keywordsToUse = post.meta_keywords.trim();
      console.log('🏷️ SEOHead - Usando keywords específicas do formulário:', keywordsToUse);
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
      
      console.log('🏷️ SEOHead - Gerando keywords automáticas:', {
        focus_keyword: post.focus_keyword,
        category: post.category?.name,
        tags: post.tags,
        generated_keywords: keywordsToUse
      });
    }
    
    if (keywordsToUse) {
      updateMetaTag('keywords', keywordsToUse);
    } else {
      console.log('🏷️ SEOHead - Nenhuma palavra-chave encontrada para este post');
    }
    
    // Open Graph tags
    updateMetaTag('og:type', post?.og_type || (post ? 'article' : type), true);
    updateMetaTag('og:title', post?.og_title || pageTitle, true);
    updateMetaTag('og:description', post?.og_description || pageDescription, true);
    updateMetaTag('og:image', pageImage, true);
    updateMetaTag('og:url', pageUrl, true);
    updateMetaTag('og:site_name', siteTitle, true);
    
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
      document.title = siteTitle;
    };
  }, [post, customTitle, customDescription, customImage, customUrl, type]);

  return null; // This component doesn't render anything
};

export default SEOHead;
