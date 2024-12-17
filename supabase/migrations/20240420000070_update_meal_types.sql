-- Primeiro limpa os dados existentes
TRUNCATE TABLE tipos_refeicao RESTART IDENTITY CASCADE;

-- Insere os novos tipos de refeição
INSERT INTO tipos_refeicao (nome, hora_inicio, hora_fim, valor, ativo, minutos_tolerancia) VALUES
    ('Café 04:00 às 05:00', '04:00:00', '05:00:00', 15.00, true, 15),
    ('Ceia', '00:00:00', '04:00:00', 15.00, true, 15),
    ('Refeição Extra', NULL, NULL, 20.00, true, 15),
    ('Café 06:00 às 06:30', '06:00:00', '06:30:00', 15.00, true, 15),
    ('Jantar', '18:00:00', '20:00:00', 25.00, true, 15),
    ('Lanche', '15:00:00', '16:00:00', 15.00, true, 15),
    ('Café 08:00 às 08:30', '08:00:00', '08:30:00', 15.00, true, 15),
    ('Almoço', '11:00:00', '14:00:00', 25.00, true, 15);

-- Atualiza as políticas RLS
DROP POLICY IF EXISTS "tipos_refeicao_select_policy" ON tipos_refeicao;
DROP POLICY IF EXISTS "tipos_refeicao_insert_policy" ON tipos_refeicao;
DROP POLICY IF EXISTS "tipos_refeicao_update_policy" ON tipos_refeicao;
DROP POLICY IF EXISTS "tipos_refeicao_delete_policy" ON tipos_refeicao;

-- Recria as políticas
CREATE POLICY "tipos_refeicao_select_policy" ON tipos_refeicao
    FOR SELECT TO authenticated, anon
    USING (true);

CREATE POLICY "tipos_refeicao_insert_policy" ON tipos_refeicao
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

CREATE POLICY "tipos_refeicao_update_policy" ON tipos_refeicao
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

CREATE POLICY "tipos_refeicao_delete_policy" ON tipos_refeicao
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
    );

-- Garante as permissões necessárias
GRANT ALL ON tipos_refeicao TO authenticated;
GRANT SELECT ON tipos_refeicao TO anon;
GRANT ALL ON tipos_refeicao TO service_role;