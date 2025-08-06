// Test the corrected fetchCompleteProjectData
import { fetchCompleteProjectData } from './src/lib/api.js';

async function testCorrectedFunction() {
  try {
    console.log('🧪 Testando função corrigida...');
    
    const projectData = await fetchCompleteProjectData('Joel');
    
    console.log('✅ Função executada com sucesso!');
    console.log('📊 Dados recebidos:');
    console.log('- Nome:', projectData.name);
    console.log('- current_beneficiaries:', projectData.current_beneficiaries);
    console.log('- progress_percentage:', projectData.progress_percentage);
    
    if (projectData.metrics) {
      console.log('🎯 Métricas disponíveis:');
      console.log('- peopleImpacted:', projectData.metrics.peopleImpacted);
      console.log('- progressPercentage:', projectData.metrics.progressPercentage);
      console.log('- completedMilestones:', projectData.metrics.completedMilestones);
      console.log('- totalMilestones:', projectData.metrics.totalMilestones);
    } else {
      console.log('❌ Sem métricas');
    }
    
    // Verificar se os números estão corretos
    const expectedBeneficiaries = 281598;
    const expectedProgress = 72;
    const expectedCompleted = 2;
    const expectedTotal = 5;
    
    if (projectData.metrics?.peopleImpacted === expectedBeneficiaries) {
      console.log('✅ Beneficiários corretos:', expectedBeneficiaries);
    } else {
      console.log('❌ Beneficiários incorretos. Esperado:', expectedBeneficiaries, 'Recebido:', projectData.metrics?.peopleImpacted);
    }
    
    if (projectData.metrics?.progressPercentage === expectedProgress) {
      console.log('✅ Progresso correto:', expectedProgress + '%');
    } else {
      console.log('❌ Progresso incorreto. Esperado:', expectedProgress, 'Recebido:', projectData.metrics?.progressPercentage);
    }
    
    if (projectData.metrics?.completedMilestones === expectedCompleted) {
      console.log('✅ Marcos concluídos corretos:', expectedCompleted);
    } else {
      console.log('❌ Marcos concluídos incorretos. Esperado:', expectedCompleted, 'Recebido:', projectData.metrics?.completedMilestones);
    }
    
    if (projectData.metrics?.totalMilestones === expectedTotal) {
      console.log('✅ Total de marcos correto:', expectedTotal);
    } else {
      console.log('❌ Total de marcos incorreto. Esperado:', expectedTotal, 'Recebido:', projectData.metrics?.totalMilestones);
    }
    
    return projectData;
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    throw error;
  }
}

testCorrectedFunction();
