// debug-auth-frontend.js - Script para debug do frontend
// Execute no console do navegador

console.log('🔍 DEBUG DE AUTENTICAÇÃO DO FRONTEND');
console.log('=' .repeat(40));

// 1. Verificar token armazenado
const storedToken = localStorage.getItem('authToken');
console.log('1. Token armazenado:');
console.log('   Existe:', !!storedToken);
console.log('   Primeiros 50 chars:', storedToken ? storedToken.substring(0, 50) + '...' : 'Nenhum');
console.log('   Tipo:', storedToken ? (storedToken.startsWith('ey') ? 'JWT' : 'DRF Token') : 'N/A');

// 2. Testar função getAuthHeaders
function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    if (token.startsWith('ey')) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      headers.Authorization = `Token ${token}`;
    }
  }
  
  return headers;
}

const headers = getAuthHeaders();
console.log('2. Headers geradas:', headers);

// 3. Testar requisição manual
console.log('3. Testando requisição manual...');

fetch('http://localhost:8000/api/v1/client-area/profile/', {
  method: 'GET',
  headers: getAuthHeaders()
})
.then(response => {
  console.log('   Status da resposta:', response.status);
  console.log('   Headers da resposta:', [...response.headers.entries()]);
  return response.text();
})
.then(text => {
  console.log('   Corpo da resposta:', text.substring(0, 200) + '...');
})
.catch(error => {
  console.error('   Erro na requisição:', error);
});

// 4. Verificar se há outros tokens
console.log('4. Outros itens no localStorage:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  const value = localStorage.getItem(key);
  if (key && (key.includes('token') || key.includes('auth'))) {
    console.log(`   ${key}: ${value ? value.substring(0, 50) + '...' : 'null'}`);
  }
}

// 5. Decodificar JWT se existir
if (storedToken && storedToken.startsWith('ey')) {
  try {
    const payload = JSON.parse(atob(storedToken.split('.')[1]));
    console.log('5. Payload do JWT:', payload);
    console.log('   User ID:', payload.user_id);
    console.log('   Expira em:', new Date(payload.exp * 1000));
    console.log('   Ainda válido:', Date.now() < payload.exp * 1000);
  } catch (e) {
    console.error('5. Erro ao decodificar JWT:', e);
  }
}
