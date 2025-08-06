// Teste de conversão para verificar se os cálculos estão corretos

// Dados da API (como retornados pelo debug)
const metrics = {
  people_impacted: 8215,
  budget_used: "1079176.00",
  budget_total: "1000000.00",
  progress_percentage: 85,
  completed_milestones: 3,
  total_milestones: 5
};

console.log("=== TESTE DE CONVERSÃO FRONTEND ===");
console.log("📊 Dados originais da API:");
console.log(JSON.stringify(metrics, null, 2));

console.log("\n🔢 Testes de conversão:");

// Teste Number() vs parseFloat()
console.log("\n1. budget_used:");
console.log("   Number():", Number(metrics.budget_used));
console.log("   parseFloat():", parseFloat(metrics.budget_used));

console.log("\n2. budget_total:");
console.log("   Number():", Number(metrics.budget_total));
console.log("   parseFloat():", parseFloat(metrics.budget_total));

// Teste de cálculo de percentagem
console.log("\n📈 Cálculos de percentagem:");
const budgetUsedNum = parseFloat(metrics.budget_used);
const budgetTotalNum = parseFloat(metrics.budget_total);
const budgetPercentage = (budgetUsedNum / budgetTotalNum) * 100;

console.log("   budget_used (float):", budgetUsedNum);
console.log("   budget_total (float):", budgetTotalNum);
console.log("   Percentagem calculada:", budgetPercentage.toFixed(1) + "%");

// Teste formatação de valores
console.log("\n💰 Formatação de valores:");
console.log("   budget_used formatado:", budgetUsedNum.toLocaleString('pt-MZ') + " MZN");
console.log("   budget_total formatado:", budgetTotalNum.toLocaleString('pt-MZ') + " MZN");

// Teste people_impacted
console.log("\n👥 Pessoas impactadas:");
console.log("   Valor original:", metrics.people_impacted);
console.log("   Formatado:", metrics.people_impacted.toLocaleString('pt-MZ'));
