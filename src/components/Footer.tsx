import { Heart, MapPin, Mail, Phone, Facebook, Instagram, Twitter } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-mozambique-black text-white">
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
            <p className="text-sm text-gray-300 leading-relaxed">
              Organização humanitária sem fins lucrativos, movida pelo princípio do amor ao próximo, 
              atuando no apoio a comunidades afetadas por conflitos, pobreza e desastres naturais em Cabo Delgado.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-solidarity-blue transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-solidarity-blue transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-solidarity-blue transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><Link to="/sobre" className="text-gray-300 hover:text-white transition-colors">Sobre Nós</Link></li>
              <li><Link to="/programas" className="text-gray-300 hover:text-white transition-colors">Áreas de Atuação</Link></li>
              <li><Link to="/doacao" className="text-gray-300 hover:text-white transition-colors">Fazer Doação</Link></li>
              <li><Link to="/blog" className="text-gray-300 hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/contacto" className="text-gray-300 hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>

          {/* Áreas de Atuação */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Áreas de Atuação</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-300">Apoio Humanitário</span></li>
              <li><span className="text-gray-300">Formação e Capacitação Juvenil</span></li>
              <li><span className="text-gray-300">Saúde Pública e Prevenção</span></li>
              <li><span className="text-gray-300">Apoio Psicológico e Social</span></li>
              <li><span className="text-gray-300">Direitos Humanos e Cidadania</span></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-solidarity-blue mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm">
                  Av. Samora Machel, Bairro Unidade, Mocímboa da Praia – Cabo Delgado, Moçambique
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-solidarity-blue flex-shrink-0" />
                <span className="text-gray-300 text-sm">ajuda@mozsolidaria.org</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-solidarity-blue flex-shrink-0" />
                <span className="text-gray-300 text-sm">+258 84 204 0330 / +258 86 204 0330</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm flex items-center justify-center space-x-1">
            <span>© 2025 Moz Solidária - "Unidos pela mesma causa"</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;