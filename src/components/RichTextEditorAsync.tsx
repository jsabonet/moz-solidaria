import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, X } from 'lucide-react';
import './RichTextEditor.css';

// Dynamic import para React Quill
const ReactQuill = React.lazy(() => {
  // Suprimir warnings antes de carregar o Quill
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const message = args.join(' ');
    if (
      message.includes('findDOMNode') ||
      message.includes('DOMNodeInserted') ||
      message.includes('mutation event') ||
      message.includes('MutationEvent') ||
      message.includes('Support for this event type has been removed')
    ) {
      return;
    }
    originalWarn.apply(console, args);
  };

  // Também intercepta addEventListener para mutation events
  const originalAddEventListener = window.addEventListener;
  interface EventListenerInterceptor {
    (type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  }

  window.addEventListener = function(this: Window, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
    if (type === 'DOMNodeInserted' || type === 'DOMNodeRemoved') {
      return;
    }
    return originalAddEventListener.call(this, type, listener, options);
  } as EventListenerInterceptor;

  return import('react-quill').then(module => {
    // Importar CSS também
    import('react-quill/dist/quill.snow.css');
    return { default: module.default };
  });
});

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  required?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Digite o conteúdo do seu post...",
  label,
  id,
  required = false
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Pre-load React Quill
    const loadQuill = async () => {
      try {
        await import('react-quill');
        setIsLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar React Quill:', error);
      }
    };

    loadQuill();
  }, []);

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  // Configuração do toolbar com suporte avançado (imagem, vídeo, tabela, sub/superscript, indent, font, size)
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  }), []);

  const formats = [
    'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
    'color', 'background', 'script', 'list', 'bullet', 'indent', 'align',
    'link', 'image', 'video'
  ];

  const handleChange = useCallback((content: string) => {
    onChange(content);
  }, [onChange]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Loading state
  if (!isLoaded) {
    return (
      <div className="rich-text-editor">
        {label && (
          <Label htmlFor={id} className="block mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        <div className="quill-wrapper border rounded-md">
          <div className="p-4 text-center text-muted-foreground">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
            Carregando editor...
          </div>
        </div>
      </div>
    );
  }

  const editorContent = (
    <React.Suspense fallback={
      <div className="p-4 text-center text-muted-foreground">
        Carregando editor...
      </div>
    }>
      <ReactQuill
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        theme="snow"
        style={{
          backgroundColor: 'white',
          minHeight: isFullscreen ? 'calc(100vh - 140px)' : '300px',
          height: isFullscreen ? 'calc(100vh - 140px)' : 'auto'
        }}
      />
    </React.Suspense>
  );

  // Fullscreen overlay
  if (isFullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        {/* Fullscreen Header */}
        <div className="flex items-center justify-between p-4 border-b bg-background">
          <div className="flex items-center space-x-4">
            {label && (
              <h2 className="text-lg font-semibold">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </h2>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              className="flex items-center space-x-1"
            >
              <Minimize2 className="h-4 w-4" />
              <span className="hidden sm:inline">Sair do Modo Tela Cheia</span>
              <span className="sm:hidden">Sair</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="flex items-center"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Fullscreen Editor */}
        <div className="flex-1 p-4">
          <div className="quill-wrapper-fullscreen border rounded-md h-full">
            {editorContent}
          </div>
        </div>

        {/* Fullscreen Footer */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {typeof value === "string"
                ? value.replace(/<[^>]*>/g, '').length
                : 0} caracteres
            </span>
            <span>
              {typeof value === "string"
                ? value.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length
                : 0} palavras
            </span>
            <span className="text-primary">
              ESC para sair do modo tela cheia
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Normal mode
  return (
    <div className="rich-text-editor">
      {label && (
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor={id}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="flex items-center space-x-1"
          >
            <Maximize2 className="h-3 w-3" />
            <span className="hidden sm:inline text-xs">Tela Cheia</span>
          </Button>
        </div>
      )}
      
      <div className="quill-wrapper border rounded-md">
        {editorContent}
      </div>
      
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span>
          {typeof value === "string"
            ? value.replace(/<[^>]*>/g, '').length
            : 0} caracteres
        </span>
        <span>
          {typeof value === "string"
            ? value.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length
            : 0} palavras
        </span>
      </div>
    </div>
  );
};

export default RichTextEditor;
