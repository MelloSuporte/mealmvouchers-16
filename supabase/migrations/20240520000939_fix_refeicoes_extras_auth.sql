-- Drop existing policies
DROP POLICY IF EXISTS "refeicoes_extras_insert_policy" ON refeicoes_extras;
DROP POLICY IF EXISTS "refeicoes_extras_select_policy" ON refeicoes_extras;
DROP POLICY IF EXISTS "refeicoes_extras_update_policy" ON refeicoes_extras;
DROP POLICY IF EXISTS "refeicoes_extras_delete_policy" ON refeicoes_extras;

-- Enable RLS
ALTER TABLE refeicoes_extras ENABLE ROW LEVEL SECURITY;

-- Create insert policy that checks admin permissions
CREATE POLICY "refeicoes_extras_insert_policy" ON refeicoes_extras
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id::text = autorizado_por
            AND NOT au.suspenso
        )
    );

-- Create select policy
CREATE POLICY "refeicoes_extras_select_policy" ON refeicoes_extras
    FOR SELECT TO authenticated, anon
    USING (true);

-- Create update policy
CREATE POLICY "refeicoes_extras_update_policy" ON refeicoes_extras
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id::text = autorizado_por
            AND NOT au.suspenso
        )
    );

-- Create delete policy
CREATE POLICY "refeicoes_extras_delete_policy" ON refeicoes_extras
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id::text = autorizado_por
            AND NOT au.suspenso
        )
    );

-- Grant necessary permissions
GRANT ALL ON refeicoes_extras TO authenticated;
GRANT SELECT ON refeicoes_extras TO anon;

-- Add helpful comments
COMMENT ON POLICY "refeicoes_extras_insert_policy" ON refeicoes_extras IS 
'Permite inserção apenas para administradores autorizados e não suspensos';

COMMENT ON POLICY "refeicoes_extras_select_policy" ON refeicoes_extras IS 
'Permite visualização para todos os usuários';

COMMENT ON POLICY "refeicoes_extras_update_policy" ON refeicoes_extras IS 
'Permite atualização apenas para administradores autorizados e não suspensos';

COMMENT ON POLICY "refeicoes_extras_delete_policy" ON refeicoes_extras IS 
'Permite exclusão apenas para administradores autorizados e não suspensos';