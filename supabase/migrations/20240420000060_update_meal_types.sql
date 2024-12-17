-- Primeiro, vamos limpar os tipos de refeição existentes
TRUNCATE TABLE tipos_refeicao RESTART IDENTITY CASCADE;

-- Agora vamos inserir os novos tipos de refeição na ordem correta
INSERT INTO tipos_refeicao (nome, horario_inicio, horario_fim, valor, ativo, minutos_tolerancia) VALUES
    ('Café', '08:00', '08:30', 5.00, true, 15),
    ('Café', '04:00', '05:00', 5.00, true, 15),
    ('Jantar', '18:00', '19:00', 12.00, true, 15),
    ('Ceia', '23:00', '23:30', 8.00, true, 15),
    ('Almoço', '11:30', '13:30', 15.00, true, 15),
    ('Lanche', '15:00', '15:30', 6.00, true, 15),
    ('Café', '06:00', '06:30', 5.00, true, 15),
    ('Refeição Extra', NULL, NULL, 15.00, true, 15);

-- Adicionar comentário para documentação
COMMENT ON TABLE tipos_refeicao IS 'Tabela de tipos de refeição com horários específicos';

-- Atualizar as políticas RLS para garantir acesso correto
DROP POLICY IF EXISTS "tipos_refeicao_select_policy" ON tipos_refeicao;
CREATE POLICY "tipos_refeicao_select_policy" ON tipos_refeicao
    FOR SELECT TO authenticated, anon
    USING (true);