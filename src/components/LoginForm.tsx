// src/components/LoginForm.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { Heart, Loader2, Eye, EyeOff } from "lucide-react";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, loading, error, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirecionamento após login bem-sucedido
  useEffect(() => {
    if (isAuthenticated && user) {
      // Verificar se há uma página de origem para redirecionar
      let targetPath = location.state?.from?.pathname;
      
      // Se não há página de origem, definir destino baseado no tipo de usuário
      if (!targetPath) {
        if (user.is_staff || user.is_superuser) {
          targetPath = '/dashboard';
        } else {
          targetPath = '/client-area';
        }
      }
      
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      // O redirecionamento será feito pelo useEffect acima
    } catch (err) {
      // O erro já está sendo gerenciado pelo contexto
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">MOZ SOLIDÁRIA</h1>
          </div>
          <CardTitle className="text-xl">Acesso ao Dashboard</CardTitle>
          <p className="text-muted-foreground">
            Entre com suas credenciais para acessar o painel administrativo
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                placeholder="Digite seu usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Credenciais padrão:</p>
            <p>Usuário: <strong>admin</strong></p>
            <p>Senha: <strong>admin123</strong></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
