// Debug script para verificar token de autenticação
console.log('🔍 Debug: Verificando tokens de autenticação...');

// Verificar todos os tokens possíveis no localStorage
const authToken = localStorage.getItem('authToken');
const accessToken = localStorage.getItem('access_token');
const refreshToken = localStorage.getItem('refreshToken');
const userData = localStorage.getItem('userData');

console.log('📋 Tokens encontrados:');
console.log('  authToken:', authToken ? 'PRESENTE' : 'AUSENTE');
console.log('  access_token:', accessToken ? 'PRESENTE' : 'AUSENTE');
console.log('  refreshToken:', refreshToken ? 'PRESENTE' : 'AUSENTE');
console.log('  userData:', userData ? 'PRESENTE' : 'AUSENTE');

if (authToken) {
  console.log('🔐 authToken (primeiros 20 chars):', authToken.substring(0, 20) + '...');
  
  // Verificar se o token é válido fazendo uma chamada de teste
  fetch('http://localhost:8000/api/v1/auth/user/', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  })
  .then(response => {
    console.log('✅ Teste de token - Status:', response.status);
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  })
  .then(data => {
    console.log('👤 Usuário autenticado:', data);
  })
  .catch(error => {
    console.log('❌ Token inválido:', error.message);
  });
} else {
  console.log('❌ Nenhum token de autenticação encontrado');
  console.log('💡 Para testar as exportações, você precisa fazer login primeiro');
}

// Verificar se existe alguma função de login disponível
if (window.location.pathname.includes('login') || document.querySelector('[data-testid="login"]')) {
  console.log('🔑 Página de login detectada');
} else {
  console.log('🌐 Para fazer login, acesse a página de login do sistema');
}
