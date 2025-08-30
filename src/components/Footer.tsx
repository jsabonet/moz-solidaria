import { Heart, MapPin, Mail, Phone, Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-800 text-white">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Missão */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo-moz-solidaria-v2.png" 
                alt="MOZ SOLIDÁRIA Logo" 
                className="h-8 w-auto"
              />
            </div>
            <p className="text-sm text-white/90 leading-relaxed">
              Organização humanitária sem fins lucrativos, movida pelo princípio do amor ao próximo, 
              atuando no apoio a comunidades afetadas por conflitos, pobreza e desastres naturais em Cabo Delgado.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><Link to="/sobre" className="text-white/90 hover:text-white transition-colors">Sobre Nós</Link></li>
              <li><Link to="/programas" className="text-white/90 hover:text-white transition-colors">Áreas de Atuação</Link></li>
              <li><Link to="/doacao" className="text-white/90 hover:text-white transition-colors">Fazer Doação</Link></li>
              <li><Link to="/blog" className="text-white/90 hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/contacto" className="text-white/90 hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Informações Legais */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Informações Legais</h3>
            <ul className="space-y-2">
              <li><Link to="/politica-privacidade" className="text-white/90 hover:text-white transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/termos-uso" className="text-white/90 hover:text-white transition-colors">Termos de Uso</Link></li>
              <li><Link to="/transparencia" className="text-white/90 hover:text-white transition-colors">Transparência</Link></li>
              <li><span className="text-white/90">Prestação de Contas</span></li>
              <li><span className="text-white/90">Código de Conduta</span></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-white mt-0.5 flex-shrink-0" />
                <span className="text-white/90 text-sm">
                  Av. Samora Machel, Bairro Unidade, Mocímboa da Praia – Cabo Delgado, Moçambique
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-white flex-shrink-0" />
                <span className="text-white/90 text-sm">ajuda@mozsolidaria.org</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-white flex-shrink-0" />
                <span className="text-white/90 text-sm">+258 84 204 0330 / +258 86 204 0330</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/80 text-sm flex items-center space-x-1">
              <span>© 2025 Moz Solidária - "Unidos pela mesma causa"</span>
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <Link to="/politica-privacidade" className="text-white/70 hover:text-white transition-colors">
                Política de Privacidade
              </Link>
              <span className="text-white/50">•</span>
              <Link to="/termos-uso" className="text-white/70 hover:text-white transition-colors">
                Termos de Uso
              </Link>
              <span className="text-white/50">•</span>
              <Link to="/transparencia" className="text-white/70 hover:text-white transition-colors">
                Transparência
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;