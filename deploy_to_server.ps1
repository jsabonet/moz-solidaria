# Script de Deploy para Servidor - Moz Solidária
# Uso: .\deploy_to_server.ps1

$SERVER = "root@209.97.128.71"
$REMOTE_PATH = "/var/www/mozsolidaria/frontend/dist"
$BUILD_PATH = "dist"

Write-Host "🚀 Iniciando deploy para servidor..." -ForegroundColor Green
Write-Host ""

# 1. Verificar se o build existe
if (-not (Test-Path $BUILD_PATH)) {
    Write-Host "❌ Diretório 'dist' não encontrado. Execute 'npm run build' primeiro." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build encontrado: $BUILD_PATH" -ForegroundColor Green

# 2. Fazer backup no servidor
Write-Host ""
Write-Host "📦 Criando backup no servidor..." -ForegroundColor Yellow
ssh $SERVER "mkdir -p /root/backups && tar -czf /root/backups/frontend_backup_$(date +%Y%m%d_%H%M%S).tar.gz -C /var/www/mozsolidaria/frontend dist 2>/dev/null || echo 'Sem backup anterior'"

# 3. Upload do build
Write-Host ""
Write-Host "📤 Fazendo upload do build..." -ForegroundColor Yellow
scp -r "$BUILD_PATH/*" "${SERVER}:${REMOTE_PATH}/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Upload concluído com sucesso" -ForegroundColor Green
} else {
    Write-Host "❌ Erro no upload" -ForegroundColor Red
    exit 1
}

# 4. Upload do script de configuração Nginx
Write-Host ""
Write-Host "📤 Fazendo upload do script de configuração Nginx..." -ForegroundColor Yellow
scp deploy_nginx_config.sh "${SERVER}:/root/"

# 5. Perguntar se deseja executar configuração Nginx
Write-Host ""
$configNginx = Read-Host "Deseja executar a configuração do Nginx? (s/N)"
if ($configNginx -eq "s" -or $configNginx -eq "S") {
    Write-Host "🔧 Configurando Nginx..." -ForegroundColor Yellow
    ssh $SERVER "chmod +x /root/deploy_nginx_config.sh && /root/deploy_nginx_config.sh"
}

# 6. Ajustar permissões
Write-Host ""
Write-Host "🔐 Ajustando permissões..." -ForegroundColor Yellow
ssh $SERVER "chown -R www-data:www-data /var/www/mozsolidaria/frontend/dist && chmod -R 755 /var/www/mozsolidaria/frontend/dist"

# 7. Recarregar Nginx
Write-Host ""
Write-Host "🔄 Recarregando Nginx..." -ForegroundColor Yellow
ssh $SERVER "nginx -t && systemctl reload nginx"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Site disponível em: https://mozsolidaria.org" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Verificações recomendadas:" -ForegroundColor Yellow
    Write-Host "  1. Acessar https://mozsolidaria.org e verificar se carrega"
    Write-Host "  2. Abrir Console do navegador (F12) e verificar:"
    Write-Host "     - Sem erros de manifest"
    Write-Host "     - Sem warnings de mixed content"
    Write-Host "     - Imagens carregando (ou fallback funcionando)"
    Write-Host "  3. Testar em modo anônimo para cache limpo"
    Write-Host ""
    Write-Host "📊 Monitoramento de logs (no servidor):" -ForegroundColor Yellow
    Write-Host "  ssh $SERVER 'tail -f /var/log/nginx/mozsolidaria_error.log'"
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Erro ao recarregar Nginx" -ForegroundColor Red
    Write-Host "Execute no servidor: ssh $SERVER 'nginx -t'" -ForegroundColor Yellow
}
