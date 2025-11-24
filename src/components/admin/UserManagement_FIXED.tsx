import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getApiBase } from '@/lib/config';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Shield, 
  ShieldCheck, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Crown,
  Settings,
  FileText,
  FolderOpen,
  Eye,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
  groups: (string | { id: number; name: string })[];
  permissions: string[];
}

const UserManagement: React.FC = () => {
  const { user: currentUser, refreshUserData, invalidatePermissionsCache } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Estados para edição de usuário
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    is_staff: false,
    is_superuser: false,
    is_active: true,
    groups: [] as string[],
    permissions: [] as string[]
  });

  const userRoles = [
    { value: 'superuser', label: 'Super Admin', icon: Crown, color: 'bg-purple-100 text-purple-800' },
    { value: 'blog_manager', label: 'Gestor de Blog', icon: FileText, color: 'bg-blue-100 text-blue-800' },
    { value: 'project_manager', label: 'Gestor de Projetos', icon: FolderOpen, color: 'bg-green-100 text-green-800' },
    { value: 'community_manager', label: 'Gestor de Comunidade', icon: Users, color: 'bg-orange-100 text-orange-800' },
    { value: 'viewer', label: 'Visualizador', icon: Eye, color: 'bg-gray-100 text-gray-800' },
    { value: 'staff', label: 'Staff (Legado)', icon: ShieldCheck, color: 'bg-indigo-100 text-indigo-800' },
    { value: 'user', label: 'Usuário', icon: User, color: 'bg-slate-100 text-slate-800' },
    { value: 'inactive', label: 'Inativo', icon: UserX, color: 'bg-red-100 text-red-800' }
  ];

  const availablePermissions = [
    'blog.view_posts',
    'blog.create_post',
    'blog.edit_post',
    'blog.delete_post',
    'projects.view_all',
    'projects.create',
    'projects.edit',
    'projects.delete',
    'projects.manage_categories',
    'community.view_volunteer_list',
    'community.view_beneficiary_list',
    'community.manage_volunteers',
    'community.manage_beneficiaries',
    'donations.view_all',
    'donations.approve',
    'donations.reject',
    'reports.view_all',
    'reports.export_data',
    'system.view_dashboard',
    'system.manage_settings',
    'user.manage_all'
  ];

  // Carregar usuários
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setLoadingProgress('Iniciando carregamento...');
      const API_BASE = getApiBase ? getApiBase() : ((import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1');
      const token = localStorage.getItem('authToken');
      
      let allUsers: User[] = [];
      let nextUrl = `${API_BASE}/auth/users/`;
      let pageNumber = 1;
      
      // Buscar todas as páginas
      while (nextUrl) {
        if (nextUrl.startsWith('http://mozsolidaria.org')) nextUrl = nextUrl.replace('http://', 'https://');
        else if (nextUrl.startsWith('http://www.mozsolidaria.org')) nextUrl = nextUrl.replace('http://', 'https://');
        else if (nextUrl.startsWith('http://') && nextUrl.includes('mozsolidaria.org')) nextUrl = nextUrl.replace('http://', 'https://');
        if (nextUrl.startsWith('/')) nextUrl = `${API_BASE.replace(/\/$/, '')}${nextUrl}`;
        setLoadingProgress(`Carregando página ${pageNumber}...`);
        const response = await fetch(nextUrl, { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }});

        if (!response.ok) {
          toast.error('Erro ao carregar usuários');
          break;
        }

        const data = await response.json();
        
        // Verificar se a resposta é paginada (tem 'results') ou uma lista direta
        if (data.results && Array.isArray(data.results)) {
          allUsers = [...allUsers, ...data.results];
          let nxt = data.next;
          if (nxt) {
            if (nxt.startsWith('http://mozsolidaria.org')) nxt = nxt.replace('http://', 'https://');
            else if (nxt.startsWith('http://www.mozsolidaria.org')) nxt = nxt.replace('http://', 'https://');
            else if (nxt.startsWith('http://') && nxt.includes('mozsolidaria.org')) nxt = nxt.replace('http://', 'https://');
            else if (nxt.startsWith('/')) nxt = `${API_BASE.replace(/\/$/, '')}${nxt}`;
          }
          nextUrl = nxt;
          setLoadingProgress(`${allUsers.length} usuários carregados...`);
        } else if (Array.isArray(data)) {
          allUsers = [...allUsers, ...data];
          nextUrl = null; // Não há paginação
        } else {
          toast.error('Formato de dados inesperado');
          break;
        }
        
        pageNumber++;
        
        // Evitar loop infinito - máximo 10 páginas
        if (pageNumber > 10) {
          break;
        }
      }
      
      setUsers(allUsers);
      setLoadingProgress('');
      
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
      setLoadingProgress('');
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = (user: User) => {
    if (!user.is_active) return 'inactive';
    
    // Verificar grupos específicos primeiro
    if (user.groups && user.groups.length > 0) {
      const groupNames = user.groups.map(g => 
        typeof g === 'string' ? g : (g as { name: string }).name || ''
      ).join(',').toLowerCase();
      
      if (groupNames.includes('gestor de blog')) return 'blog_manager';
      if (groupNames.includes('gestor de projetos')) return 'project_manager';
      if (groupNames.includes('gestor de comunidade')) return 'community_manager';
      if (groupNames.includes('visualizador')) return 'viewer';
    }
    
    // Verificar flags padrão
    if (user.is_superuser) return 'superuser';
    if (user.is_staff) return 'staff';
    return 'user';
  };

  const getUserRoleInfo = (user: User) => {
    const role = getUserRole(user);
    return userRoles.find(r => r.value === role) || userRoles[2];
  };

  const filteredUsers = (users || []).filter(user => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || getUserRole(user) === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      is_staff: user.is_staff,
      is_superuser: user.is_superuser,
      is_active: user.is_active,
      groups: (user.groups || []).map(g => typeof g === 'string' ? g : g.name),
      permissions: user.permissions || []
    });
    setIsEditDialogOpen(true);
  };

  const updateUser = async () => {
    if (!selectedUser) return;

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE}/auth/users/${selectedUser.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast.success('Usuário atualizado com sucesso!');
        setIsEditDialogOpen(false);
        fetchUsers();
      } else {
        toast.error('Erro ao atualizar usuário');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE}/auth/users/${user.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !user.is_active }),
      });

      if (response.ok) {
        toast.success(`Usuário ${!user.is_active ? 'ativado' : 'desativado'} com sucesso!`);
        fetchUsers();
      } else {
        toast.error('Erro ao alterar status do usuário');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
    }
  };

  const debugUserComparison = (currentUserData: any, userData: any, action: string) => {
    // Debug logging removed for production
  };

  const promoteUser = async (user: User, toStaff: boolean, toSuperuser: boolean = false) => {
    try {
      debugUserComparison(currentUser, user, 'staff_promotion');
      
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE}/auth/users/${user.id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          is_staff: toStaff,
          is_superuser: toSuperuser 
        }),
      });

      if (response.ok) {
        const role = toSuperuser ? 'Superusuário' : toStaff ? 'Administrador' : 'Usuário';
        toast.success(`Usuário promovido para ${role} com sucesso!`);
        fetchUsers();
        
        // 🔄 ATUALIZAÇÃO IMEDIATA E ROBUSTA DAS PERMISSÕES
        if (currentUser && currentUser.id === user.id) {
          try {
            // 1. Invalidar cache local
            invalidatePermissionsCache();
            
            // 2. Forçar refresh das permissões via API
            const refreshResponse = await fetch(`${API_BASE}/auth/sessions/force_permission_refresh/`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ user_id: user.id }),
            });
            
            // 3. Atualizar contexto local
            await refreshUserData();
            
            // 4. Mostrar toast de sucesso
            toast.success('Permissões atualizadas! As mudanças são efetivas imediatamente.', {
              duration: 4000,
            });
            
          } catch (refreshError) {
            // Fallback: forçar reload se a atualização falhar
            toast.info('Recarregando página para aplicar mudanças...', {
              duration: 2000,
            });
            
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        }
      } else {
        toast.error('Erro ao promover usuário');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
    }
  };

  const promoteToProfile = async (user: User, profileCode: string) => {
    debugUserComparison(currentUser, user, `profile_promotion_${profileCode}`);
    
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        toast.error('Erro de autenticação. Faça login novamente.');
        return;
      }
      
      // Caso especial para rebaixar para usuário comum
      if (profileCode === 'user') {
        const response = await fetch(`${API_BASE}/auth/users/${user.id}/`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            is_staff: false,
            is_superuser: false 
          }),
        });

        if (response.ok) {
          toast.success(`${user.username} rebaixado para Usuário comum com sucesso!`);
          fetchUsers();
          
          // 🔄 ATUALIZAÇÃO IMEDIATA E ROBUSTA DAS PERMISSÕES PARA REBAIXAMENTO
          if (currentUser && currentUser.id === user.id) {
            try {
              // 1. Invalidar cache local
              invalidatePermissionsCache();
              
              // 2. Forçar refresh das permissões via API
              const refreshResponse = await fetch(`${API_BASE}/auth/sessions/force_permission_refresh/`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: user.id }),
              });
              
              // 3. Atualizar contexto local
              await refreshUserData();
              
              // 4. Mostrar toast informativo
              toast.info('Suas permissões foram atualizadas. Redirecionando...', {
                duration: 3000,
              });
              
              // 5. Para rebaixamentos, redirecionar para home após um tempo
              setTimeout(() => {
                window.location.href = '/';
              }, 3000);
              
            } catch (refreshError) {
              // Fallback: forçar reload
              setTimeout(() => {
                window.location.reload();
              }, 1000);
            }
          }
        } else {
          toast.error('Erro ao rebaixar usuário');
        }
        return;
      }
      
      // Para outros perfis, usar o endpoint específico
      const response = await fetch(`${API_BASE}/auth/users/${user.id}/promote_to_profile/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profile: profileCode }),
      });

      if (response.ok) {
        const data = await response.json();
        const profileName = userRoles.find(r => r.value === profileCode)?.label || 'perfil específico';
        toast.success(`${user.username} promovido para ${profileName} com sucesso!`);
        fetchUsers();
        
        // 🔄 ATUALIZAÇÃO IMEDIATA E ROBUSTA DAS PERMISSÕES PARA PERFIS ESPECÍFICOS
        if (currentUser && currentUser.id === user.id) {
          try {
            // 1. Invalidar cache local
            invalidatePermissionsCache();
            
            // 2. Forçar refresh das permissões via API
            const refreshResponse = await fetch(`${API_BASE}/auth/sessions/force_permission_refresh/`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ user_id: user.id }),
            });
            
            // 3. Atualizar contexto local
            await refreshUserData();
            
            // 4. Mostrar toast de sucesso específico
            toast.success(`Agora você tem acesso ao perfil ${profileName}! As mudanças são efetivas imediatamente.`, {
              duration: 5000,
            });
            
          } catch (refreshError) {
            // Fallback: forçar reload se a atualização falhar
            toast.info('Recarregando página para aplicar as novas permissões...', {
              duration: 2000,
            });
            
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Erro ao promover usuário');
      }
    } catch (error) {
      toast.error('Erro ao conectar com o servidor');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        {loadingProgress && (
          <p className="text-sm text-muted-foreground">{loadingProgress}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-gray-600">
            Gerencie usuários, permissões e funções do sistema
          </p>
        </div>
        <Button className="w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {userRoles.map((role) => {
          const count = (users || []).filter(user => getUserRole(user) === role.value).length;
          const Icon = role.icon;
          
          return (
            <Card key={role.value}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${role.color} mr-3`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {role.label}
                    </p>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, email ou username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrar por função" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as funções</SelectItem>
                {userRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => {
                  const roleInfo = getUserRoleInfo(user);
                  const Icon = roleInfo.icon;
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${roleInfo.color}`}>
                            <Icon className="h-3 w-3" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {user.first_name} {user.last_name} 
                              {user.id === currentUser?.id && (
                                <Badge variant="outline" className="ml-2">Você</Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">@{user.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={roleInfo.color}>
                          {roleInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleDateString('pt-BR')
                          : 'Nunca'
                        }
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            
                            {currentUser?.is_superuser && (
                              <>
                                <DropdownMenuSeparator />
                                
                                {/* Novos perfis específicos */}
                                <DropdownMenuItem 
                                  onClick={() => promoteToProfile(user, 'super_admin')}
                                >
                                  <Crown className="mr-2 h-4 w-4 text-purple-600" />
                                  Super Admin
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem 
                                  onClick={() => promoteToProfile(user, 'blog_manager')}
                                >
                                  <FileText className="mr-2 h-4 w-4 text-blue-600" />
                                  Gestor de Blog
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem 
                                  onClick={() => promoteToProfile(user, 'project_manager')}
                                >
                                  <FolderOpen className="mr-2 h-4 w-4 text-green-600" />
                                  Gestor de Projetos
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem 
                                  onClick={() => promoteToProfile(user, 'community_manager')}
                                >
                                  <Users className="mr-2 h-4 w-4 text-orange-600" />
                                  Gestor de Comunidade
                                </DropdownMenuItem>
                                
                                <DropdownMenuItem 
                                  onClick={() => promoteToProfile(user, 'viewer')}
                                >
                                  <Eye className="mr-2 h-4 w-4 text-gray-600" />
                                  Visualizador
                                </DropdownMenuItem>
                                
                                <DropdownMenuSeparator />
                                
                                {/* Rebaixar para usuário comum */}
                                {getUserRole(user) !== 'user' && user.id !== currentUser?.id && (
                                  <DropdownMenuItem 
                                    onClick={() => promoteToProfile(user, 'user')}
                                  >
                                    <User className="mr-2 h-4 w-4 text-slate-600" />
                                    Rebaixar para Usuário
                                  </DropdownMenuItem>
                                )}
                              </>
                            )}
                            
                            <DropdownMenuSeparator />
                            
                            {user.id !== currentUser?.id && (
                              <DropdownMenuItem 
                                onClick={() => toggleUserStatus(user)}
                                className={user.is_active ? "text-red-600" : "text-green-600"}
                              >
                                {user.is_active ? (
                                  <>
                                    <UserX className="mr-2 h-4 w-4" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="mr-2 h-4 w-4" />
                                    Ativar
                                  </>
                                )}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Editar Usuário: {selectedUser?.first_name} {selectedUser?.last_name}
            </DialogTitle>
            <DialogDescription>
              Atualize as informações e permissões do usuário.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome</label>
                <Input
                  value={editForm.first_name}
                  onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Sobrenome</label>
                <Input
                  value={editForm.last_name}
                  onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                />
                <span className="text-sm">Usuário Ativo</span>
              </label>
              
              {currentUser?.is_superuser && (
                <>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editForm.is_staff}
                      onChange={(e) => setEditForm({...editForm, is_staff: e.target.checked})}
                    />
                    <span className="text-sm">Administrador</span>
                  </label>
                  
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editForm.is_superuser}
                      onChange={(e) => setEditForm({...editForm, is_superuser: e.target.checked})}
                    />
                    <span className="text-sm">Superusuário</span>
                  </label>
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={updateUser}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
