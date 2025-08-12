// Teste para verificar formatação de moeda
import { formatCurrency } from '../src/lib/utils';

console.log('🧪 Teste de formatação de moeda:');
console.log('formatCurrency(160770.93):', formatCurrency(160770.93));
console.log('formatCurrency(5359.031):', formatCurrency(5359.031));
console.log('formatCurrency(50000):', formatCurrency(50000));
console.log('formatCurrency(165.95):', formatCurrency(165.95));

// Verificar se não há MTn
const result = formatCurrency(12345.67);
console.log('Resultado:', result);
console.log('Contém MTn?', result.includes('MTn'));
console.log('Contém MZN?', result.includes('MZN'));
