// src/lib/validation.ts
// Sistema centralizado de validação para melhorar consistência e reusabilidade

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any, allData?: any) => string | null;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

export interface FieldConfig {
  label: string;
  rules: ValidationRule;
  helpText?: string;
}

// Esquemas de validação para diferentes entidades
export const validationSchemas = {
  project: {
    name: {
      label: 'Nome do Projeto',
      rules: {
        required: true,
        minLength: 3,
        maxLength: 200,
        custom: (value: string) => {
          if (value && value.trim() !== value) {
            return 'O nome não deve ter espaços no início ou fim';
          }
          return null;
        }
      },
      helpText: 'Nome único e descritivo para o projeto'
    },
    short_description: {
      label: 'Descrição Curta',
      rules: {
        required: true,
        minLength: 10,
        maxLength: 300
      },
      helpText: 'Resumo conciso do projeto (10-300 caracteres)'
    },
    description: {
      label: 'Descrição Completa',
      rules: {
        required: true,
        minLength: 50,
        maxLength: 2000
      },
      helpText: 'Descrição detalhada do projeto e seus objetivos'
    },
    location: {
      label: 'Localização',
      rules: {
        required: true,
        minLength: 3,
        maxLength: 100
      },
      helpText: 'Localização onde o projeto será executado'
    },
    target_beneficiaries: {
      label: 'Beneficiários Alvo',
      rules: {
        required: true,
        min: 1,
        max: 1000000
      },
      helpText: 'Número estimado de pessoas que se beneficiarão'
    },
    target_budget: {
      label: 'Orçamento Alvo',
      rules: {
        required: true,
        min: 100,
        max: 10000000
      },
      helpText: 'Orçamento total necessário em MZN'
    },
    start_date: {
      label: 'Data de Início',
      rules: {
        required: true,
        custom: (value: Date) => {
          if (value && value < new Date()) {
            return 'A data de início não pode ser no passado';
          }
          return null;
        }
      },
      helpText: 'Data prevista para início do projeto'
    },
    end_date: {
      label: 'Data de Término',
      rules: {
        required: true,
        custom: (value: Date, formData: any) => {
          if (value && formData.start_date && value <= formData.start_date) {
            return 'A data de término deve ser posterior ao início';
          }
          return null;
        }
      },
      helpText: 'Data prevista para conclusão do projeto'
    }
  },

  post: {
    title: {
      label: 'Título',
      rules: {
        required: true,
        minLength: 5,
        maxLength: 200
      },
      helpText: 'Título claro e atrativo para o post'
    },
    content: {
      label: 'Conteúdo',
      rules: {
        required: true,
        minLength: 100,
        custom: (value: string) => {
          // Remover tags HTML para contar caracteres reais
          const textOnly = value.replace(/<[^>]*>/g, '');
          if (textOnly.length < 100) {
            return 'O conteúdo deve ter pelo menos 100 caracteres (excluindo HTML)';
          }
          return null;
        }
      },
      helpText: 'Conteúdo principal do post com formatação rica'
    },
    excerpt: {
      label: 'Resumo',
      rules: {
        maxLength: 300
      },
      helpText: 'Resumo opcional para visualização em listas'
    },
    meta_description: {
      label: 'Meta Descrição',
      rules: {
        maxLength: 160,
        custom: (value: string) => {
          if (value && value.length > 160) {
            return 'Meta descrição muito longa para SEO (máximo 160 caracteres)';
          }
          if (value && value.length < 120) {
            return 'Meta descrição muito curta para SEO ideal (mínimo 120 caracteres)';
          }
          return null;
        }
      },
      helpText: 'Descrição para motores de busca (120-160 caracteres ideal)'
    }
  },

  donation: {
    amount: {
      label: 'Valor da Doação',
      rules: {
        required: true,
        min: 1,
        max: 1000000,
        custom: (value: string) => {
          const num = parseFloat(value);
          if (isNaN(num)) {
            return 'Valor deve ser um número válido';
          }
          if (num <= 0) {
            return 'Valor deve ser maior que zero';
          }
          return null;
        }
      },
      helpText: 'Valor em MZN (mínimo 1.00)'
    },
    guest_email: {
      label: 'Email',
      rules: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      helpText: 'Email válido para contato'
    },
    guest_phone: {
      label: 'Telefone',
      rules: {
        required: true,
        pattern: /^(\+258)?[0-9]{8,9}$/,
        custom: (value: string) => {
          if (value && !value.match(/^(\+258)?[0-9]{8,9}$/)) {
            return 'Formato: +258XXXXXXXXX ou XXXXXXXXX';
          }
          return null;
        }
      },
      helpText: 'Telefone moçambicano válido'
    }
  },

  user: {
    username: {
      label: 'Nome de Usuário',
      rules: {
        required: true,
        minLength: 3,
        maxLength: 30,
        pattern: /^[a-zA-Z0-9_-]+$/,
        custom: (value: string) => {
          if (value && !value.match(/^[a-zA-Z0-9_-]+$/)) {
            return 'Use apenas letras, números, _ e -';
          }
          return null;
        }
      },
      helpText: 'Nome único para identificação (apenas letras, números, _ e -)'
    },
    email: {
      label: 'Email',
      rules: {
        required: true,
        pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      },
      helpText: 'Email válido para comunicação'
    },
    password: {
      label: 'Senha',
      rules: {
        required: true,
        minLength: 8,
        custom: (value: string) => {
          if (value && value.length < 8) {
            return 'Senha deve ter pelo menos 8 caracteres';
          }
          if (value && !/(?=.*[a-z])/.test(value)) {
            return 'Senha deve conter pelo menos uma letra minúscula';
          }
          if (value && !/(?=.*[A-Z])/.test(value)) {
            return 'Senha deve conter pelo menos uma letra maiúscula';
          }
          if (value && !/(?=.*\d)/.test(value)) {
            return 'Senha deve conter pelo menos um número';
          }
          return null;
        }
      },
      helpText: 'Mínimo 8 caracteres com maiúscula, minúscula e número'
    }
  }
};

