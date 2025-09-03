-- Script SQL para criar habilidades de voluntários
-- Execute este script no PostgreSQL do servidor de produção

INSERT INTO volunteers_volunteerskill (name, description, category, created_at) VALUES
('Programação', 'Desenvolvimento de software e aplicações', 'technical', NOW()),
('Design Gráfico', 'Criação de materiais visuais e gráficos', 'technical', NOW()),
('Fotografia', 'Documentação visual de eventos e atividades', 'technical', NOW()),
('Informática Básica', 'Conhecimentos básicos de computador e internet', 'technical', NOW()),
('Manutenção de Computadores', 'Reparo e manutenção de equipamentos', 'technical', NOW()),

('Primeiros Socorros', 'Atendimento básico de emergências médicas', 'healthcare', NOW()),
('Enfermagem', 'Cuidados de saúde e assistência médica', 'healthcare', NOW()),
('Psicologia', 'Apoio psicológico e aconselhamento', 'healthcare', NOW()),
('Nutrição', 'Orientação nutricional e alimentar', 'healthcare', NOW()),
('Fisioterapia', 'Reabilitação e exercícios terapêuticos', 'healthcare', NOW()),

('Ensino de Português', 'Alfabetização e ensino da língua portuguesa', 'education', NOW()),
('Ensino de Matemática', 'Ensino de matemática básica e avançada', 'education', NOW()),
('Ensino de Inglês', 'Ensino da língua inglesa', 'education', NOW()),
('Educação Infantil', 'Trabalho com crianças pequenas', 'education', NOW()),
('Formação de Adultos', 'Educação para adultos e idosos', 'education', NOW()),

('Construção Civil', 'Trabalhos de construção e reforma', 'construction', NOW()),
('Eletricidade', 'Instalações e reparos elétricos', 'construction', NOW()),
('Encanamento', 'Instalações hidráulicas e reparos', 'construction', NOW()),
('Carpintaria', 'Trabalhos em madeira e móveis', 'construction', NOW()),
('Pintura', 'Pintura de casas e edifícios', 'construction', NOW()),

('Contabilidade', 'Gestão financeira e contábil', 'administrative', NOW()),
('Gestão de Projetos', 'Coordenação e gestão de iniciativas', 'administrative', NOW()),
('Recursos Humanos', 'Gestão de pessoas e recrutamento', 'administrative', NOW()),
('Marketing', 'Promoção e divulgação de projetos', 'administrative', NOW()),
('Logística', 'Organização e distribuição de recursos', 'administrative', NOW()),

('Trabalho Social', 'Assistência social e comunitária', 'social', NOW()),
('Mediação de Conflitos', 'Resolução pacífica de disputas', 'social', NOW()),
('Organização Comunitária', 'Mobilização e organização social', 'social', NOW()),
('Cuidado de Idosos', 'Assistência a pessoas idosas', 'social', NOW()),
('Cuidado Infantil', 'Cuidado e proteção de crianças', 'social', NOW()),

('Condução', 'Transporte de pessoas e materiais', 'other', NOW()),
('Cozinha', 'Preparo de refeições para grupos', 'other', NOW()),
('Jardinagem', 'Cuidado de plantas e hortas', 'other', NOW()),
('Música', 'Ensino e apresentações musicais', 'other', NOW()),
('Desporto', 'Atividades esportivas e recreativas', 'other', NOW())

ON CONFLICT (name) DO NOTHING;

-- Verificar se foram inseridas
SELECT COUNT(*) as total_skills FROM volunteers_volunteerskill;
SELECT name, category FROM volunteers_volunteerskill ORDER BY category, name;
