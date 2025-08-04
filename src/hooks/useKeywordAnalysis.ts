import { useMemo } from 'react';

export interface KeywordStats {
  keyword: string;
  occurrences: number;
  density: number;
  inTitle: boolean;
  inDescription: boolean;
  inContent: boolean;
  inHeadings: boolean;
  score: number;
  status: 'excellent' | 'good' | 'warning' | 'poor';
  recommendations: string[];
}

export const useKeywordAnalysis = (
  keyword: string,
  title: string,
  description: string,
  content: string
): KeywordStats | null => {
  return useMemo(() => {
    if (!keyword.trim()) return null;

    const normalizedKeyword = keyword.toLowerCase().trim();
    const normalizedTitle = title.toLowerCase();
    const normalizedDescription = description.toLowerCase();
    const normalizedContent = content.replace(/<[^>]*>/g, '').toLowerCase();
    
    // Extrair headings do HTML
    const headingMatches = content.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi) || [];
    const headings = headingMatches
      .map(h => h.replace(/<[^>]*>/g, '').toLowerCase())
      .join(' ');

    // Análises básicas
    const inTitle = normalizedTitle.includes(normalizedKeyword);
    const inDescription = normalizedDescription.includes(normalizedKeyword);
    const inContent = normalizedContent.includes(normalizedKeyword);
    const inHeadings = headings.includes(normalizedKeyword);

    // Contar ocorrências
    const keywordRegex = new RegExp(
      normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 
      'g'
    );
    const occurrences = (normalizedContent.match(keywordRegex) || []).length;
    
    // Calcular densidade
    const words = normalizedContent.split(/\s+/).filter(word => word.length > 0);
    const density = words.length > 0 ? (occurrences / words.length) * 100 : 0;

    // Calcular score (0-100)
    let score = 0;
    
    // Pontuação por presença (70 pontos máximo)
    if (inTitle) score += 25;
    if (inDescription) score += 20;
    if (inContent) score += 15;
    if (inHeadings) score += 10;

    // Pontuação por densidade (30 pontos máximo)
    if (density >= 0.5 && density <= 2.5) {
      score += 30; // Densidade ideal
    } else if (density >= 0.3 && density < 0.5) {
      score += 20; // Densidade um pouco baixa
    } else if (density > 2.5 && density <= 4) {
      score += 10; // Densidade um pouco alta
    } else if (density > 4) {
      score -= 10; // Keyword stuffing
    }

    // Determinar status
    let status: KeywordStats['status'];
    if (score >= 85) status = 'excellent';
    else if (score >= 70) status = 'good';
    else if (score >= 50) status = 'warning';
    else status = 'poor';

    // Gerar recomendações
    const recommendations: string[] = [];
    
    if (!inTitle) {
      recommendations.push('Inclua a palavra-chave no título para melhor rankeamento');
    }
    
    if (!inDescription) {
      recommendations.push('Adicione a palavra-chave na meta descrição');
    }
    
    if (!inContent) {
      recommendations.push('Use a palavra-chave naturalmente no conteúdo');
    } else {
      if (density < 0.3) {
        recommendations.push('Considere usar a palavra-chave mais vezes (densidade muito baixa)');
      } else if (density > 4) {
        recommendations.push('Reduza o uso da palavra-chave para evitar spam (density muito alta)');
      } else if (density > 2.5) {
        recommendations.push('Cuidado com keyword stuffing - use variações da palavra-chave');
      }
    }
    
    if (!inHeadings && inContent) {
      recommendations.push('Inclua a palavra-chave em pelo menos um subtítulo (H2, H3, etc.)');
    }
    
    if (occurrences === 1) {
      recommendations.push('Use variações e sinônimos da palavra-chave para SEO mais natural');
    }
    
    if (occurrences > 10 && density > 3) {
      recommendations.push('Muitas repetições podem ser penalizadas pelos motores de busca');
    }

    return {
      keyword: normalizedKeyword,
      occurrences,
      density,
      inTitle,
      inDescription,
      inContent,
      inHeadings,
      score: Math.max(0, Math.min(100, score)),
      status,
      recommendations
    };
  }, [keyword, title, description, content]);
};

// Hook para sugestões de palavras-chave
export const useKeywordSuggestions = (
  title: string,
  content: string,
  limit: number = 8
): string[] => {
  return useMemo(() => {
    if (!title && !content) return [];

    const text = `${title} ${content}`.toLowerCase();
    const cleanText = text.replace(/<[^>]*>/g, '').replace(/[^\w\sáéíóúâêîôûãõç]/g, ' ');
    const words = cleanText.split(/\s+/).filter(word => word.length > 3);
    
    // Stop words em português
    const stopWords = new Set([
      'para', 'pela', 'pelo', 'mais', 'como', 'sobre', 'quando', 'onde', 
      'porque', 'muito', 'nossa', 'nosso', 'sua', 'seu', 'aqui', 'ali',
      'então', 'assim', 'além', 'através', 'durante', 'entre', 'cada',
      'todo', 'toda', 'todos', 'todas', 'isso', 'essa', 'esse', 'esta',
      'este', 'eles', 'elas', 'dele', 'dela', 'deles', 'delas', 'uma',
      'uns', 'umas', 'tem', 'têm', 'são', 'está', 'estão', 'foi', 'ser',
      'ter', 'fazer', 'dizer', 'quer', 'pode', 'deve', 'após', 'antes',
      'desde', 'até', 'mas', 'porém', 'contudo', 'entretanto', 'também',
      'apenas', 'mesmo', 'ainda', 'já', 'sempre', 'nunca', 'hoje', 'ontem',
      'amanhã', 'agora', 'depois', 'primeiro', 'segundo', 'terceiro'
    ]);
    
    // Contar frequência das palavras
    const wordCount: Record<string, number> = {};
    words.forEach(word => {
      if (!stopWords.has(word) && word.length > 3) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });
    
    // Retornar palavras mais frequentes
    return Object.entries(wordCount)
      .filter(([, count]) => count >= 2) // Mínimo 2 ocorrências
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([word]) => word);
  }, [title, content, limit]);
};

// Hook para gerar meta keywords automaticamente
export const useAutoMetaKeywords = (
  focusKeyword: string,
  title: string,
  content: string,
  category?: string,
  tags?: string[]
): string => {
  return useMemo(() => {
    const keywords: string[] = [];
    
    // Adicionar palavra-chave principal
    if (focusKeyword) {
      keywords.push(focusKeyword);
    }
    
    // Adicionar sugestões baseadas no conteúdo
    const suggestions = useKeywordSuggestions(title, content, 5);
    keywords.push(...suggestions);
    
    // Adicionar categoria
    if (category) {
      keywords.push(category.toLowerCase());
    }
    
    // Adicionar tags
    if (tags && tags.length > 0) {
      keywords.push(...tags.slice(0, 3)); // Máximo 3 tags
    }
    
    // Remover duplicatas e limitar a 10 keywords
    const uniqueKeywords = [...new Set(keywords.filter(Boolean))];
    return uniqueKeywords.slice(0, 10).join(', ');
  }, [focusKeyword, title, content, category, tags]);
};
