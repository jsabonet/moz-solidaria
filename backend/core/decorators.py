# backend/core/decorators.py
from functools import wraps
from django.contrib.auth.decorators import user_passes_test
from django.core.exceptions import PermissionDenied
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from django.views.decorators.http import require_http_methods

def require_permission(permission_codename):
    """
    Decorator que verifica se o usuário possui uma permissão específica
    """
    def decorator(view_func):
        @wraps(view_func)
        @login_required
        def wrapped_view(request, *args, **kwargs):
            if not request.user.has_perm(permission_codename):
                if request.headers.get('Accept') == 'application/json':
                    return JsonResponse({
                        'error': 'Permissão negada',
                        'required_permission': permission_codename,
                        'message': f'Você precisa da permissão "{permission_codename}" para acessar este recurso'
                    }, status=403)
                raise PermissionDenied(f"Permissão '{permission_codename}' necessária")
            return view_func(request, *args, **kwargs)
        return wrapped_view
    return decorator

def require_any_permission(*permission_codenames):
    """
    Decorator que verifica se o usuário possui pelo menos uma das permissões especificadas
    """
    def decorator(view_func):
        @wraps(view_func)
        @login_required
        def wrapped_view(request, *args, **kwargs):
            if not any(request.user.has_perm(perm) for perm in permission_codenames):
                if request.headers.get('Accept') == 'application/json':
                    return JsonResponse({
                        'error': 'Permissão negada',
                        'required_permissions': permission_codenames,
                        'message': f'Você precisa de pelo menos uma das seguintes permissões: {", ".join(permission_codenames)}'
                    }, status=403)
                raise PermissionDenied(f"Uma das seguintes permissões é necessária: {', '.join(permission_codenames)}")
            return view_func(request, *args, **kwargs)
        return wrapped_view
    return decorator

def require_all_permissions(*permission_codenames):
    """
    Decorator que verifica se o usuário possui todas as permissões especificadas
    """
    def decorator(view_func):
        @wraps(view_func)
        @login_required
        def wrapped_view(request, *args, **kwargs):
            for permission in permission_codenames:
                if not request.user.has_perm(permission):
                    if request.headers.get('Accept') == 'application/json':
                        return JsonResponse({
                            'error': 'Permissão negada',
                            'missing_permission': permission,
                            'required_permissions': permission_codenames,
                            'message': f'Você precisa de todas as seguintes permissões: {", ".join(permission_codenames)}'
                        }, status=403)
                    raise PermissionDenied(f"Todas as seguintes permissões são necessárias: {', '.join(permission_codenames)}")
            return view_func(request, *args, **kwargs)
        return wrapped_view
    return decorator

def require_group(group_name):
    """
    Decorator que verifica se o usuário pertence a um grupo específico
    """
    def decorator(view_func):
        @wraps(view_func)
        @login_required
        def wrapped_view(request, *args, **kwargs):
            if not request.user.groups.filter(name=group_name).exists():
                if request.headers.get('Accept') == 'application/json':
                    return JsonResponse({
                        'error': 'Acesso negado',
                        'required_group': group_name,
                        'message': f'Você precisa pertencer ao grupo "{group_name}" para acessar este recurso'
                    }, status=403)
                raise PermissionDenied(f"Acesso restrito ao grupo '{group_name}'")
            return view_func(request, *args, **kwargs)
        return wrapped_view
    return decorator

def require_any_group(*group_names):
    """
    Decorator que verifica se o usuário pertence a pelo menos um dos grupos especificados
    """
    def decorator(view_func):
        @wraps(view_func)
        @login_required
        def wrapped_view(request, *args, **kwargs):
            user_groups = request.user.groups.values_list('name', flat=True)
            if not any(group in user_groups for group in group_names):
                if request.headers.get('Accept') == 'application/json':
                    return JsonResponse({
                        'error': 'Acesso negado',
                        'required_groups': group_names,
                        'message': f'Você precisa pertencer a um dos seguintes grupos: {", ".join(group_names)}'
                    }, status=403)
                raise PermissionDenied(f"Acesso restrito aos grupos: {', '.join(group_names)}")
            return view_func(request, *args, **kwargs)
        return wrapped_view
    return decorator

# Decorators para classes (Class-based views)
class PermissionRequiredMixin:
    """
    Mixin para Class-based views que requer permissões específicas
    """
    permission_required = None
    permission_denied_message = "Você não tem permissão para acessar esta página"

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()
        
        if self.permission_required:
            if isinstance(self.permission_required, str):
                perms = [self.permission_required]
            else:
                perms = self.permission_required
            
            if not all(request.user.has_perm(perm) for perm in perms):
                return self.handle_no_permission()
        
        return super().dispatch(request, *args, **kwargs)

    def handle_no_permission(self):
        if self.request.headers.get('Accept') == 'application/json':
            return JsonResponse({
                'error': 'Permissão negada',
                'message': self.permission_denied_message
            }, status=403)
        raise PermissionDenied(self.permission_denied_message)

class GroupRequiredMixin:
    """
    Mixin para Class-based views que requer grupos específicos
    """
    group_required = None
    group_denied_message = "Você não pertence ao grupo necessário para acessar esta página"

    def dispatch(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            return self.handle_no_permission()
        
        if self.group_required:
            if isinstance(self.group_required, str):
                groups = [self.group_required]
            else:
                groups = self.group_required
            
            user_groups = request.user.groups.values_list('name', flat=True)
            if not any(group in user_groups for group in groups):
                return self.handle_no_permission()
        
        return super().dispatch(request, *args, **kwargs)

    def handle_no_permission(self):
        if self.request.headers.get('Accept') == 'application/json':
            return JsonResponse({
                'error': 'Acesso negado',
                'message': self.group_denied_message
            }, status=403)
        raise PermissionDenied(self.group_denied_message)
