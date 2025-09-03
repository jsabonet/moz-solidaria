-- Script SQL para criar métodos de doação
-- Execute este script no PostgreSQL do servidor de produção

INSERT INTO donations_donationmethod (name, description, account_details, is_active, created_at) VALUES
(
    'Transferência Bancária',
    'Transferência direta via sistema bancário',
    '{"banco": "BCI - Banco Comercial e de Investimentos", "conta": "0003.4567.8901.2345.6", "titular": "MOZ SOLIDÁRIA - Organização Humanitária", "iban": "MZ59 0003 4567 8901 2345 6789", "swift": "BCIMZMZM"}',
    true,
    NOW()
),
(
    'M-Pesa',
    'Pagamento via M-Pesa da Vodacom',
    '{"operadora": "Vodacom M-Pesa", "numero": "+258 84 204 0330", "nome": "MOZ SOLIDÁRIA", "referencia": "DOACAO-HUMANITARIA"}',
    true,
    NOW()
),
(
    'E-Mola',
    'Pagamento via E-Mola da Movitel',
    '{"operadora": "Movitel E-Mola", "numero": "+258 86 204 0330", "nome": "MOZ SOLIDÁRIA", "referencia": "DOACAO-HUMANITARIA"}',
    true,
    NOW()
),
(
    'Dinheiro',
    'Entrega de dinheiro em espécie',
    '{"tipo": "dinheiro", "local": "Escritório Moz Solidária", "endereco": "Rua da Solidariedade, Nº 123, Pemba", "horario": "Segunda a Sexta, 8h às 17h"}',
    true,
    NOW()
),
(
    'Outros Bancos',
    'Transferência via outros bancos nacionais',
    '{"bancos": ["Standard Bank", "BIM", "Millennium BIM", "FNB", "Banco Terra"], "conta_principal": "0003.4567.8901.2345.6", "titular": "MOZ SOLIDÁRIA"}',
    true,
    NOW()
)
ON CONFLICT (name) DO NOTHING;

-- Verificar se foram inseridos
SELECT COUNT(*) as total_methods FROM donations_donationmethod;
SELECT id, name, is_active FROM donations_donationmethod ORDER BY name;
