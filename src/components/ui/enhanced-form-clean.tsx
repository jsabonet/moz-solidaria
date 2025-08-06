// src/components/ui/enhanced-form.tsx
// Componentes de formulário melhorados com validação integrada

import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  AlertCircle, 
  CheckCircle, 
  Info, 
  HelpCircle,
  Eye,
  EyeOff 
} from 'lucide-react';

// Interfaces
interface FieldWrapperProps {
  children: React.ReactNode;
  error?: string;
  warning?: string;
  success?: string;
  helpText?: string;
  className?: string;
  showOptional?: boolean;
}

interface EnhancedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  warning?: string;
  success?: string;
  helpText?: string;
  showCharCount?: boolean;
  maxLength?: number;
  icon?: React.ReactNode;
  showOptional?: boolean;
}

interface EnhancedTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  warning?: string;
  success?: string;
  helpText?: string;
  showCharCount?: boolean;
  showWordCount?: boolean;
  maxLength?: number;
  minRows?: number;
  maxRows?: number;
  showOptional?: boolean;
}

interface EnhancedSelectProps {
  id?: string;
  label?: string;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  error?: string;
  warning?: string;
  success?: string;
  helpText?: string;
  disabled?: boolean;
  className?: string;
  showOptional?: boolean;
}

interface FormProgressProps {
  steps: string[];
  currentStep: number;
  completedSteps?: number[];
  className?: string;
}

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

interface ValidationSummaryProps {
  errors: Record<string, string>;
  warnings?: Record<string, string>;
  className?: string;
}

