-- Drop existing policies
DROP POLICY IF EXISTS "refeicoes_select_policy" ON refeicoes;
DROP POLICY IF EXISTS "refeicoes_insert_policy" ON refeicoes;
DROP POLICY IF EXISTS "refeicoes_update_policy" ON refeicoes;

-- Enable RLS
ALTER TABLE refeicoes ENABLE ROW LEVEL SECURITY;

-- Create SELECT policy
CREATE POLICY "refeicoes_select_policy" ON refeicoes
    FOR SELECT TO authenticated
    USING (true);

-- Create INSERT policy
CREATE POLICY "refeicoes_insert_policy" ON refeicoes
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_tipos_refeicao' = 'true'
            AND NOT au.suspenso
        )
    );

-- Create UPDATE policy
CREATE POLICY "refeicoes_update_policy" ON refeicoes
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_tipos_refeicao' = 'true'
            AND NOT au.suspenso
        )
    );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON refeicoes TO authenticated;