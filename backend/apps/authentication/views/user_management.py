# views/user_management.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User, Group, Permission
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.db.models import Q

User = get_user_model()

def is_main_admin(user):
    """
    🛡️ FUNÇÃO DE PROTEÇÃO: Identifica o administrador principal
    Critérios para identificar o administrador principal:
    1. É superusuário
    2. É o primeiro superusuário criado (ID mais baixo) OU
    3. Username específico (admin, principal, etc.)
    """
    if not user.is_superuser:
        return False
    
    # Verificar se é um username de administrador principal
    main_admin_usernames = ['admin', 'principal', 'main', 'root', 'superadmin']
    if user.username.lower() in main_admin_usernames:
        return True
    
    # Verificar se é o primeiro superusuário (assumindo que seria o principal)
    all_superusers = User.objects.filter(is_superuser=True).order_by('id')
    if all_superusers.exists() and all_superusers.first().id == user.id:
        return True
    
    return False

def can_modify_user(requesting_user, target_user):
    """
    🛡️ FUNÇÃO DE PROTEÇÃO: Verifica se um usuário pode modificar outro
    """
    # Não permitir modificação do administrador principal
    if is_main_admin(target_user):
        return False
    
    # Não permitir que um usuário modifique a si mesmo
    if requesting_user.id == target_user.id:
        return False
    
    # Apenas superusuários podem modificar outros usuários
    return requesting_user.is_superuser

class UserSerializer(serializers.ModelSerializer):
    groups = serializers.StringRelatedField(many=True, read_only=True)
    permissions = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'is_staff', 'is_superuser', 'is_active', 'date_joined',
            'last_login', 'groups', 'permissions'
        ]
        read_only_fields = ['id', 'username', 'date_joined', 'last_login']
    
    def get_permissions(self, obj):
        """Retorna lista de permissões do usuário"""
        user_perms = obj.user_permissions.all()
        group_perms = Permission.objects.filter(group__user=obj)
        all_perms = (user_perms | group_perms).distinct()
        return [f"{perm.content_type.app_label}.{perm.codename}" for perm in all_perms]

class UserManagementViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gerenciamento completo de usuários
    Apenas superusuários podem acessar
    """
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filtrar usuários baseado nas permissões"""
        user = self.request.user
        
        if user.is_superuser:
            # Superusuários veem todos os usuários
            return User.objects.all().order_by('-date_joined')
        elif user.is_staff:
            # Staff vê apenas usuários normais (não staff/superuser)
            return User.objects.filter(
                is_staff=False, 
                is_superuser=False
            ).order_by('-date_joined')
        else:
            # Usuários normais não veem nada
            return User.objects.none()
    
    def get_permissions(self):
        """Definir permissões baseadas na ação"""
        if self.action in ['list', 'retrieve']:
            # Visualização: staff ou superuser
            permission_classes = [IsAuthenticated]
        else:
            # Modificação: apenas superuser
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def perform_update(self, serializer):
        """🛡️ PROTEÇÃO: Validações especiais para atualização"""
        user = self.request.user
        target_user = self.get_object()
        
        # 🛡️ VERIFICAÇÃO DE PROTEÇÃO DO ADMINISTRADOR PRINCIPAL
        if not can_modify_user(user, target_user):
            if is_main_admin(target_user):
                raise serializers.ValidationError(
                    "🛡️ Administrador Principal Protegido! Este usuário não pode ser modificado por questões de segurança."
                )
            elif user.id == target_user.id:
                raise serializers.ValidationError(
                    "⚠️ Você não pode modificar suas próprias permissões. Solicite a outro administrador."
                )
            else:
                raise serializers.ValidationError(
                    "❌ Você não tem permissão para modificar este usuário."
                )
        
        # Verificar se o usuário pode fazer essas alterações
        if not user.is_superuser:
            # Staff não pode promover usuários ou alterar superusuários
            if 'is_staff' in serializer.validated_data or 'is_superuser' in serializer.validated_data:
                raise serializers.ValidationError("Apenas superusuários podem alterar funções administrativas")
            
            if target_user.is_staff or target_user.is_superuser:
                raise serializers.ValidationError("Você não pode alterar usuários administrativos")
        
        # Impedir que o usuário desative a si mesmo
        if target_user.id == user.id and 'is_active' in serializer.validated_data:
            if not serializer.validated_data['is_active']:
                raise serializers.ValidationError("Você não pode desativar sua própria conta")
        
        serializer.save()
    
    def update(self, request, *args, **kwargs):
        """🛡️ PROTEÇÃO: Override do método update com validação de segurança"""
        target_user = self.get_object()
        
        # 🛡️ VERIFICAÇÃO DE PROTEÇÃO DO ADMINISTRADOR PRINCIPAL
        if not can_modify_user(request.user, target_user):
            if is_main_admin(target_user):
                return Response({
                    "error": "🛡️ Administrador Principal Protegido! Este usuário não pode ser modificado por questões de segurança.",
                    "is_main_admin": True
                }, status=status.HTTP_403_FORBIDDEN)
            elif request.user.id == target_user.id:
                return Response({
                    "error": "⚠️ Você não pode modificar suas próprias permissões. Solicite a outro administrador.",
                    "is_self_modification": True
                }, status=status.HTTP_403_FORBIDDEN)
            else:
                return Response({
                    "error": "❌ Você não tem permissão para modificar este usuário.",
                    "insufficient_permissions": True
                }, status=status.HTTP_403_FORBIDDEN)
        
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """🛡️ PROTEÇÃO: Override do método partial_update com validação de segurança"""
        target_user = self.get_object()
        
        # 🛡️ VERIFICAÇÃO DE PROTEÇÃO DO ADMINISTRADOR PRINCIPAL
        if not can_modify_user(request.user, target_user):
            if is_main_admin(target_user):
                return Response({
                    "error": "🛡️ Administrador Principal Protegido! Este usuário não pode ser modificado por questões de segurança.",
                    "is_main_admin": True
                }, status=status.HTTP_403_FORBIDDEN)
            elif request.user.id == target_user.id:
                return Response({
                    "error": "⚠️ Você não pode modificar suas próprias permissões. Solicite a outro administrador.",
                    "is_self_modification": True
                }, status=status.HTTP_403_FORBIDDEN)
            else:
                return Response({
                    "error": "❌ Você não tem permissão para modificar este usuário.",
                    "insufficient_permissions": True
                }, status=status.HTTP_403_FORBIDDEN)
        
        return super().partial_update(request, *args, **kwargs)
    
    @action(detail=True, methods=['post'])
    def promote_to_staff(self, request, pk=None):
        """🛡️ PROTEÇÃO: Promover usuário para staff"""
        if not request.user.is_superuser:
            return Response(
                {"error": "Apenas superusuários podem promover usuários"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = self.get_object()
        
        # 🛡️ VERIFICAÇÃO DE PROTEÇÃO DO ADMINISTRADOR PRINCIPAL
        if not can_modify_user(request.user, user):
            if is_main_admin(user):
                return Response({
                    "error": "🛡️ Administrador Principal Protegido! Este usuário não pode ser modificado por questões de segurança.",
                    "is_main_admin": True
                }, status=status.HTTP_403_FORBIDDEN)
            elif request.user.id == user.id:
                return Response({
                    "error": "⚠️ Você não pode modificar suas próprias permissões. Solicite a outro administrador.",
                    "is_self_modification": True
                }, status=status.HTTP_403_FORBIDDEN)
            else:
                return Response({
                    "error": "❌ Você não tem permissão para modificar este usuário.",
                    "insufficient_permissions": True
                }, status=status.HTTP_403_FORBIDDEN)
        
        user.is_staff = True
        user.save()
        
        return Response({
            "message": f"Usuário {user.username} promovido para staff",
            "user": UserSerializer(user).data
        })
    
    @action(detail=True, methods=['post'])
    def promote_to_profile(self, request, pk=None):
        """🛡️ PROTEÇÃO: Promover usuário para um perfil específico"""
        if not request.user.is_superuser:
            return Response(
                {"error": "Apenas superusuários podem promover usuários"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = self.get_object()
        
        # 🛡️ VERIFICAÇÃO DE PROTEÇÃO DO ADMINISTRADOR PRINCIPAL
        if not can_modify_user(request.user, user):
            if is_main_admin(user):
                return Response({
                    "error": "🛡️ Administrador Principal Protegido! Este usuário não pode ser modificado por questões de segurança.",
                    "is_main_admin": True
                }, status=status.HTTP_403_FORBIDDEN)
            elif request.user.id == user.id:
                return Response({
                    "error": "⚠️ Você não pode modificar suas próprias permissões. Solicite a outro administrador.",
                    "is_self_modification": True
                }, status=status.HTTP_403_FORBIDDEN)
            else:
                return Response({
                    "error": "❌ Você não tem permissão para modificar este usuário.",
                    "insufficient_permissions": True
                }, status=status.HTTP_403_FORBIDDEN)
        
        profile_name = request.data.get('profile')
        if not profile_name:
            return Response(
                {"error": "Campo 'profile' é obrigatório"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mapear perfis disponíveis
        available_profiles = {
            'super_admin': 'Super Admin',
            'blog_manager': 'Gestor de Blog',
            'project_manager': 'Gestor de Projetos', 
            'community_manager': 'Gestor de Comunidade',
            'viewer': 'Visualizador'
        }
        
        if profile_name not in available_profiles:
            return Response(
                {
                    "error": "Perfil inválido", 
                    "available_profiles": list(available_profiles.keys())
                }, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = self.get_object()
        group_name = available_profiles[profile_name]
        
        try:
            # Obter o grupo
            group = Group.objects.get(name=group_name)
            
            # Remover usuário de outros grupos (exceto superusuários)
            if not user.is_superuser:
                user.groups.clear()
            
            # Adicionar ao novo grupo
            user.groups.add(group)
            
            # Configurar flags baseado no perfil
            if profile_name == 'super_admin':
                user.is_staff = True
                user.is_superuser = True
            elif profile_name in ['blog_manager', 'project_manager', 'community_manager', 'viewer']:
                user.is_staff = True
                user.is_superuser = False
            else:  # fallback
                user.is_staff = True
                user.is_superuser = False
            
            user.save()
            
            return Response({
                "message": f"Usuário {user.username} promovido para {group_name}",
                "profile": profile_name,
                "user": UserSerializer(user).data
            })
            
        except Group.DoesNotExist:
            return Response(
                {"error": f"Grupo '{group_name}' não encontrado. Execute: python manage.py setup_user_profiles"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def available_profiles(self, request):
        """Listar perfis disponíveis para promoção"""
        if not request.user.is_superuser:
            return Response(
                {"error": "Apenas superusuários podem ver perfis disponíveis"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        profiles = [
            {
                'code': 'super_admin',
                'name': 'Super Admin',
                'description': 'Acesso total ao sistema, incluindo gestão de usuários e configurações',
                'icon': 'Crown',
                'color': 'purple'
            },
            {
                'code': 'blog_manager', 
                'name': 'Gestor de Blog',
                'description': 'Acesso apenas ao módulo de Blog (criar, editar, publicar, excluir artigos e categorias)',
                'icon': 'FileText',
                'color': 'blue'
            },
            {
                'code': 'project_manager',
                'name': 'Gestor de Projetos', 
                'description': 'Acesso apenas ao módulo de Projetos (criar, editar, encerrar e gerar relatórios)',
                'icon': 'FolderOpen',
                'color': 'green'
            },
            {
                'code': 'community_manager',
                'name': 'Gestor de Comunidade',
                'description': 'Acesso apenas ao módulo de Comunidade (aprovar/rejeitar voluntários, parcerias, beneficiários e doadores)',
                'icon': 'Users',
                'color': 'orange'
            },
            {
                'code': 'viewer',
                'name': 'Visualizador',
                'description': 'Acesso de leitura a todos os módulos, sem possibilidade de alteração',
                'icon': 'Eye',
                'color': 'gray'
            }
        ]
        
        return Response({
            "profiles": profiles,
            "total": len(profiles)
        })

    @action(detail=True, methods=['post'])
    def promote_to_staff_legacy(self, request, pk=None):
        """Promover usuário para staff (método legado)"""
        if not request.user.is_superuser:
            return Response(
                {"error": "Apenas superusuários podem promover usuários"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = self.get_object()
        user.is_staff = True
        user.save()
        
        return Response({"message": f"Usuário {user.username} promovido para staff"})
    
    @action(detail=True, methods=['post'])
    def promote_to_superuser(self, request, pk=None):
        """Promover usuário para superusuário"""
        if not request.user.is_superuser:
            return Response(
                {"error": "Apenas superusuários podem promover usuários"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = self.get_object()
        user.is_staff = True
        user.is_superuser = True
        user.save()
        
        return Response({"message": f"Usuário {user.username} promovido para superusuário"})
    
    @action(detail=True, methods=['post'])
    def demote_to_user(self, request, pk=None):
        """Rebaixar usuário para usuário comum"""
        if not request.user.is_superuser:
            return Response(
                {"error": "Apenas superusuários podem rebaixar usuários"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        user = self.get_object()
        
        # Impedir que rebaixe a si mesmo
        if user.id == request.user.id:
            return Response(
                {"error": "Você não pode rebaixar a si mesmo"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_staff = False
        user.is_superuser = False
        user.save()
        
        return Response({"message": f"Usuário {user.username} rebaixado para usuário comum"})
    
    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Ativar/Desativar usuário"""
        user = self.get_object()
        
        # Verificar permissões
        if not request.user.is_superuser and not request.user.is_staff:
            return Response(
                {"error": "Você não tem permissão para alterar status de usuários"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Staff só pode alterar usuários normais
        if not request.user.is_superuser and (user.is_staff or user.is_superuser):
            return Response(
                {"error": "Você não pode alterar status de usuários administrativos"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Impedir desativação própria
        if user.id == request.user.id:
            return Response(
                {"error": "Você não pode desativar sua própria conta"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_active = not user.is_active
        user.save()
        
        status_text = "ativado" if user.is_active else "desativado"
        return Response({"message": f"Usuário {user.username} {status_text}"})
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Estatísticas de usuários"""
        if not (request.user.is_staff or request.user.is_superuser):
            return Response(
                {"error": "Você não tem permissão para visualizar estatísticas"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        stats = {
            'total': User.objects.count(),
            'active': User.objects.filter(is_active=True).count(),
            'inactive': User.objects.filter(is_active=False).count(),
            'staff': User.objects.filter(is_staff=True).count(),
            'superuser': User.objects.filter(is_superuser=True).count(),
            'regular': User.objects.filter(is_staff=False, is_superuser=False).count(),
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def available_permissions(self, request):
        """Lista de permissões disponíveis"""
        if not request.user.is_superuser:
            return Response(
                {"error": "Apenas superusuários podem visualizar permissões"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        permissions = Permission.objects.all().select_related('content_type')
        perm_list = [
            {
                'id': perm.id,
                'name': perm.name,
                'codename': f"{perm.content_type.app_label}.{perm.codename}",
                'app_label': perm.content_type.app_label
            }
            for perm in permissions
        ]
        
        return Response(perm_list)
