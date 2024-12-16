-- Drop existing policies
DROP POLICY IF EXISTS "tipos_refeicao_select_policy" ON tipos_refeicao;
DROP POLICY IF EXISTS "tipos_refeicao_insert_policy" ON tipos_refeicao;
DROP POLICY IF EXISTS "tipos_refeicao_update_policy" ON tipos_refeicao;
DROP POLICY IF EXISTS "tipos_refeicao_delete_policy" ON tipos_refeicao;

-- Enable RLS
ALTER TABLE tipos_refeicao ENABLE ROW LEVEL SECURITY;

-- Create new policies with proper access control
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

-- Grant necessary permissions
GRANT ALL ON tipos_refeicao TO authenticated;
GRANT SELECT ON tipos_refeicao TO anon;
GRANT ALL ON tipos_refeicao TO service_role;

-- Add documentation
COMMENT ON TABLE tipos_refeicao IS 'Tabela de tipos de refeição com políticas RLS para controle de acesso';