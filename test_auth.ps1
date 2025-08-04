# Script PowerShell para testar o sistema de autenticação e permissões
# Uso: .\test_auth.ps1

Write-Host "🔐 Testando Sistema de Autenticação - MOZ SOLIDÁRIA" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Configurações
$baseUrl = "http://localhost:8000/api/v1"
$adminUser = "admin"
$adminPass = "admin123"

Write-Host ""
Write-Host "1️⃣ Testando Login..." -ForegroundColor Yellow

$loginBody = @{
    username = $adminUser
    password = $adminPass
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/token/" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login realizado com sucesso" -ForegroundColor Green
    $accessToken = $loginResponse.access
    $refreshToken = $loginResponse.refresh
    Write-Host "📝 Token obtido: $($accessToken.Substring(0, [Math]::Min(20, $accessToken.Length)))..." -ForegroundColor Gray
}
catch {
    Write-Host "❌ Falha no login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "2️⃣ Testando acesso ao perfil..." -ForegroundColor Yellow

$headers = @{
    Authorization = "Bearer $accessToken"
}

try {
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/core/profile/" -Method GET -Headers $headers
    Write-Host "✅ Perfil acessado com sucesso" -ForegroundColor Green
    Write-Host "👤 Usuário: $($profileResponse.username)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Falha ao acessar perfil: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "3️⃣ Testando criação de post..." -ForegroundColor Yellow

$postData = @{
    title = "Post de Teste - Segurança"
    content = "<p>Este é um post criado para testar o sistema de permissões.</p>"
    excerpt = "Post de teste para verificar autenticação"
    status = "published"
} | ConvertTo-Json

$headersWithContent = @{
    Authorization = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

try {
    $createPostResponse = Invoke-RestMethod -Uri "$baseUrl/blog/posts/" -Method POST -Body $postData -Headers $headersWithContent
    Write-Host "✅ Post criado com sucesso" -ForegroundColor Green
    Write-Host "📄 Slug do post: $($createPostResponse.slug)" -ForegroundColor Gray
}
catch {
    Write-Host "❌ Falha ao criar post: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "4️⃣ Testando acesso sem autenticação..." -ForegroundColor Yellow

try {
    Invoke-RestMethod -Uri "$baseUrl/blog/posts/" -Method POST -Body $postData -ContentType "application/json" -ErrorAction Stop
    Write-Host "❌ Falha na proteção - acesso permitido sem auth" -ForegroundColor Red
}
catch {
    if ($_.Exception.Response.StatusCode -eq 401 -or $_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✅ Bloqueio de acesso sem auth funcionando ($($_.Exception.Response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro inesperado: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "5️⃣ Testando acesso a categorias..." -ForegroundColor Yellow

try {
    $categoriesResponse = Invoke-RestMethod -Uri "$baseUrl/blog/categories/" -Method GET
    Write-Host "✅ Lista de categorias acessível publicamente" -ForegroundColor Green
}
catch {
    Write-Host "❌ Falha ao acessar categorias: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "6️⃣ Testando criação de categoria (requer staff)..." -ForegroundColor Yellow

$categoryData = @{
    name = "Categoria Teste"
    description = "Categoria criada para teste de permissões"
} | ConvertTo-Json

try {
    $createCategoryResponse = Invoke-RestMethod -Uri "$baseUrl/blog/categories/" -Method POST -Body $categoryData -Headers $headersWithContent
    Write-Host "✅ Categoria criada com sucesso (usuário admin é staff)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Falha ao criar categoria: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "7️⃣ Testando refresh token..." -ForegroundColor Yellow

$refreshBody = @{
    refresh = $refreshToken
} | ConvertTo-Json

try {
    $refreshResponse = Invoke-RestMethod -Uri "$baseUrl/auth/token/refresh/" -Method POST -Body $refreshBody -ContentType "application/json"
    Write-Host "✅ Refresh token funcionando" -ForegroundColor Green
}
catch {
    Write-Host "❌ Falha no refresh token: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Teste de permissões concluído!" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Para testar no frontend:" -ForegroundColor White
Write-Host "1. Acesse http://localhost:5173" -ForegroundColor Gray
Write-Host "2. Tente acessar /dashboard (deve redirecionar para login)" -ForegroundColor Gray
Write-Host "3. Faca login com admin/admin123" -ForegroundColor Gray
Write-Host "4. Acesse /dashboard novamente (deve funcionar)" -ForegroundColor Gray
Write-Host "5. Verifique o dropdown do usuario no header" -ForegroundColor Gray
