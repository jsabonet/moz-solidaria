import { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { registerUser } from "@/lib/clientAreaApi";
import { Heart, Loader2, User, UserPlus, Users, Building, HandHeart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type UserType = "donor" | "volunteer" | "beneficiary" | "partner";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  
  // Login state
  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });
  
  // Register state
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    userType: "" as UserType | "",
    phone: "",
    address: "",
    description: ""
  });

  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const { login, loading, error, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Redirecionamento após login bem-sucedido
  useEffect(() => {
    console.log('🔍 AuthPage - Estado auth:', { isAuthenticated, user });
    if (isAuthenticated && user) {
      // Verificar se há uma página de redirecionamento nos parâmetros da URL
      const redirectPath = searchParams.get('redirect');
      
      // Verificar se há uma página de origem para redirecionar
      let targetPath = redirectPath || location.state?.from?.pathname;
      
      // Se não há página de origem, definir destino baseado no tipo de usuário
      if (!targetPath) {
        if (user.is_staff || user.is_superuser) {
          targetPath = '/dashboard';
        } else {
          targetPath = '/client-area';
        }
      }
      
      console.log('🚀 AuthPage - Redirecionando para:', targetPath);
      navigate(targetPath, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location.state, searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginData.username, loginData.password);
    } catch (err) {
      // O erro já está sendo gerenciado pelo contexto
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    
    // Validações
    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("As senhas não coincidem");
      return;
    }
    
    if (registerData.password.length < 6) {
      setRegisterError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    if (!registerData.userType) {
      setRegisterError("Por favor, selecione o tipo de perfil");
      return;
    }

    setRegisterLoading(true);
    
    try {
      await registerUser({
        username: registerData.username,
        email: registerData.email,
        password: registerData.password,
        user_type: registerData.userType as UserType,
        full_name: `${registerData.firstName} ${registerData.lastName}`.trim(),
      });
      
      setRegisterSuccess(true);
      setTimeout(() => {
        setActiveTab("login");
        setRegisterSuccess(false);
      }, 3000);
      
    } catch (err: any) {
      setRegisterError(err.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const userTypes = [
    {
      value: "donor",
      label: "Doador",
      description: "Fazer doações para apoiar nossa causa",
      icon: Heart
    },
    {
      value: "volunteer",
      label: "Voluntário",
      description: "Participar ativamente em programas e atividades",
      icon: Users
    },
    {
      value: "beneficiary",
      label: "Beneficiário",
      description: "Receber apoio através dos nossos programas",
      icon: HandHeart
    },
    {
      value: "partner",
      label: "Parceiro",
      description: "Estabelecer parcerias estratégicas",
      icon: Building
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">MOZ SOLIDÁRIA</h1>
            </div>
            <p className="text-muted-foreground">
              Junte-se à nossa comunidade e faça a diferença
            </p>
          </div>

          <Card className="shadow-lg">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Entrar
                </TabsTrigger>
                <TabsTrigger value="register" className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Registar
                </TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <CardHeader>
                  <CardTitle>Fazer Login</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="username">Nome de Usuário</Label>
                      <Input
                        id="username"
                        type="text"
                        value={loginData.username}
                        onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <Input
                        id="password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Entrar
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <CardHeader>
                  <CardTitle>Criar Conta</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    {registerError && (
                      <Alert variant="destructive">
                        <AlertDescription>{registerError}</AlertDescription>
                      </Alert>
                    )}

                    {registerSuccess && (
                      <Alert className="border-green-200 bg-green-50">
                        <AlertDescription className="text-green-800">
                          Conta criada com sucesso! Redirecionando para o login...
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Tipo de Usuário */}
                    <div className="space-y-2">
                      <Label>Tipo de Perfil</Label>
                      <Select 
                        value={registerData.userType} 
                        onValueChange={(value: UserType) => setRegisterData({...registerData, userType: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de perfil" />
                        </SelectTrigger>
                        <SelectContent>
                          {userTypes.map((type) => {
                            const Icon = type.icon;
                            return (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="h-4 w-4" />
                                  <div>
                                    <div className="font-medium">{type.label}</div>
                                    <div className="text-xs text-muted-foreground">{type.description}</div>
                                  </div>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dados Pessoais */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Nome</Label>
                        <Input
                          id="firstName"
                          value={registerData.firstName}
                          onChange={(e) => setRegisterData({...registerData, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Sobrenome</Label>
                        <Input
                          id="lastName"
                          value={registerData.lastName}
                          onChange={(e) => setRegisterData({...registerData, lastName: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="regUsername">Nome de Usuário</Label>
                      <Input
                        id="regUsername"
                        value={registerData.username}
                        onChange={(e) => setRegisterData({...registerData, username: e.target.value})}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={registerData.phone}
                        onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={registerData.address}
                        onChange={(e) => setRegisterData({...registerData, address: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="regPassword">Senha</Label>
                        <Input
                          id="regPassword"
                          type="password"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={registerData.confirmPassword}
                          onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Apresentação (Opcional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Conte-nos um pouco sobre você e suas motivações..."
                        value={registerData.description}
                        onChange={(e) => setRegisterData({...registerData, description: e.target.value})}
                        rows={3}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={registerLoading}>
                      {registerLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Criar Conta
                    </Button>
                  </form>
                </CardContent>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default AuthPage;
