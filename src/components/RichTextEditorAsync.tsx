import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Maximize2, Minimize2, X, Image as ImageIcon, Info } from 'lucide-react';
import ImageCreditModal from '@/components/ImageCreditModal';
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
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(-1);
  const quillRef = useRef<any>(null);

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

  // Custom image handler
  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          // Upload da imagem
          const { imageUploadService } = await import('@/lib/imageUpload');
          const result = await imageUploadService.upload(file);
          
          // Inserir imagem no editor
          const quill = quillRef.current?.getEditor();
          if (quill) {
            const range = quill.getSelection();
            quill.insertEmbed(range?.index || 0, 'image', result.url);
            
            // Abrir modal para adicionar créditos
            setSelectedImageUrl(result.url);
            setSelectedImageIndex(range?.index || 0);
            setShowImageModal(true);
          }
        } catch (error) {
          console.error('Erro no upload da imagem:', error);
          alert('Erro ao fazer upload da imagem. Tente novamente.');
        }
      }
    };
  }, []);

  // Configuração do toolbar com handler customizado para imagem
  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }, { 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['link', 'image', 'video'],
        ['clean'],
        ['image-credit'] // Botão customizado para gerenciar créditos
      ],
      handlers: {
        image: imageHandler,
        'image-credit': () => {
          // Handler para gerenciar créditos de imagens existentes
          handleImageCreditManagement();
        }
      }
    },
    clipboard: {
      matchVisual: false,
    }
  }), [imageHandler]);

  const formats = [
    'header', 'font', 'size', 'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
    'color', 'background', 'script', 'list', 'bullet', 'indent', 'align',
    'link', 'image', 'video'
  ];

  const handleChange = useCallback((content: string) => {
    onChange(content);
  }, [onChange]);

  const handleImageCreditManagement = useCallback(() => {
    // Encontrar todas as imagens no conteúdo atual
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = value;
    const images = tempDiv.querySelectorAll('img');
    
    if (images.length === 0) {
      alert('Nenhuma imagem encontrada no conteúdo para adicionar créditos.');
      return;
    }
    
    // Para simplicidade, vamos pegar a primeira imagem
    const firstImage = images[0];
    setSelectedImageUrl(firstImage.src);
    setShowImageModal(true);
  }, [value]);

  const handleSaveImageCredit = useCallback((creditData: any) => {
    if (!selectedImageUrl) return;
    
    // Encontrar a imagem no conteúdo e adicionar atributos de crédito
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = value;
    const images = tempDiv.querySelectorAll('img');
    
    for (let img of images) {
      if (img.src === selectedImageUrl) {
        // Adicionar dados de crédito como atributos data-*
        img.setAttribute('data-caption', creditData.caption || '');
        img.setAttribute('data-credit', creditData.credit || '');
        img.setAttribute('data-photographer', creditData.photographer || '');
        img.setAttribute('data-source-url', creditData.sourceUrl || '');
        img.setAttribute('data-license', creditData.licenseType || '');
        img.setAttribute('alt', creditData.altText || creditData.caption || '');
        
        // Adicionar classe para identificar imagens com créditos
        img.classList.add('image-with-credit');
        
        // Envolver a imagem em uma figure com figcaption se houver legenda
        if (creditData.caption || creditData.credit) {
          const figure = document.createElement('figure');
          figure.className = 'image-figure';
          
          const figcaption = document.createElement('figcaption');
          figcaption.className = 'image-caption';
          
          let captionText = '';
          if (creditData.caption) {
            captionText += creditData.caption;
          }
          if (creditData.credit) {
            captionText += (captionText ? ' | ' : '') + `📸 ${creditData.credit}`;
          }
          if (creditData.photographer) {
            captionText += (captionText ? ' | ' : '') + creditData.photographer;
          }
          
          figcaption.innerHTML = captionText;
          
          // Substituir img por figure>img+figcaption
          const parent = img.parentNode;
          figure.appendChild(img.cloneNode(true));
          figure.appendChild(figcaption);
          parent?.replaceChild(figure, img);
        }
        
        break;
      }
    }
    
    // Atualizar o conteúdo
    onChange(tempDiv.innerHTML);
    setShowImageModal(false);
    setSelectedImageUrl('');
  }, [selectedImageUrl, value, onChange]);

  const handleCloseModal = useCallback(() => {
    setShowImageModal(false);
    setSelectedImageUrl('');
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Adicionar CSS customizado para as figuras
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .ql-editor .image-figure {
        margin: 1rem 0;
        text-align: center;
      }
      
      .ql-editor .image-figure img {
        max-width: 100%;
        height: auto;
        border-radius: 0.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      
      .ql-editor .image-caption {
        margin-top: 0.5rem;
        font-size: 0.875rem;
        color: #6b7280;
        font-style: italic;
        padding: 0.25rem 0.5rem;
        background: #f9fafb;
        border-radius: 0.25rem;
        display: inline-block;
      }
      
      .ql-editor .image-with-credit {
        border: 2px solid #3b82f6;
        border-radius: 0.5rem;
      }
      
      /* Botão customizado na toolbar */
      .ql-toolbar .ql-image-credit:after {
        content: '🖼️';
        font-size: 14px;
      }
      
      .ql-toolbar .ql-image-credit {
        width: 28px;
        height: 24px;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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
        ref={quillRef}
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
            <Button
              variant="outline"
              size="sm"
              onClick={handleImageCreditManagement}
              className="flex items-center space-x-1"
            >
              <Info className="h-4 w-4" />
              <span>Gerenciar Créditos</span>
            </Button>
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
    <>
      <div className="rich-text-editor">
        {label && (
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor={id}>
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleImageCreditManagement}
                className="flex items-center space-x-1"
              >
                <Info className="h-3 w-3" />
                <span className="hidden sm:inline text-xs">Créditos</span>
              </Button>
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

      {/* Modal para créditos de imagem */}
      <ImageCreditModal
        isOpen={showImageModal}
        onClose={handleCloseModal}
        onSave={handleSaveImageCredit}
        imageUrl={selectedImageUrl}
      />
    </>
  );
};

export default RichTextEditor;