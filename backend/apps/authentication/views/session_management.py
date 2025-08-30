# backend/apps/authentication/views/session_management.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User, Permission
from django.core.cache import cache
from django.contrib.sessions.models import Session
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)

class SessionManagementViewSet(viewsets.GenericViewSet):
    """
    🔄 GERENCIAMENTO DE SESSÕES E INVALIDAÇÃO EM TEMPO REAL
    
    Sistema para forçar atualização imediata de permissões após promoções/rebaixamentos,
    eliminando a necessidade de logout/login manual.
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def invalidate_user_sessions(self, request):
        """
        🎯 Invalidar todas as sessões de um usuário específico
        
        Usado após promoções/rebaixamentos para forçar re-autenticação
        e garantir que as novas permissões sejam aplicadas imediatamente
        """
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response({
                "error": "Campo 'user_id' é obrigatório"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if not request.user.is_superuser:
            return Response({
                "error": "Apenas superusuários podem invalidar sessões"
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            target_user = User.objects.get(id=user_id)
            
            # 1. Invalidar cache de permissões específico do usuário
            cache_keys = [
                f"user_permissions_{user_id}",
                f"user_groups_{user_id}",
                f"user_profile_{user_id}",
                f"auth_user_{user_id}",
            ]
            
            for key in cache_keys:
                cache.delete(key)
                logger.info(f"Cache invalidado: {key}")
            
            # 2. Invalidar sessões ativas do usuário
            active_sessions = Session.objects.filter(expire_date__gte=timezone.now())
            invalidated_sessions = 0
            
            for session in active_sessions:
                session_data = session.get_decoded()
                if session_data.get('_auth_user_id') == str(user_id):
                    session.delete()
                    invalidated_sessions += 1
            
            logger.info(f"🔄 Invalidadas {invalidated_sessions} sessões para usuário {target_user.username}")
            
            return Response({
                "message": f"Sessões do usuário {target_user.username} invalidadas com sucesso",
                "user_id": user_id,
                "invalidated_sessions": invalidated_sessions,
                "invalidated_cache_keys": cache_keys
            })
            
        except User.DoesNotExist:
            return Response({
                "error": f"Usuário com ID {user_id} não encontrado"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Erro ao invalidar sessões: {e}")
            return Response({
                "error": "Erro interno do servidor"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'])
    def force_permission_refresh(self, request):
        """
        🔄 Forçar atualização de permissões em tempo real
        
        Endpoint otimizado para ser chamado imediatamente após 
        promoções/rebaixamentos para garantir sincronização
        """
        user_id = request.data.get('user_id')
        
        if not user_id:
            # Se não especificar usuário, atualizar o próprio usuário logado
            user_id = request.user.id
        
        try:
            target_user = User.objects.get(id=user_id)
            
            # Só permitir se for o próprio usuário ou se for superusuário
            if user_id != request.user.id and not request.user.is_superuser:
                return Response({
                    "error": "Você só pode atualizar suas próprias permissões"
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Invalidar caches relacionados a permissões
            permission_cache_keys = [
                f"user_permissions_{user_id}",
                f"user_groups_{user_id}",
                f"user_profile_{user_id}",
                f"user_staff_status_{user_id}",
                f"group_permissions_{user_id}",
            ]
            
            for key in permission_cache_keys:
                cache.delete(key)
            
            # Buscar dados atualizados do usuário
            updated_user = User.objects.select_related().prefetch_related('groups', 'user_permissions').get(id=user_id)
            
            # Preparar dados de resposta
            user_data = {
                'id': updated_user.id,
                'username': updated_user.username,
                'email': updated_user.email,
                'first_name': updated_user.first_name,
                'last_name': updated_user.last_name,
                'is_staff': updated_user.is_staff,
                'is_superuser': updated_user.is_superuser,
                'is_active': updated_user.is_active,
                'groups': [group.name for group in updated_user.groups.all()],
                'permissions': [
                    f"{perm.content_type.app_label}.{perm.codename}" 
                    for perm in updated_user.get_all_permissions()
                ]
            }
            
            logger.info(f"🔄 Permissões atualizadas para usuário {updated_user.username}")
            
            return Response({
                "message": "Permissões atualizadas com sucesso",
                "user": user_data,
                "cache_invalidated": True,
                "timestamp": timezone.now().isoformat()
            })
            
        except User.DoesNotExist:
            return Response({
                "error": f"Usuário com ID {user_id} não encontrado"
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Erro ao atualizar permissões: {e}")
            return Response({
                "error": "Erro interno do servidor"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'])
    def get_current_permissions(self, request):
        """
        📋 Obter permissões atuais do usuário logado
        
        Sempre busca dados frescos do banco, sem cache
        """
        try:
            user = request.user
            
            # Buscar dados frescos do banco
            fresh_user = User.objects.select_related().prefetch_related('groups', 'user_permissions').get(id=user.id)
            
            user_data = {
                'id': fresh_user.id,
                'username': fresh_user.username,
                'email': fresh_user.email,
                'first_name': fresh_user.first_name,
                'last_name': fresh_user.last_name,
                'is_staff': fresh_user.is_staff,
                'is_superuser': fresh_user.is_superuser,
                'is_active': fresh_user.is_active,
                'groups': [group.name for group in fresh_user.groups.all()],
                'permissions': [
                    f"{perm.content_type.app_label}.{perm.codename}" 
                    for perm in fresh_user.get_all_permissions()
                ],
                'last_updated': timezone.now().isoformat()
            }
            
            return Response({
                "user": user_data,
                "fresh_data": True
            })
            
        except Exception as e:
            logger.error(f"Erro ao obter permissões: {e}")
            return Response({
                "error": "Erro interno do servidor"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def force_user_cache_clear(self, request):
        """
        🧹 Força limpeza completa do cache de permissões do usuário
        
        Esta função resolve o problema de permissões que só se atualizam após logout/login
        """
        try:
            user = request.user
            
            # Limpeza de cache Django interno
            if hasattr(user, '_perm_cache'):
                delattr(user, '_perm_cache')
            if hasattr(user, '_user_perm_cache'):
                delattr(user, '_user_perm_cache')
            if hasattr(user, '_group_perm_cache'):
                delattr(user, '_group_perm_cache')
            
            # Forçar recarregamento do usuário desde o banco
            fresh_user = User.objects.select_related().prefetch_related(
                'groups', 'user_permissions', 'groups__permissions'
            ).get(id=user.id)
            
            # Limpeza de qualquer cache de sessão relacionado ao usuário
            if hasattr(request, 'session'):
                # Remove chaves específicas de cache do usuário
                cache_keys_to_remove = [key for key in request.session.keys() 
                                      if 'user' in key.lower() or 'perm' in key.lower()]
                for key in cache_keys_to_remove:
                    del request.session[key]
                request.session.modified = True
            
            # Limpeza do Django Cache Framework
            permission_cache_keys = [
                f"user_permissions_{user.id}",
                f"user_groups_{user.id}",
                f"user_profile_{user.id}",
                f"user_staff_status_{user.id}",
                f"group_permissions_{user.id}",
            ]
            
            for key in permission_cache_keys:
                cache.delete(key)
            
            # Retornar dados frescos do usuário
            groups = [group.name for group in fresh_user.groups.all()]
            user_perms = fresh_user.user_permissions.all()
            group_perms = Permission.objects.filter(group__user=fresh_user)
            all_perms = (user_perms | group_perms).distinct()
            permissions = [f"{perm.content_type.app_label}.{perm.codename}" for perm in all_perms]
            
            response_data = {
                'status': 'success',
                'message': 'Cache do usuário limpo com sucesso - permissões devem estar atualizadas',
                'user_data': {
                    'id': fresh_user.id,
                    'username': fresh_user.username,
                    'groups': groups,
                    'permissions': permissions,
                    'is_staff': fresh_user.is_staff,
                    'is_superuser': fresh_user.is_superuser,
                },
                'cache_cleared': True,
                'fresh_data': True,
                'timestamp': timezone.now().isoformat()
            }
            
            response = Response(response_data, status=status.HTTP_200_OK)
            response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response['Pragma'] = 'no-cache' 
            response['Expires'] = '0'
            
            logger.info(f"🧹 Cache limpo para usuário {fresh_user.username}")
            
            return response
            
        except Exception as e:
            logger.error(f"Erro ao limpar cache do usuário: {str(e)}")
            return Response({
                'status': 'error',
                'message': f'Erro ao limpar cache: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
