# backend/rbac_settings.py
"""
Configurações específicas para o sistema RBAC
Adicione estas configurações ao seu settings.py principal
"""

# ========== MIDDLEWARES PARA RBAC ==========
# Adicione estes middlewares ao MIDDLEWARE em settings.py

RBAC_MIDDLEWARES = [
    'backend.core.middleware.SecurityMiddleware',        # Controle de segurança
    'backend.core.middleware.AuditMiddleware',          # Auditoria automática
    'backend.core.middleware.PermissionLoggingMiddleware',  # Log de permissões
]

# ========== CONFIGURAÇÕES DE LOGGING ==========
# Configuração para logs de auditoria e segurança

RBAC_LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'audit_formatter': {
            'format': '[{levelname}] {asctime} | {name} | {message}',
            'style': '{',
        },
        'security_formatter': {
            'format': '[SECURITY] {asctime} | {name} | {message}',
            'style': '{',
        },
    },
    'handlers': {
        'audit_file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'logs/audit.log',
            'formatter': 'audit_formatter',
        },
        'security_file': {
            'level': 'WARNING',
            'class': 'logging.FileHandler',
            'filename': 'logs/security.log',
            'formatter': 'security_formatter',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'audit_formatter',
        },
    },
    'loggers': {
        'backend.core.middleware': {
            'handlers': ['audit_file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'security': {
            'handlers': ['security_file', 'console'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
}

# ========== CONFIGURAÇÕES DE SESSÃO E SEGURANÇA ==========

RBAC_SECURITY_SETTINGS = {
    # Timeout de sessão (em segundos) - 8 horas
    'SESSION_COOKIE_AGE': 8 * 60 * 60,
    
    # Expirar sessão quando o browser fechar
    'SESSION_EXPIRE_AT_BROWSER_CLOSE': True,
    
    # Salvar sessão a cada requisição
    'SESSION_SAVE_EVERY_REQUEST': True,
    
    # Configurações de cookies seguros
    'SESSION_COOKIE_SECURE': True,  # Apenas HTTPS em produção
    'SESSION_COOKIE_HTTPONLY': True,
    'SESSION_COOKIE_SAMESITE': 'Strict',
    
    # CSRF
    'CSRF_COOKIE_SECURE': True,  # Apenas HTTPS em produção
    'CSRF_COOKIE_HTTPONLY': True,
    'CSRF_COOKIE_SAMESITE': 'Strict',
}

# ========== CONFIGURAÇÕES CUSTOMIZADAS DO RBAC ==========

RBAC_SETTINGS = {
    # Número máximo de tentativas de login antes do bloqueio
    'MAX_LOGIN_ATTEMPTS': 5,
    
    # Tempo de bloqueio em minutos
    'LOCKOUT_TIME_MINUTES': 30,
    
    # Timeout de sessão por inatividade (em horas)
    'SESSION_TIMEOUT_HOURS': 8,
    
    # Ativar auditoria automática
    'ENABLE_AUDIT_LOGGING': True,
    
    # Ativar logs de segurança
    'ENABLE_SECURITY_LOGGING': True,
    
    # Campos sensíveis que não devem aparecer nos logs
    'SENSITIVE_FIELDS': [
        'password', 'token', 'secret', 'key', 'api_key',
        'access_token', 'refresh_token', 'auth_token'
    ],
    
    # Módulos que devem ser auditados
    'AUDIT_MODULES': [
        'blog', 'projects', 'community', 'admin', 'reports', 'users'
    ],
    
    # Ações que devem ser auditadas
    'AUDIT_ACTIONS': [
        'CREATE', 'UPDATE', 'DELETE', 'VIEW', 'APPROVE', 'REJECT',
        'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT'
    ],
}

# ========== URLS PARA RBAC ==========

RBAC_URL_PATTERNS = [
    # Adicione esta linha ao urlpatterns principal
    # path('api/rbac/', include('backend.core.permissions_urls')),
]

# ========== INSTRUÇÕES DE INSTALAÇÃO ==========

INSTALLATION_INSTRUCTIONS = """
Para configurar completamente o sistema RBAC:

1. SETTINGS.PY - Adicione as seguintes configurações:

   # Middlewares (adicione ao MIDDLEWARE existente)
   MIDDLEWARE = [
       'django.middleware.security.SecurityMiddleware',
       'django.contrib.sessions.middleware.SessionMiddleware',
       'corsheaders.middleware.CorsMiddleware',
       'django.middleware.common.CommonMiddleware',
       'django.middleware.csrf.CsrfViewMiddleware',
       'django.contrib.auth.middleware.AuthenticationMiddleware',
       
       # RBAC Middlewares - adicione aqui
       'backend.core.middleware.SecurityMiddleware',
       'backend.core.middleware.AuditMiddleware', 
       'backend.core.middleware.PermissionLoggingMiddleware',
       
       'django.contrib.messages.middleware.MessageMiddleware',
       'django.middleware.clickjacking.XFrameOptionsMiddleware',
   ]

   # Importar configurações RBAC
   from .rbac_settings import RBAC_SECURITY_SETTINGS, RBAC_SETTINGS
   
   # Aplicar configurações de segurança
   locals().update(RBAC_SECURITY_SETTINGS)
   
   # Configurações customizadas
   RBAC = RBAC_SETTINGS

2. URLS.PY PRINCIPAL - Adicione as URLs do RBAC:

   urlpatterns = [
       path('admin/', admin.site.urls),
       path('api/auth/', include('backend.authentication.urls')),
       path('api/core/', include('backend.core.urls')),
       
       # URLs do sistema RBAC
       path('api/rbac/', include('backend.core.permissions_urls')),
       
       # ... outras URLs
   ]

3. CRIAR DIRETÓRIO DE LOGS:

   mkdir logs

4. EXECUTAR SCRIPT DE CONFIGURAÇÃO:

   python scripts/setup_rbac_system.py

5. TESTAR O SISTEMA:

   - Login: admin / MozSolidaria2024!
   - Acesse /api/rbac/my-profile/ para testar
   - Verifique logs em logs/audit.log e logs/security.log

6. CONFIGURAR FRONTEND:

   - Implementar verificações de permissão nos componentes
   - Usar os endpoints /api/rbac/ para gestão de usuários
   - Integrar com Dashboard.tsx conforme necessário
"""

print(INSTALLATION_INSTRUCTIONS)
