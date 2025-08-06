// Test script to debug API integration directly
import { fetchCompleteProjectData } from './src/lib/api.ts';

async function testApiIntegration() {
  try {
    console.log('🧪 Iniciando teste de integração da API...');
    
    const projectData = await fetchCompleteProjectData('Joel');
    
    console.log('✅ Dados recebidos:');
    console.log('- Nome do projeto:', projectData.name);
    console.log('- current_beneficiaries:', projectData.current_beneficiaries);
    console.log('- progress_percentage:', projectData.progress_percentage);
    
    if (projectData.metrics) {
      console.log('📊 Métricas disponíveis:');
      console.log('- peopleImpacted:', projectData.metrics.peopleImpacted);
      console.log('- progressPercentage:', projectData.metrics.progressPercentage);
      console.log('- completedMilestones:', projectData.metrics.completedMilestones);
      console.log('- totalMilestones:', projectData.metrics.totalMilestones);
    } else {
      console.log('❌ Sem métricas encontradas');
    }
    
    return projectData;
    
  } catch (error) {
    console.error('❌ Erro no teste de integração:', error);
    throw error;
  }
}

// Execute teste
testApiIntegration();
