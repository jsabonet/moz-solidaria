import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActivePage = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { label: "Início", path: "/" },
    { label: "Sobre Nós", path: "/sobre" },
    { label: "Áreas de Atuação", path: "/programas" },
    { label: "Blog", path: "/blog" },
    { label: "Contacto", path: "/contacto" },
  ];

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img 
              src="/logo-moz-solidaria-v2.png" 
              alt="MOZ SOLIDÁRIA Logo" 
              className="h-16 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActivePage(item.path)
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link to="/dashboard">
              <Button 
                variant="outline" 
                size="sm"
              >
                Dashboard
              </Button>
            </Link>
            <Link to="/doacao">
              <Button 
                variant="default" 
                size="sm"
                className="bg-gradient-to-r from-mozambique-red to-solidarity-orange hover:from-solidarity-orange hover:to-mozambique-red transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 pulse-animation"
              >
                💝 Doar Agora
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border/40 bg-background">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block px-3 py-2 text-base font-medium transition-colors hover:text-primary ${
                    isActivePage(item.path)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="px-3 py-2">
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full mb-2"
                  >
                    Dashboard
                  </Button>
                </Link>
              </div>
              <div className="px-3 py-2">
                <Link to="/doacao" onClick={() => setIsMenuOpen(false)}>
                  <Button 
                    variant="default" 
                    size="sm"
                    className="w-full bg-gradient-to-r from-mozambique-red to-solidarity-orange hover:from-solidarity-orange hover:to-mozambique-red transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    💝 Doar Agora
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;