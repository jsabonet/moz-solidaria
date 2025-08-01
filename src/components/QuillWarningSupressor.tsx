import { useEffect } from 'react';

// Supressor para warnings e erros relacionados ao React Quill e eventos de DOM obsoletos
let warningsSuppressed = false;

const suppressQuillWarnings = (): void => {
  if (warningsSuppressed) return;

  // Interceptar console.warn
  const originalWarn = console.warn;
  console.warn = (...args: unknown[]) => {
    const message = String(args[0] || '');
    if (
      message.includes('findDOMNode') ||
      message.includes('DOMNodeInserted') ||
      message.includes('mutation event') ||
      message.includes('MutationEvent') ||
      message.includes('Support for this event type has been removed') ||
      (message.includes('deprecated') && message.includes('ReactDOM'))
    ) {
      return; // Filtrar completamente estes warnings
    }
    originalWarn.apply(console, args);
  };

  // Interceptar console.error
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    const message = String(args[0] || '');
    if (
      message.includes('findDOMNode') ||
      message.includes('DOMNodeInserted') ||
      message.includes('mutation event') ||
      message.includes('MutationEvent')
    ) {
      return; // Filtrar completamente estes erros
    }
    originalError.apply(console, args);
  };

  // Interceptar window.addEventListener para eventos obsoletos
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    if (type === 'DOMNodeInserted' || type === 'DOMNodeRemoved') {
      return; // Ignorar tentativas de adicionar listeners para eventos obsoletos
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  warningsSuppressed = true;
};

// Aplicar supressão imediatamente quando o módulo for carregado
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
