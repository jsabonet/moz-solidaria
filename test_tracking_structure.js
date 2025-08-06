// Test tracking endpoint response structure
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

async function testTrackingStructure() {
  try {
    console.log('🧪 Testando estrutura do endpoint de tracking...');
    
    const response = await axios.get(`${API_BASE}/tracking/project-tracking/Joel/`);
    const data = response.data;
    
    console.log('📦 Resposta completa:', JSON.stringify(data, null, 2));
    console.log('📊 Tipo da resposta:', typeof data);
    console.log('🔍 Chaves no nível raiz:', Object.keys(data));
    
    if (data.metrics) {
      console.log('✅ Métricas encontradas:', data.metrics);
    } else {
      console.log('❌ Métricas não encontradas');
    }
    
    // Verificar se é um array (paginado)
    if (Array.isArray(data.results) && data.results.length > 0) {
      const firstResult = data.results[0];
      console.log('📋 Primeiro resultado (array):', firstResult);
      if (firstResult.metrics) {
        console.log('✅ Métricas no primeiro resultado:', firstResult.metrics);
      }
    }
    
    return data;
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    throw error;
  }
}

testTrackingStructure();
