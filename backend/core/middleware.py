# backend/core/middleware.py

from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import logout
from django.http import JsonResponse
from django.utils import timezone
from datetime import timedelta
import json
import logging

from .models import AuditLog, LoginAttempt, UserProfile

logger = logging.getLogger(__name__)


class AuditMiddleware(MiddlewareMixin):
    """
    Middleware para auditoria automática de ações
    """
    
    AUDIT_ACTIONS = {
        'POST': 'CREATE',
        'PUT': 'UPDATE',
        'PATCH': 'UPDATE',
        'DELETE': 'DELETE',
        'GET': 'VIEW'
    }
    
    AUDIT_MODULES = {
        'blog': 'BLOG',
        'projects': 'PROJECTS', 
        'community': 'COMMUNITY',
        'admin': 'SYSTEM',
        'reports': 'REPORTS',
        'users': 'USERS'
    }
    
    def process_request(self, request):
        """Processa a requisição para auditoria"""
        # Adiciona informações de IP e User Agent ao request
        request.audit_ip = self.get_client_ip(request)
        request.audit_user_agent = request.META.get('HTTP_USER_AGENT', '')
        
        # Marca o início da requisição para medição de tempo
        request.audit_start_time = timezone.now()
        
        return None
    
    def process_response(self, request, response):
        """Processa a resposta e gera logs de auditoria"""
        
        # Só audita se o usuário estiver autenticado
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return response
            
        # Só audita determinados métodos e URLs
        if not self._should_audit(request):
            return response
            
        try:
            self._create_audit_log(request, response)
        except Exception as e:
            logger.error(f"Erro ao criar log de auditoria: {str(e)}")
            
        return response
    
    def _should_audit(self, request):
        """Determina se a requisição deve ser auditada"""
        # Lista de URLs que devem ser auditadas
        audit_paths = [
            '/api/blog/',
            '/api/projects/',
            '/api/community/',
            '/api/reports/',
            '/api/admin/',
            '/api/users/',
            '/admin/'
        ]
        
        # Métodos que devem ser auditados
        audit_methods = ['POST', 'PUT', 'PATCH', 'DELETE']
        
        # Verifica se o caminho da URL deve ser auditado
        path_match = any(request.path.startswith(path) for path in audit_paths)
        
        # Audita sempre operações de escrita, ou operações de leitura em paths importantes
        return (request.method in audit_methods and path_match) or \
               (request.method == 'GET' and '/admin/' in request.path)
    
    def _create_audit_log(self, request, response):
        """Cria o log de auditoria"""
        action = self.AUDIT_ACTIONS.get(request.method, 'UNKNOWN')
        module = self._get_module_from_path(request.path)
        
        # Extrai informações do objeto se disponível
        object_info = self._extract_object_info(request, response)
        
        # Determina se a operação foi bem-sucedida
        success = 200 <= response.status_code < 400
        error_message = None if success else f"HTTP {response.status_code}"
        
        # Extrai mudanças se for uma operação de escrita
        changes = self._extract_changes(request) if request.method in ['POST', 'PUT', 'PATCH'] else {}
        
        AuditLog.log_action(
            user=request.user,
            action=action,
            module=module,
            object_type=object_info.get('type'),
            object_id=object_info.get('id'),
            object_name=object_info.get('name'),
            changes=changes,
            ip_address=request.audit_ip,
            user_agent=request.audit_user_agent,
            success=success,
            error_message=error_message
        )
    
    def _get_module_from_path(self, path):
        """Determina o módulo baseado no caminho da URL"""
        for key, module in self.AUDIT_MODULES.items():
            if key in path.lower():
                return module
        return 'SYSTEM'
    
    def _extract_object_info(self, request, response):
        """Extrai informações do objeto da requisição/resposta"""
        info = {'type': None, 'id': None, 'name': None}
        
        # Tenta extrair do caminho da URL
        path_parts = request.path.strip('/').split('/')
        if len(path_parts) >= 3:
            info['type'] = path_parts[1]  # ex: 'projects' em /api/projects/123/
            if len(path_parts) >= 4 and path_parts[3].isdigit():
                info['id'] = path_parts[3]
        
        # Tenta extrair nome dos dados da requisição
        if hasattr(request, 'data') and isinstance(request.data, dict):
            info['name'] = request.data.get('title') or request.data.get('name') or request.data.get('subject')
        
        return info
    
    def _extract_changes(self, request):
        """Extrai as mudanças dos dados da requisição"""
        changes = {}
        
        if hasattr(request, 'data') and request.data:
            # Remove campos sensíveis
            sensitive_fields = ['password', 'token', 'secret', 'key']
            changes = {k: v for k, v in request.data.items() 
                      if not any(field in k.lower() for field in sensitive_fields)}
        
        return changes
    
    def get_client_ip(self, request):
        """Obtém o IP real do cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SecurityMiddleware(MiddlewareMixin):
    """
    Middleware para controlo de segurança
    """
    
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_TIME_MINUTES = 30
    
    def process_request(self, request):
        """Verifica tentativas de login e implementa medidas de segurança"""
        
        # Verifica bloqueio por tentativas de login
        if request.path == '/api/auth/login/' and request.method == 'POST':
            if self._is_ip_blocked(request):
                return JsonResponse({
                    'error': 'Muitas tentativas de login falhadas. Tente novamente mais tarde.',
                    'blocked_until': self._get_block_expiry_time(request).isoformat()
                }, status=429)
        
        # Verifica sessões ativas e timeout
        if hasattr(request, 'user') and request.user.is_authenticated:
            if self._should_logout_inactive_user(request):
                logout(request)
                return JsonResponse({
                    'error': 'Sessão expirada por inatividade'
                }, status=401)
        
        return None
    
    def _is_ip_blocked(self, request):
        """Verifica se o IP está bloqueado por tentativas falhadas"""
        ip_address = self._get_client_ip(request)
        username = self._get_username_from_request(request)
        
        if not username:
            return False
            
        failed_attempts = LoginAttempt.get_failed_attempts(
            username=username,
            ip_address=ip_address,
            time_window_minutes=self.LOCKOUT_TIME_MINUTES
        )
        
        return failed_attempts >= self.MAX_LOGIN_ATTEMPTS
    
    def _get_block_expiry_time(self, request):
        """Calcula quando o bloqueio expira"""
        ip_address = self._get_client_ip(request)
        username = self._get_username_from_request(request)
        
        # Obtém a última tentativa falhada
        last_attempt = LoginAttempt.objects.filter(
            username=username,
            ip_address=ip_address,
            success=False
        ).order_by('-timestamp').first()
        
        if last_attempt:
            return last_attempt.timestamp + timedelta(minutes=self.LOCKOUT_TIME_MINUTES)
        
        return timezone.now()
    
    def _should_logout_inactive_user(self, request):
        """Verifica se o usuário deve ser deslogado por inatividade"""
        # Timeout de 8 horas de inatividade
        SESSION_TIMEOUT_HOURS = 8
        
        last_activity = request.session.get('last_activity')
        if not last_activity:
            request.session['last_activity'] = timezone.now().isoformat()
            return False
        
        last_activity_time = timezone.datetime.fromisoformat(last_activity)
        if timezone.is_naive(last_activity_time):
            last_activity_time = timezone.make_aware(last_activity_time)
        
        time_diff = timezone.now() - last_activity_time
        
        if time_diff.total_seconds() > SESSION_TIMEOUT_HOURS * 3600:
            return True
        
        # Atualiza a última atividade
        request.session['last_activity'] = timezone.now().isoformat()
        return False
    
    def _get_client_ip(self, request):
        """Obtém o IP real do cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    def _get_username_from_request(self, request):
        """Extrai o username dos dados da requisição"""
        try:
            if hasattr(request, 'data') and 'username' in request.data:
                return request.data['username']
            elif request.content_type == 'application/json':
                data = json.loads(request.body.decode('utf-8'))
                return data.get('username')
        except:
            pass
        return None


class PermissionLoggingMiddleware(MiddlewareMixin):
    """
    Middleware para log de verificações de permissão
    """
    
    def process_view(self, request, view_func, view_args, view_kwargs):
        """Intercepta views para logging de permissões"""
        
        # Só processa se o usuário estiver autenticado
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return None
        
        # Verifica se a view tem decoradores de permissão
        if hasattr(view_func, 'permission_required'):
            required_permission = getattr(view_func, 'permission_required')
            has_permission = request.user.has_perm(required_permission)
            
            if not has_permission:
                # Log da tentativa de acesso negado
                AuditLog.log_action(
                    user=request.user,
                    action='VIEW',
                    module='SYSTEM',
                    object_type='permission_check',
                    object_name=required_permission,
                    changes={'required_permission': required_permission, 'access_granted': False},
                    ip_address=self._get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    success=False,
                    error_message='Permissão insuficiente'
                )
        
        return None
    
    def _get_client_ip(self, request):
        """Obtém o IP real do cliente"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
