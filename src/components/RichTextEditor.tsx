import React, { useCallback, useMemo } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Label } from '@/components/ui/label';
import QuillWarningSupressor from './QuillWarningSupressor';
import './RichTextEditor.css';

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
  // Configuração simplificada do toolbar para evitar warnings
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'blockquote', 'code-block'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  }), []);

  // Formatos suportados
  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'link', 'color', 'background', 'align', 'code-block'
  ];

  // Handler otimizado
  const handleChange = useCallback((content: string) => {
    onChange(content);
  }, [onChange]);

  return (
    <>
      <QuillWarningSupressor />
      <div className="rich-text-editor">
        {label && (
          <Label htmlFor={id} className="block mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        )}
        
        <div className="quill-wrapper border rounded-md">
          <ReactQuill
            value={value}
            onChange={handleChange}
            modules={modules}
            formats={formats}
            placeholder={placeholder}
            theme="snow"
            style={{
              backgroundColor: 'white',
              minHeight: '300px'
            }}
          />
        </div>
        
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{value.replace(/<[^>]*>/g, '').length} caracteres</span>
          <span>{value.replace(/<[^>]*>/g, '').split(/\s+/).filter(word => word.length > 0).length} palavras</span>
        </div>
      </div>
    </>
  );
};

export default RichTextEditor;