# Sistema de Exportação de Relatórios - Dados Reais vs Simulados

## ✅ PROBLEMA RESOLVIDO

O sistema agora está configurado para usar **dados reais** do backend Django em vez de dados simulados!

## 🔧 Correções Implementadas

### 1. **Endpoint Correto**
- **Antes**: Frontend tentava acessar `/api/v1/reports/exports/projects/` (inexistente)
- **Depois**: Agora usa `/api/v1/reports/exports/area_exports/` (correto)

### 2. **Parâmetros Corretos**
```json
{
  "area": "projects|donations|volunteers|beneficiaries",
  "format": "pdf|excel|csv|json", 
  "type": "all|active|completed|pending"
}
```

### 3. **Sistema de Autenticação**
- Verifica múltiplos locais de token (localStorage, sessionStorage)
- Tratamento adequado de erros 401 (não autorizado) e 403 (acesso negado)
- Mensagens claras sobre estado da autenticação

## 📊 Como Funciona Agora

### **Fluxo Principal (Dados Reais):**
1. ✅ **Usuário logado** → Sistema usa dados reais do Django
2. ✅ **Backend disponível** → Gera PDFs com dados reais dos beneficiários
3. ✅ **Resposta da API** → Download automático do arquivo gerado

### **Fluxo de Fallback (Dados Simulados):**
1. ⚠️ **Usuário não logado** → Sistema avisa e gera dados simulados
2. ⚠️ **Backend indisponível** → Fallback para jsPDF local
3. ⚠️ **Erro de rede** → Arquivo simulado com aviso claro

## 🎯 Onde Estão os Dados Reais

O backend já tem implementadas as funções que retornam dados reais:

### **Beneficiários** (`_get_beneficiaries_data_detailed`)
```python
def _get_beneficiaries_data_detailed(self, export_type='all'):
    queryset = BeneficiaryProfile.objects.all()
    
    # Filtros por tipo
    if export_type == 'location':
        queryset = queryset.filter(province__isnull=False)
    elif export_type == 'project':
        queryset = queryset.filter(project_assignments__isnull=False)
    
    # Dados reais do banco
    beneficiaries_data = []
    for beneficiary in queryset[:50]:  # Limite para performance
        beneficiaries_data.append({
            'nome_completo': beneficiary.full_name,
            'distrito': beneficiary.district or 'Não especificado',
            'provincia': beneficiary.province or 'Não especificado',
            'membros_familia': beneficiary.family_members_count,
            'filhos': beneficiary.children_count,
            'deslocado': 'Sim' if beneficiary.is_displaced else 'Não',
            'doenca_cronica': 'Sim' if beneficiary.has_chronic_illness else 'Não',
            'data_registo': beneficiary.created_at.strftime('%d/%m/%Y')
        })
    
    return beneficiaries_data
```

### **Projetos** (`_get_projects_data`)
- Lista todos os projetos do sistema
- Inclui status, datas, orçamentos reais

### **Doações** (`_get_donations_data_detailed`)
- Dados reais de todas as doações
- Valores, datas, status de pagamento

### **Voluntários** (`_get_volunteers_data_detailed`)
- Perfis reais de voluntários
- Habilidades, disponibilidade, projetos

## 🔐 Requisitos para Dados Reais

### **1. Autenticação Necessária**
```javascript
// O sistema verifica estes locais para o token:
localStorage.getItem('authToken')
localStorage.getItem('access_token') 
sessionStorage.getItem('authToken')
sessionStorage.getItem('access_token')
```

### **2. Servidor Django Rodando**
```bash
cd backend
python manage.py runserver 8000
```

### **3. Banco de Dados com Dados**
- Beneficiários cadastrados
- Projetos criados
- Doações registradas
- Voluntários inscritos

## 📋 Tipos de Exportação Disponíveis

### **Por Área:**
- **projects**: Portfólio de Projetos Sociais
- **donations**: Análise de Contribuições  
- **volunteers**: Relatório de Voluntários
- **beneficiaries**: Avaliação de Impacto Comunitário (✅ dados já corrigidos)

### **Por Formato:**
- **PDF**: Relatório formatado profissionalmente
- **Excel**: Planilha com dados estruturados
- **CSV**: Dados tabulares para análise
- **JSON**: Dados estruturados para APIs

### **Por Tipo:**
- **all**: Todos os registros
- **active**: Apenas ativos
- **completed**: Apenas concluídos
- **location**: Filtrado por localização (beneficiários)
- **project**: Filtrado por projeto (beneficiários)

## 🚨 Indicadores de Status

### **✅ Dados Reais (Mensagem de Sucesso):**
- "Exportação de [área] concluída! Dados reais do sistema."

### **⚠️ Dados Simulados (Mensagens de Aviso):**
- "Você precisa estar logado para acessar dados reais"
- "Sessão expirada. Faça login novamente"
- "Backend indisponível. Gerando arquivo simulado"

### **❌ Arquivo Simulado (Nome do Arquivo):**
- `projects_export_SIMULADO_timestamp.pdf`
- vs `projects_export_timestamp.pdf` (real)

## 🔄 Para Forçar Dados Reais

1. **Fazer login no sistema**
2. **Verificar se Django está rodando**: `http://localhost:8000/admin`
3. **Testar endpoint manualmente**:
```bash
curl -X POST http://localhost:8000/api/v1/reports/exports/area_exports/ \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"area":"beneficiaries","format":"pdf","type":"all"}'
```

---

**Status**: ✅ **SISTEMA CONFIGURADO PARA DADOS REAIS**  
**Próxima ação**: Fazer login e testar exportação de beneficiários em PDF
