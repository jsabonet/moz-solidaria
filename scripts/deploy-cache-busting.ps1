# Script de Deploy para Windows PowerShell
# Executa cache busting completo no ambiente de desenvolvimento/produção

param(
    [string]$Environment = "production",
    [switch]$SkipBackup = $false,
    [switch]$Force = $false
)

Write-Host "🚀 Iniciando deploy com cache busting..." -ForegroundColor Green
Write-Host "   Ambiente: $Environment" -ForegroundColor Cyan

# Definir diretório do projeto
$ProjectDir = Get-Location
$DistDir = Join-Path $ProjectDir "dist"
$ScriptsDir = Join-Path $ProjectDir "scripts"

# Verificar se estamos no diretório correto
if (!(Test-Path "package.json") -or !(Test-Path "vite.config.ts")) {
    Write-Host "❌ Erro: Execute este script no diretório raiz do projeto" -ForegroundColor Red
    exit 1
}

# Criar backup se necessário
if (!$SkipBackup -and (Test-Path $DistDir)) {
    $BackupDir = Join-Path $ProjectDir "backups\$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    Write-Host "📦 Criando backup em $BackupDir..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Copy-Item -Path $DistDir -Destination (Join-Path $BackupDir "dist_backup") -Recurse -Force
}

# Verificar Node.js e npm
Write-Host "🔍 Verificando dependências..." -ForegroundColor Cyan
if (!(Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js não encontrado" -ForegroundColor Red
    exit 1
}

if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm não encontrado" -ForegroundColor Red  
    exit 1
}

# Instalar/atualizar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Cyan
if (Test-Path "package-lock.json") {
    npm ci --silent
} else {
    npm install --silent
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao instalar dependências" -ForegroundColor Red
    exit 1
}

# Limpar dist anterior
if (Test-Path $DistDir) {
    Write-Host "🧹 Removendo build anterior..." -ForegroundColor Cyan
    Remove-Item -Path $DistDir -Recurse -Force
}

# Executar build com cache busting
Write-Host "🔨 Executando build com cache busting..." -ForegroundColor Green
if ($Environment -eq "production") {
    npm run build:production
} else {
    npm run build
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro no build" -ForegroundColor Red
    exit 1
}

# Verificar se build foi bem-sucedido
if (!(Test-Path $DistDir) -or !(Test-Path (Join-Path $DistDir "index.html"))) {
    Write-Host "❌ Build falhou ou arquivos não foram gerados" -ForegroundColor Red
    exit 1
}

# Adicionar timestamp ao index.html para forçar atualização
$IndexPath = Join-Path $DistDir "index.html"
if (Test-Path $IndexPath) {
    $Timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $IndexContent = Get-Content $IndexPath -Raw
    $CommentLine = "<!-- Build: $Timestamp -->`n"
    $UpdatedContent = $CommentLine + $IndexContent
    Set-Content -Path $IndexPath -Value $UpdatedContent -Encoding UTF8
    Write-Host "💾 Timestamp adicionado ao index.html" -ForegroundColor Green
}

# Verificar build-info.json
$BuildInfoPath = Join-Path $DistDir "build-info.json"
if (Test-Path $BuildInfoPath) {
    $BuildInfo = Get-Content $BuildInfoPath | ConvertFrom-Json
    Write-Host "✅ Build Info gerado:" -ForegroundColor Green
    Write-Host "   Build ID: $($BuildInfo.buildId)" -ForegroundColor Cyan
    Write-Host "   Versão: $($BuildInfo.version)" -ForegroundColor Cyan
    Write-Host "   Git Hash: $($BuildInfo.gitHash)" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Arquivo build-info.json não foi gerado" -ForegroundColor Yellow
}

# Verificar tamanho dos arquivos gerados
$JsFiles = Get-ChildItem -Path $DistDir -Recurse -Filter "*.js" | Measure-Object -Property Length -Sum
$CssFiles = Get-ChildItem -Path $DistDir -Recurse -Filter "*.css" | Measure-Object -Property Length -Sum

Write-Host "" -ForegroundColor White
Write-Host "📊 Estatísticas do build:" -ForegroundColor Green
Write-Host "   JS: $([math]::Round($JsFiles.Sum / 1KB, 2)) KB ($($JsFiles.Count) arquivos)" -ForegroundColor Cyan
Write-Host "   CSS: $([math]::Round($CssFiles.Sum / 1KB, 2)) KB ($($CssFiles.Count) arquivos)" -ForegroundColor Cyan

# Contar arquivos com hash
$HashedFiles = Get-ChildItem -Path $DistDir -Recurse | Where-Object { $_.Name -match "-[a-f0-9]{8,}\." }
Write-Host "   Arquivos com hash: $($HashedFiles.Count)" -ForegroundColor Cyan

Write-Host ""
Write-Host "🎉 Deploy com cache busting concluído!" -ForegroundColor Green
Write-Host ""

# Instruções para deploy em servidor
if ($Environment -eq "production") {
    Write-Host "📋 Próximos passos para servidor:" -ForegroundColor Yellow
    Write-Host "   1. Copiar pasta 'dist' para servidor" -ForegroundColor White
    Write-Host "   2. Atualizar nginx.conf se necessário" -ForegroundColor White
    Write-Host "   3. Reiniciar Nginx: sudo systemctl reload nginx" -ForegroundColor White
    Write-Host "   4. Verificar: https://mozsolidaria.org/build-info.json" -ForegroundColor White
    Write-Host ""
    
    # Gerar comando de sincronização
    Write-Host "💡 Comando sugerido para rsync:" -ForegroundColor Yellow
    Write-Host "   rsync -avz --delete dist/ user@server:/var/www/mozsolidaria/frontend/dist/" -ForegroundColor Gray
}

Write-Host "🔍 Para testar localmente:" -ForegroundColor Yellow  
Write-Host "   npm run preview" -ForegroundColor White
Write-Host ""