// Função principal de validação
export function validateField(
  value: any, 
  fieldConfig: FieldConfig, 
  allData?: any
): { error?: string; warning?: string } {
  const { rules } = fieldConfig;
  
  // Verificar obrigatório
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return { error: `${fieldConfig.label} é obrigatório` };
  }

  // Se campo não é obrigatório e está vazio, não validar outras regras
  if (!value || (typeof value === 'string' && !value.trim())) {
    return {};
  }

  // Validação de string
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return { error: `${fieldConfig.label} deve ter pelo menos ${rules.minLength} caracteres` };
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      return { error: `${fieldConfig.label} deve ter no máximo ${rules.maxLength} caracteres` };
    }
    
    if (rules.pattern && !rules.pattern.test(value)) {
      return { error: `${fieldConfig.label} tem formato inválido` };
    }
  }

  // Validação de número
  if (typeof value === 'number' || !isNaN(parseFloat(value))) {
    const numValue = typeof value === 'number' ? value : parseFloat(value);
    
    if (rules.min !== undefined && numValue < rules.min) {
      return { error: `${fieldConfig.label} deve ser pelo menos ${rules.min}` };
    }
    
    if (rules.max !== undefined && numValue > rules.max) {
      return { error: `${fieldConfig.label} deve ser no máximo ${rules.max}` };
    }
  }

  // Validação customizada
  if (rules.custom) {
    const customError = rules.custom(value, allData);
    if (customError) {
      return { error: customError };
    }
  }

  return {};
}

// Validar formulário completo
export function validateForm(
  data: Record<string, any>,
  schema: Record<string, FieldConfig>
): ValidationResult {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};

  Object.entries(schema).forEach(([fieldName, fieldConfig]) => {
    const value = data[fieldName];
    const result = validateField(value, fieldConfig, data);
    
    if (result.error) {
      errors[fieldName] = result.error;
    }
    if (result.warning) {
      warnings[fieldName] = result.warning;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings
  };
}

// Validação em tempo real com debounce
export function createDebouncedValidator(
  callback: (errors: Record<string, string>) => void,
  delay: number = 500
) {
  let timeout: NodeJS.Timeout;
  
  return (data: Record<string, any>, schema: Record<string, FieldConfig>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      const result = validateForm(data, schema);
      callback(result.errors);
    }, delay);
  };
}

// Utilitário para extrair texto de HTML
export function extractTextFromHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

// Utilitário para formatar mensagens de erro de API
export function formatAPIError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data) {
    const data = error.response.data;
    
    // Tentar extrair mensagem específica
    if (data.detail) return data.detail;
    if (data.message) return data.message;
    if (data.error) return data.error;
    
    // Extrair erros de campo
    const fieldErrors = Object.entries(data)
      .filter(([key, value]) => Array.isArray(value))
      .map(([key, errors]: [string, any]) => `${key}: ${errors[0]}`)
      .join(', ');
    
    if (fieldErrors) return fieldErrors;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return 'Erro inesperado. Tente novamente.';
}

// Validações específicas para Moçambique
export const mozambiqueValidators = {
  phone: (value: string) => {
    const cleanPhone = value.replace(/\s+/g, '');
    if (!cleanPhone.match(/^(\+258)?[0-9]{8,9}$/)) {
      return 'Telefone deve estar no formato +258XXXXXXXXX ou XXXXXXXXX';
    }
    return null;
  },
  
  province: (value: string) => {
    const validProvinces = [
      'Cabo Delgado', 'Gaza', 'Inhambane', 'Manica', 'Maputo', 
      'Nampula', 'Niassa', 'Sofala', 'Tete', 'Zambézia', 'Maputo Cidade'
    ];
    if (!validProvinces.includes(value)) {
      return 'Província deve ser uma das províncias válidas de Moçambique';
    }
    return null;
  },
  
  currency: (value: string) => {
    const amount = parseFloat(value);
    if (isNaN(amount) || amount <= 0) {
      return 'Valor deve ser um número positivo em MZN';
    }
    if (amount > 10000000) {
      return 'Valor muito alto para processamento';
    }
    return null;
  }
};

export default {
  validateField,
  validateForm,
  validationSchemas,
  createDebouncedValidator,
  extractTextFromHtml,
  formatAPIError,
  mozambiqueValidators
};
