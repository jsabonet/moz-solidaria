// debug-token-problem.js - Debug específico do problema de token
// Execute no console do navegador quando estiver na ClientArea

console.log('🔍 DEBUG DO PROBLEMA DE TOKEN');
console.log('=' .repeat(50));

// 1. Verificar token atual
const authToken = localStorage.getItem('authToken');
const refreshToken = localStorage.getItem('refreshToken');

console.log('1. TOKENS ARMAZENADOS:');
console.log('   authToken existe:', !!authToken);
console.log('   authToken tipo:', authToken ? (authToken.startsWith('ey') ? 'JWT' : 'DRF Token') : 'N/A');
console.log('   refreshToken existe:', !!refreshToken);

if (authToken) {
  console.log('   authToken (50 chars):', authToken.substring(0, 50) + '...');
  
  // Se for JWT, decodificar
  if (authToken.startsWith('ey')) {
    try {
      const payload = JSON.parse(atob(authToken.split('.')[1]));
      console.log('   JWT payload:', payload);
      console.log('   JWT expira em:', new Date(payload.exp * 1000));
      console.log('   JWT válido:', Date.now() < payload.exp * 1000);
    } catch (e) {
      console.error('   Erro ao decodificar JWT:', e);
    }
  }
}

// 2. Testar headers que serão enviadas
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
console.log('2. HEADERS QUE SERÃO ENVIADAS:', headers);

// 3. Testar autenticação diretamente
console.log('3. TESTANDO AUTENTICAÇÃO DIRETA...');

fetch('http://localhost:8000/api/v1/client-area/profile/', {
  method: 'GET',
  headers: getAuthHeaders()
})
.then(async response => {
  console.log('   Status:', response.status);
  console.log('   Status Text:', response.statusText);
  console.log('   Headers:', [...response.headers.entries()]);
  
  const text = await response.text();
  console.log('   Response:', text.substring(0, 200));
  
  if (response.status === 401) {
    console.log('🚨 ERRO 401 - VERIFICANDO POSSÍVEIS CAUSAS:');
    
    // Testar com diferentes formatos de header
    console.log('   Testando formato Bearer...');
    return fetch('http://localhost:8000/api/v1/client-area/profile/', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
  }
})
.then(async response => {
  if (response && response.status !== 401) {
    console.log('   ✅ Formato Bearer funciona:', response.status);
  } else if (response) {
    console.log('   ❌ Formato Bearer também falha:', response.status);
    
    // Testar formato Token
    console.log('   Testando formato Token...');
    return fetch('http://localhost:8000/api/v1/client-area/profile/', {
      headers: {
        'Authorization': `Token ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
  }
})
.then(async response => {
  if (response) {
    console.log('   Formato Token:', response.status);
    
    if (response.status === 401) {
      console.log('🔄 TENTANDO REFRESH TOKEN...');
      
      const refresh = localStorage.getItem('refreshToken');
      if (refresh) {
        return fetch('http://localhost:8000/api/v1/auth/token/refresh/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh })
        });
      }
    }
  }
})
.then(async response => {
  if (response) {
    console.log('   Refresh tentativa:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('   ✅ Novo token:', data.access.substring(0, 50) + '...');
      console.log('   📝 Atualize o localStorage e tente novamente');
    }
  }
})
.catch(error => {
  console.error('❌ Erro na requisição:', error);
});

// 4. Verificar se há conflito de autenticação
console.log('4. VERIFICANDO OUTROS SISTEMAS DE AUTH...');
console.log('   Cookies:', document.cookie);
console.log('   SessionStorage auth:', sessionStorage.getItem('authToken'));
