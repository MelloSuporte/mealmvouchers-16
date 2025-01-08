-- Drop existing policies
DROP POLICY IF EXISTS "refeicoes_extras_insert_policy" ON refeicoes_extras;
DROP POLICY IF EXISTS "refeicoes_extras_select_policy" ON refeicoes_extras;
DROP POLICY IF EXISTS "refeicoes_extras_update_policy" ON refeicoes_extras;

-- Enable RLS
ALTER TABLE refeicoes_extras ENABLE ROW LEVEL SECURITY;

-- Create simplified insert policy that allows authenticated users with proper permissions
CREATE POLICY "refeicoes_extras_insert_policy" ON refeicoes_extras
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND (
                au.permissoes->>'gerenciar_refeicoes_extras' = 'true'
                OR au.permissoes->>'gerenciar_usuarios' = 'true'
            )
            AND NOT au.suspenso
        )
        OR 
        auth.role() = 'authenticated'
    );

-- Create simplified select policy that allows all authenticated users to view
CREATE POLICY "refeicoes_extras_select_policy" ON refeicoes_extras
    FOR SELECT TO authenticated
    USING (true);

-- Create simplified update policy
CREATE POLICY "refeicoes_extras_update_policy" ON refeicoes_extras
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND (
                au.permissoes->>'gerenciar_refeicoes_extras' = 'true'
                OR au.permissoes->>'gerenciar_usuarios' = 'true'
            )
            AND NOT au.suspenso
        )
        OR 
        auth.role() = 'authenticated'
    );

-- Grant necessary permissions
GRANT ALL ON refeicoes_extras TO authenticated;
GRANT ALL ON refeicoes_extras TO anon;

-- Add helpful comments
COMMENT ON POLICY "refeicoes_extras_insert_policy" ON refeicoes_extras IS 
'Permite inserção de refeições extras para administradores com permissão específica ou usuários autenticados';

COMMENT ON POLICY "refeicoes_extras_select_policy" ON refeicoes_extras IS 
'Permite visualização de refeições extras para usuários autenticados';

COMMENT ON POLICY "refeicoes_extras_update_policy" ON refeicoes_extras IS 
'Permite atualização de refeições extras para administradores com permissão específica ou usuários autenticados';