-- Drop existing policies
DROP POLICY IF EXISTS "Permitir insert/update para admins" ON refeicoes;
DROP POLICY IF EXISTS "refeicoes_select_policy" ON refeicoes;
DROP POLICY IF EXISTS "refeicoes_insert_policy" ON refeicoes;

-- Enable RLS
ALTER TABLE refeicoes ENABLE ROW LEVEL SECURITY;

-- Create SELECT policy (permite visualização para todos autenticados)
CREATE POLICY "refeicoes_select_policy" ON refeicoes
    FOR SELECT TO authenticated
    USING (true);

-- Create INSERT policy (permite inserção apenas para admins não suspensos)
CREATE POLICY "refeicoes_insert_policy" ON refeicoes
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND NOT au.suspenso
        )
    );

-- Create UPDATE policy (permite atualização apenas para admins não suspensos)
CREATE POLICY "refeicoes_update_policy" ON refeicoes
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND NOT au.suspenso
        )
    );

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON refeicoes TO authenticated;

-- Add helpful comments
COMMENT ON POLICY "refeicoes_select_policy" ON refeicoes IS 'Permite que usuários autenticados visualizem todas as refeições';
COMMENT ON POLICY "refeicoes_insert_policy" ON refeicoes IS 'Permite que apenas admins não suspensos insiram refeições';
COMMENT ON POLICY "refeicoes_update_policy" ON refeicoes IS 'Permite que apenas admins não suspensos atualizem refeições';