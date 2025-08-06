// Simple test to verify the API is working
const API_BASE = 'http://localhost:8000/api/v1';

async function quickTest() {
  try {
    console.log('🧪 Teste rápido da API...');
    
    // Test tracking endpoint directly
    const response = await fetch(`${API_BASE}/tracking/project-tracking/Joel/`);
    const data = await response.json();
    
    console.log('✅ Resposta da API:');
    console.log('- Nome:', data.name);
    console.log('- People impacted:', data.metrics?.people_impacted);
    console.log('- Progress:', data.metrics?.progress_percentage + '%');
    console.log('- Milestones:', data.metrics?.completed_milestones + '/' + data.metrics?.total_milestones);
    
    // Simular o processamento da função
    const normalizedMetrics = {
      peopleImpacted: data.metrics.people_impacted,
      progressPercentage: data.metrics.progress_percentage,
      completedMilestones: data.metrics.completed_milestones,
      totalMilestones: data.metrics.total_milestones
    };
    
    console.log('🎯 Métricas normalizadas:', normalizedMetrics);
    
    return data;
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

quickTest();
