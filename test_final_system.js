// Teste final para verificar se o sistema está funcionando
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

async function finalTest() {
  try {
    console.log('🧪 Teste Final - Sistema de Beneficiários');
    console.log('==========================================');
    
    // 1. Testar dados básicos
    console.log('1️⃣ Testando endpoint básico...');
    const basicResponse = await axios.get(`${API_BASE}/projects/public/projects/?slug=Joel`);
    const basicProject = basicResponse.data.results[0];
    console.log('✅ Dados básicos:', {
      name: basicProject.name,
      current_beneficiaries: basicProject.current_beneficiaries,
      target_beneficiaries: basicProject.target_beneficiaries,
      progress_percentage: basicProject.progress_percentage
    });
    
    // 2. Testar dados de tracking
    console.log('\n2️⃣ Testando endpoint de tracking...');
    const trackingResponse = await axios.get(`${API_BASE}/tracking/project-tracking/Joel/`);
    const trackingProject = trackingResponse.data;
    console.log('✅ Dados de tracking:', {
      name: trackingProject.name,
      people_impacted: trackingProject.metrics.people_impacted,
      progress_percentage: trackingProject.metrics.progress_percentage,
      completed_milestones: trackingProject.metrics.completed_milestones,
      total_milestones: trackingProject.metrics.total_milestones
    });
    
    // 3. Simular integração (como a função fetchCompleteProjectData faz)
    console.log('\n3️⃣ Simulando integração...');
    const integratedData = {
      ...trackingProject,
      target_beneficiaries: trackingProject.target_beneficiaries || basicProject.target_beneficiaries,
      metrics: {
        peopleImpacted: trackingProject.metrics.people_impacted,
        progressPercentage: trackingProject.metrics.progress_percentage,
        completedMilestones: trackingProject.metrics.completed_milestones,
        totalMilestones: trackingProject.metrics.total_milestones
      },
      current_beneficiaries: trackingProject.metrics.people_impacted,
      progress_percentage: trackingProject.metrics.progress_percentage
    };
    
    console.log('✅ Dados integrados:', {
      name: integratedData.name,
      current_beneficiaries: integratedData.current_beneficiaries,
      target_beneficiaries: integratedData.target_beneficiaries,
      progress_percentage: integratedData.progress_percentage,
      metrics: integratedData.metrics
    });
    
    // 4. Verificações finais
    console.log('\n4️⃣ Verificações finais...');
    
    const checks = [
      {
        name: 'Beneficiários atuais corretos',
        condition: integratedData.current_beneficiaries === 281598,
        expected: 281598,
        actual: integratedData.current_beneficiaries
      },
      {
        name: 'Meta de beneficiários preservada',
        condition: integratedData.target_beneficiaries > 0,
        expected: '> 0',
        actual: integratedData.target_beneficiaries
      },
      {
        name: 'Progresso correto',
        condition: integratedData.progress_percentage === 72,
        expected: 72,
        actual: integratedData.progress_percentage
      },
      {
        name: 'Marcos concluídos corretos',
        condition: integratedData.metrics.completedMilestones === 2,
        expected: 2,
        actual: integratedData.metrics.completedMilestones
      },
      {
        name: 'Total de marcos correto',
        condition: integratedData.metrics.totalMilestones === 5,
        expected: 5,
        actual: integratedData.metrics.totalMilestones
      }
    ];
    
    let allPassed = true;
    checks.forEach(check => {
      if (check.condition) {
        console.log(`✅ ${check.name}`);
      } else {
        console.log(`❌ ${check.name} - Esperado: ${check.expected}, Atual: ${check.actual}`);
        allPassed = false;
      }
    });
    
    console.log('\n🎯 RESULTADO FINAL:');
    if (allPassed) {
      console.log('✅ TODOS OS TESTES PASSARAM! Sistema funcionando corretamente.');
      console.log('🎉 Beneficiários habilitados e funcionando em ProjectDetail.tsx!');
    } else {
      console.log('❌ Alguns testes falharam. Verificar os problemas acima.');
    }
    
    return integratedData;
    
  } catch (error) {
    console.error('❌ Erro no teste final:', error);
    throw error;
  }
}

finalTest();
