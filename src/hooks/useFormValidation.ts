// src/hooks/useFormValidation.ts
// Hook customizado para gerenciamento avançado de formulários com validação

import { useState, useCallback, useEffect, useRef } from 'react';
import { 
  validateForm, 
  validateField, 
  ValidationResult, 
  FieldConfig,
  formatAPIError
} from '@/lib/validation';
import { toast } from 'sonner';

interface UseFormValidationProps<T> {
  initialData: T;
  validationSchema: Record<keyof T, FieldConfig>;
  onSubmit: (data: T) => Promise<void>;
  enableRealTimeValidation?: boolean;
  autosave?: {
    enabled: boolean;
    interval?: number;
    key: string;
  };
}

interface FormState<T> {
  data: T;
  errors: Record<string, string>;
  warnings: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  lastSaved?: Date;
}

export function useFormValidation<T extends Record<string, any>>({
  initialData,
  validationSchema,
  onSubmit,
  enableRealTimeValidation = true,
  autosave
}: UseFormValidationProps<T>) {
  
  // Estado principal do formulário
  const [formState, setFormState] = useState<FormState<T>>({
    data: initialData,
    errors: {},
    warnings: {},
    touched: {},
    isSubmitting: false,
    isValid: false,
    isDirty: false
  });

  // Refs para controle de timing
  const validationTimeoutRef = useRef<NodeJS.Timeout>();
  const autosaveTimeoutRef = useRef<NodeJS.Timeout>();
  const initialDataRef = useRef(initialData);

  // Carregar dados salvos automaticamente se disponível
  useEffect(() => {
    if (autosave?.enabled && autosave.key) {
      const savedData = localStorage.getItem(`autosave_${autosave.key}`);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setFormState(prev => ({
            ...prev,
            data: { ...initialData, ...parsed },
            isDirty: true
          }));
          toast.info('Dados recuperados do salvamento automático');
        } catch (error) {
          console.warn('Erro ao carregar dados salvos:', error);
        }
      }
    }
  }, [autosave?.enabled, autosave?.key, initialData]);

  // Validação em tempo real
  const performValidation = useCallback((data: T, showErrors = true) => {
    const result = validateForm(data, validationSchema);
    
    if (showErrors) {
      setFormState(prev => ({
        ...prev,
        errors: result.errors,
        warnings: result.warnings,
        isValid: result.isValid
      }));
    }
    
    return result;
  }, [validationSchema]);

  // Verificar se dados mudaram
  const checkIfDirty = useCallback((data: T) => {
    return JSON.stringify(data) !== JSON.stringify(initialDataRef.current);
  }, []);

  // Atualizar campo específico
  const updateField = useCallback((field: keyof T, value: any) => {
    setFormState(prev => {
      const newData = { ...prev.data, [field]: value };
      const isDirty = checkIfDirty(newData);
      
      // Marcar campo como tocado
      const newTouched = { ...prev.touched, [field]: true };
      
      let newErrors = { ...prev.errors };
      let newWarnings = { ...prev.warnings };
      
      // Validação em tempo real para campo específico
      if (enableRealTimeValidation && newTouched[field as string]) {
        const fieldConfig = validationSchema[field];
        if (fieldConfig) {
          const fieldResult = validateField(value, fieldConfig, newData);
          
          if (fieldResult.error) {
            newErrors[field as string] = fieldResult.error;
          } else {
            delete newErrors[field as string];
          }
          
          if (fieldResult.warning) {
            newWarnings[field as string] = fieldResult.warning;
          } else {
            delete newWarnings[field as string];
          }
        }
      }
      
      const newState = {
        ...prev,
        data: newData,
        touched: newTouched,
        errors: newErrors,
        warnings: newWarnings,
        isDirty,
        isValid: Object.keys(newErrors).length === 0
      };

      // Autosave após delay
      if (autosave?.enabled && isDirty) {
        clearTimeout(autosaveTimeoutRef.current);
        autosaveTimeoutRef.current = setTimeout(() => {
          localStorage.setItem(`autosave_${autosave.key}`, JSON.stringify(newData));
          setFormState(currentState => ({
            ...currentState,
            lastSaved: new Date()
          }));
        }, autosave.interval || 3000);
      }
      
      return newState;
    });
  }, [enableRealTimeValidation, validationSchema, checkIfDirty, autosave]);

  // Atualizar múltiplos campos
  const updateFields = useCallback((updates: Partial<T>) => {
    setFormState(prev => {
      const newData = { ...prev.data, ...updates };
      const isDirty = checkIfDirty(newData);
      
      // Marcar campos como tocados
      const newTouched = { ...prev.touched };
      Object.keys(updates).forEach(key => {
        newTouched[key] = true;
      });
      
      return {
        ...prev,
        data: newData,
        touched: newTouched,
        isDirty
      };
    });
  }, [checkIfDirty]);

  // Validar formulário completo
  const validateAll = useCallback(() => {
    const result = performValidation(formState.data);
    
    // Marcar todos os campos como tocados
    const allTouched: Record<string, boolean> = {};
    Object.keys(validationSchema).forEach(key => {
      allTouched[key] = true;
    });
    
    setFormState(prev => ({
      ...prev,
      touched: allTouched,
      errors: result.errors,
      warnings: result.warnings,
      isValid: result.isValid
    }));
    
    return result.isValid;
  }, [formState.data, performValidation, validationSchema]);

  // Submeter formulário
  const handleSubmit = useCallback(async (event?: React.FormEvent) => {
    if (event) {
      event.preventDefault();
    }
    
    // Validar antes de submeter
    const isValid = validateAll();
    if (!isValid) {
      toast.error('Por favor, corrija os erros antes de continuar');
      
      // Focar no primeiro campo com erro
      const firstErrorField = Object.keys(formState.errors)[0];
      if (firstErrorField) {
        const element = document.getElementById(firstErrorField);
        if (element) {
          element.focus();
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      
      return false;
    }
    
    setFormState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      await onSubmit(formState.data);
      
      // Limpar autosave após sucesso
      if (autosave?.enabled && autosave.key) {
        localStorage.removeItem(`autosave_${autosave.key}`);
      }
      
      // Resetar estado dirty
      setFormState(prev => ({
        ...prev,
        isDirty: false,
        isSubmitting: false
      }));
      
      // Atualizar dados iniciais para comparação
      initialDataRef.current = formState.data;
      
      return true;
      
    } catch (error) {
      const errorMessage = formatAPIError(error);
      toast.error(errorMessage);
      
      setFormState(prev => ({ ...prev, isSubmitting: false }));
      return false;
    }
  }, [validateAll, formState.data, formState.errors, onSubmit, autosave]);

  // Resetar formulário
  const reset = useCallback((newData?: Partial<T>) => {
    const resetData = newData ? { ...initialData, ...newData } : initialData;
    
    setFormState({
      data: resetData,
      errors: {},
      warnings: {},
      touched: {},
      isSubmitting: false,
      isValid: false,
      isDirty: false
    });
    
    // Limpar autosave
    if (autosave?.enabled && autosave.key) {
      localStorage.removeItem(`autosave_${autosave.key}`);
    }
    
    initialDataRef.current = resetData;
  }, [initialData, autosave]);

  // Obter props para campo
  const getFieldProps = useCallback((field: keyof T) => {
    return {
      id: field as string,
      name: field as string,
      value: formState.data[field] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        updateField(field, e.target.value);
      },
      onBlur: () => {
        // Validar campo quando perder foco
        if (enableRealTimeValidation) {
          const fieldConfig = validationSchema[field];
          if (fieldConfig) {
            const fieldResult = validateField(formState.data[field], fieldConfig, formState.data);
            
            setFormState(prev => ({
              ...prev,
              touched: { ...prev.touched, [field]: true },
              errors: {
                ...prev.errors,
                ...(fieldResult.error ? { [field]: fieldResult.error } : {})
              },
              warnings: {
                ...prev.warnings,
                ...(fieldResult.warning ? { [field]: fieldResult.warning } : {})
              }
            }));
          }
        }
      },
      'aria-invalid': formState.errors[field as string] ? 'true' : 'false',
      'aria-describedby': formState.errors[field as string] ? `${field as string}-error` : undefined
    };
  }, [formState.data, formState.errors, updateField, enableRealTimeValidation, validationSchema]);

  // Obter status do campo
  const getFieldStatus = useCallback((field: keyof T) => {
    const error = formState.errors[field as string];
    const warning = formState.warnings[field as string];
    const touched = formState.touched[field as string];
    
    return {
      error,
      warning,
      touched,
      hasError: !!error,
      hasWarning: !!warning,
      isValid: touched && !error
    };
  }, [formState.errors, formState.warnings, formState.touched]);

  // Verificar se pode sair da página
  const checkUnsavedChanges = useCallback(() => {
    if (formState.isDirty) {
      return window.confirm(
        'Você tem alterações não salvas. Deseja realmente sair desta página?'
      );
    }
    return true;
  }, [formState.isDirty]);

  // Effect para avisar sobre mudanças não salvas
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (formState.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearTimeout(validationTimeoutRef.current);
      clearTimeout(autosaveTimeoutRef.current);
    };
  }, [formState.isDirty]);

  return {
    // Estado
    formData: formState.data,
    errors: formState.errors,
    warnings: formState.warnings,
    touched: formState.touched,
    isSubmitting: formState.isSubmitting,
    isValid: formState.isValid,
    isDirty: formState.isDirty,
    lastSaved: formState.lastSaved,
    
    // Ações
    updateField,
    updateFields,
    handleSubmit,
    reset,
    validateAll,
    
    // Utilitários
    getFieldProps,
    getFieldStatus,
    checkUnsavedChanges,
    
    // Validação manual
    validateField: (field: keyof T, value: any) => {
      const fieldConfig = validationSchema[field];
      return fieldConfig ? validateField(value, fieldConfig, formState.data) : {};
    }
  };
}

export default useFormValidation;
