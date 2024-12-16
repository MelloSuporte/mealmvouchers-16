-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON tipos_refeicao;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON tipos_refeicao;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON tipos_refeicao;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON tipos_refeicao;

-- Enable RLS
ALTER TABLE tipos_refeicao ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "tipos_refeicao_select_policy" ON tipos_refeicao
    FOR SELECT TO authenticated, anon
    USING (true);

CREATE POLICY "tipos_refeicao_insert_policy" ON tipos_refeicao
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_refeicoes' = 'true'
            AND NOT au.suspenso
        )
    );

CREATE POLICY "tipos_refeicao_update_policy" ON tipos_refeicao
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_refeicoes' = 'true'
            AND NOT au.suspenso
        )
    );

CREATE POLICY "tipos_refeicao_delete_policy" ON tipos_refeicao
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_refeicoes' = 'true'
            AND NOT au.suspenso
        )
    );

-- Grant necessary permissions
GRANT ALL ON tipos_refeicao TO authenticated;
GRANT SELECT ON tipos_refeicao TO anon;
GRANT ALL ON tipos_refeicao TO service_role;