import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated, isStaff } = useAuth();

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
            
            {/* Dashboard - apenas para administradores */}
            {isAuthenticated && isStaff && (
              <Link to="/dashboard">
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  Dashboard
                </Button>
              </Link>
            )}

            {/* Portal de Comunidade - apenas para usuários não-admin */}
            {isAuthenticated && !isStaff && (
              <Link to="/client-area">
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  Portal de Comunidade
                </Button>
              </Link>
            )}

            {/* Login/Logout */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {/* Portal de Comunidade - apenas para usuários não-admin */}
                  {!isStaff && (
                    <DropdownMenuItem asChild>
                      <Link to="/client-area">Portal de Comunidade</Link>
                    </DropdownMenuItem>
                  )}
                  {/* Dashboard - apenas para administradores */}
                  {isStaff && (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button 
                  variant="outline" 
                  size="sm"
                >
                  <User className="h-4 w-4 mr-2" />
                  Entrar
                </Button>
              </Link>
            )}
            
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
              
              {/* Dashboard para mobile - apenas usuários autenticados */}
              {isAuthenticated && (
                <div className="px-3 py-2 space-y-2">
                  <Link to="/client-area" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                    >
                      Portal de Comunidade
                    </Button>
                  </Link>
                  {isStaff && (
                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full"
                      >
                        Dashboard
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {/* Login/Logout para mobile */}
              <div className="px-3 py-2">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Olá, {user?.username}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </Button>
                  </div>
                ) : (
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="w-full mb-2"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Entrar
                    </Button>
                  </Link>
                )}
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