// FieldWrapper Component
const FieldWrapper: React.FC<FieldWrapperProps> = ({
  children,
  error,
  warning,
  success,
  helpText,
  className,
  showOptional = false
}) => {
  return (
    <div className={cn('space-y-2', className)}>
      {children}
      
      {/* Status Messages */}
      {error && (
        <div className="flex items-center gap-1 text-sm text-destructive">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {warning && !error && (
        <div className="flex items-center gap-1 text-sm text-yellow-600">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{warning}</span>
        </div>
      )}
      
      {success && !error && !warning && (
        <div className="flex items-center gap-1 text-sm text-green-600">
          <CheckCircle className="h-3 w-3 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}
      
      {helpText && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Info className="h-3 w-3 flex-shrink-0" />
          <span>{helpText}</span>
        </div>
      )}
      
      {showOptional && (
        <span className="text-xs text-muted-foreground">(Opcional)</span>
      )}
    </div>
  );
};

// EnhancedInput Component
const EnhancedInput: React.FC<EnhancedInputProps> = ({
  label,
  error,
  warning,
  success,
  helpText,
  showCharCount = false,
  maxLength,
  icon,
  showOptional = false,
  className,
  ...props
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const isPassword = props.type === 'password';
  const currentLength = props.value?.toString().length || 0;

  return (
    <FieldWrapper
      error={error}
      warning={warning}
      success={success}
      helpText={helpText}
      showOptional={showOptional}
    >
      {label && (
        <Label htmlFor={props.id} className="text-sm font-medium">
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        
        <Input
          {...props}
          type={isPassword && showPassword ? 'text' : props.type}
          maxLength={maxLength}
          className={cn(
            icon && 'pl-10',
            isPassword && 'pr-10',
            error && 'border-destructive focus:border-destructive',
            warning && !error && 'border-yellow-500 focus:border-yellow-500',
            success && !error && !warning && 'border-green-500 focus:border-green-500',
            className
          )}
        />
        
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      
      {showCharCount && maxLength && (
        <div className="text-right">
          <span className={cn(
            'text-xs',
            currentLength > maxLength * 0.9 ? 'text-yellow-600' : 'text-muted-foreground',
            currentLength >= maxLength ? 'text-destructive' : ''
          )}>
            {currentLength}/{maxLength}
          </span>
        </div>
      )}
    </FieldWrapper>
  );
};

// EnhancedTextarea Component
const EnhancedTextarea: React.FC<EnhancedTextareaProps> = ({
  label,
  error,
  warning,
  success,
  helpText,
  showCharCount = false,
  showWordCount = false,
  maxLength,
  minRows = 3,
  maxRows = 10,
  showOptional = false,
  className,
  ...props
}) => {
  const currentLength = props.value?.toString().length || 0;
  const wordCount = props.value?.toString().split(/\s+/).filter(word => word.length > 0).length || 0;

  return (
    <FieldWrapper
      error={error}
      warning={warning}
      success={success}
      helpText={helpText}
      showOptional={showOptional}
    >
      {label && (
        <Label htmlFor={props.id} className="text-sm font-medium">
          {label}
          {props.required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      
      <Textarea
        {...props}
        maxLength={maxLength}
        rows={minRows}
        className={cn(
          'resize-none',
          error && 'border-destructive focus:border-destructive',
          warning && !error && 'border-yellow-500 focus:border-yellow-500',
          success && !error && !warning && 'border-green-500 focus:border-green-500',
          className
        )}
        style={{
          minHeight: `${minRows * 1.5}rem`,
          maxHeight: `${maxRows * 1.5}rem`
        }}
      />
      
      {(showCharCount || showWordCount) && (
        <div className="flex justify-between text-xs">
          {showWordCount && (
            <span className="text-muted-foreground">
              {wordCount} palavra{wordCount !== 1 ? 's' : ''}
            </span>
          )}
          
          {showCharCount && maxLength && (
            <span className={cn(
              currentLength > maxLength * 0.9 ? 'text-yellow-600' : 'text-muted-foreground',
              currentLength >= maxLength ? 'text-destructive' : ''
            )}>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>
      )}
    </FieldWrapper>
  );
};

// EnhancedSelect Component
const EnhancedSelect: React.FC<EnhancedSelectProps> = ({
  id,
  label,
  placeholder,
  value,
  onValueChange,
  options,
  error,
  warning,
  success,
  helpText,
  disabled = false,
  className,
  showOptional = false
}) => {
  return (
    <FieldWrapper
      error={error}
      warning={warning}
      success={success}
      helpText={helpText}
      showOptional={showOptional}
    >
      {label && (
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
      )}
      
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger 
          id={id}
          className={cn(
            error && 'border-destructive focus:border-destructive',
            warning && !error && 'border-yellow-500 focus:border-yellow-500',
            success && !error && !warning && 'border-green-500 focus:border-green-500',
            className
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FieldWrapper>
  );
};

// FormProgress Component
const FormProgress: React.FC<FormProgressProps> = ({
  steps,
  currentStep,
  completedSteps = [],
  className
}) => {
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Progresso do Formulário</h3>
        <span className="text-sm text-muted-foreground">
          {currentStep + 1} de {steps.length}
        </span>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="flex justify-between text-xs">
        {steps.map((step, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center gap-1',
              index === currentStep && 'text-primary font-medium',
              completedSteps.includes(index) && 'text-green-600',
              index > currentStep && 'text-muted-foreground'
            )}
          >
            <div className={cn(
              'w-2 h-2 rounded-full',
              index === currentStep && 'bg-primary',
              completedSteps.includes(index) && 'bg-green-600',
              index > currentStep && 'bg-muted'
            )} />
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// FormSection Component
const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  icon,
  children,
  className
}) => {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon && icon}
          {title}
        </CardTitle>
        {description && (
          <CardDescription>{description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

// ValidationSummary Component
const ValidationSummary: React.FC<ValidationSummaryProps> = ({
  errors,
  warnings = {},
  className
}) => {
  const errorCount = Object.keys(errors).length;
  const warningCount = Object.keys(warnings).length;

  if (errorCount === 0 && warningCount === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {errorCount > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">
              {errorCount} erro{errorCount > 1 ? 's' : ''} encontrado{errorCount > 1 ? 's' : ''}:
            </div>
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field} className="text-sm">{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {warningCount > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">
              {warningCount} aviso{warningCount > 1 ? 's' : ''}:
            </div>
            <ul className="list-disc list-inside space-y-1">
              {Object.entries(warnings).map(([field, warning]) => (
                <li key={field} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export {
  FieldWrapper,
  EnhancedInput,
  EnhancedTextarea,
  EnhancedSelect,
  FormProgress,
  FormSection,
  ValidationSummary
};
