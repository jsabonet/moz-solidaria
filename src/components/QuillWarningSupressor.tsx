import { useEffect } from 'react';

// Supressor para warnings e erros relacionados ao React Quill e eventos de DOM obsoletos
let warningsSuppressed = false;

const suppressQuillWarnings = (): void => {
  if (warningsSuppressed) return;

  // Interceptar console.warn apenas para mensagens específicas do Quill
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const message = String(args[0] || '');
    if (
      message.includes('findDOMNode') ||
      message.includes('DOMNodeInserted') ||
      message.includes('mutation event') ||
      message.includes('MutationEvent') ||
      message.includes('Support for this event type has been removed')
    ) {
      return; // Filtrar apenas estes warnings específicos
    }
    originalWarn.apply(console, args);
  };

  // Interceptar console.error apenas para erros específicos do Quill
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const message = String(args[0] || '');
    if (
      message.includes('findDOMNode') ||
      message.includes('DOMNodeInserted') ||
      message.includes('mutation event') ||
      message.includes('MutationEvent')
    ) {
      return; // Filtrar apenas estes erros específicos
    }
    originalError.apply(console, args);
  };

  warningsSuppressed = true;
};

// Aplicar supressão apenas quando necessário
if (typeof window !== 'undefined') {
  suppressQuillWarnings();
}

const QuillWarningSupressor: React.FC = () => {
  useEffect(() => {
    suppressQuillWarnings();
  }, []);

  return null;
};

export default QuillWarningSupressor;
