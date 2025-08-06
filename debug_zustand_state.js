// Debug para verificar se os dados estão sendo atualizados no Zustand store
import { useProjectDataStore } from './src/components/ProjectDataBridgeNew';

// Verificar estado atual do store
const store = useProjectDataStore.getState();

console.log("=== DEBUG: ESTADO ATUAL DO ZUSTAND STORE ===");
console.log("📊 Projetos no store:", store.projects.size);

store.projects.forEach((projectData, slug) => {
  console.log(`\n🔍 Projeto: ${slug}`);
  console.log("📈 Métricas:", {
    people_impacted: projectData.metrics?.people_impacted,
    budget_used: projectData.metrics?.budget_used,
    budget_total: projectData.metrics?.budget_total,
    progress_percentage: projectData.metrics?.progress_percentage,
    last_updated: projectData.metrics?.last_updated
  });
  
  console.log("📝 Updates:", {
    total: projectData.updates?.length || 0,
    published: projectData.updates?.filter(u => u.status === 'published').length || 0,
    lastUpdate: projectData.updates?.[0]?.title || 'Nenhum'
  });
  
  // Calcular totais dos updates
  const publishedUpdates = projectData.updates?.filter(u => u.status === 'published') || [];
  const totalPeople = publishedUpdates.reduce((sum, update) => sum + (update.people_impacted || 0), 0);
  const totalBudget = publishedUpdates.reduce((sum, update) => sum + (parseFloat(update.budget_spent || '0') || 0), 0);
  
  console.log("🧮 Cálculos derivados:", {
    totalPeopleFromUpdates: totalPeople,
    totalBudgetFromUpdates: totalBudget
  });
});

// Verificar se há cache válido
console.log("\n⏰ Cache info:");
store.lastFetch.forEach((time, slug) => {
  const ageMinutes = (Date.now() - time) / (1000 * 60);
  console.log(`${slug}: ${ageMinutes.toFixed(1)} minutos atrás`);
});

// Função para testar uma nova atualização
export async function testAddUpdate() {
  console.log("\n🧪 TESTE: Adicionando nova atualização...");
  
  try {
    const result = await store.addProjectUpdate('Joel', {
      title: `Teste Atualização ${Date.now()}`,
      description: 'Teste para verificar se as métricas são atualizadas',
      type: 'progress',
      people_impacted: 50,
      budget_spent: '5000',
      progress_percentage: 90,
      status: 'published'
    });
    
    console.log("✅ Atualização criada:", result);
    
    // Verificar estado após a atualização
    setTimeout(() => {
      const newState = useProjectDataStore.getState();
      const projectData = newState.projects.get('Joel');
      
      console.log("\n📊 Estado após atualização:");
      console.log("Métricas:", {
        people_impacted: projectData?.metrics?.people_impacted,
        budget_used: projectData?.metrics?.budget_used,
        progress_percentage: projectData?.metrics?.progress_percentage
      });
      console.log("Total updates:", projectData?.updates?.length);
    }, 1000);
    
  } catch (error) {
    console.error("❌ Erro no teste:", error);
  }
}
