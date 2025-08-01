import React from 'react';
import { ExternalLink, Camera, User } from 'lucide-react';

interface ImageWithCreditProps {
  src: string;
  alt: string;
  caption?: string;
  credit?: string;
  photographer?: string;
  sourceUrl?: string;
  className?: string;
}

const ImageWithCredit: React.FC<ImageWithCreditProps> = ({
  src,
  alt,
  caption,
  credit,
  photographer,
  sourceUrl,
  className = "",
}) => {
  const hasCredits = caption || credit || photographer;

  return (
    <figure className={`relative group overflow-hidden rounded-lg shadow-lg ${className}`}>
      <img 
        src={src} 
        alt={alt}
        className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
      />
      
      {/* Overlay gradiente sutil */}
      {hasCredits && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      
      {/* Legenda posicionada sobre a imagem */}
      {hasCredits && (
        <figcaption className="absolute bottom-0 right-0 left-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
          <div className="bg-black/75 backdrop-blur-sm rounded-lg p-3 ml-auto max-w-sm">
            {caption && (
              <p className="text-white text-sm font-medium leading-relaxed mb-2">
                {caption}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/90">
              {photographer && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span>{photographer}</span>
                </div>
              )}
              
              {credit && (
                <div className="flex items-center gap-1">
                  <Camera className="h-3 w-3" />
                  <span>{credit}</span>
                </div>
              )}
              
              {sourceUrl && (
                <a 
                  href={sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Fonte</span>
                </a>
              )}
            </div>
          </div>
        </figcaption>
      )}
      
      {/* Indicador de créditos disponíveis */}
      {hasCredits && (
        <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm rounded-full p-2 opacity-70 group-hover:opacity-0 transition-opacity duration-300">
          <Camera className="h-4 w-4 text-white" />
        </div>
      )}
    </figure>
  );
};

export default ImageWithCredit;
