-- Drop existing policies
DROP POLICY IF EXISTS "refeicoes_extras_insert_policy" ON refeicoes_extras;
DROP POLICY IF EXISTS "refeicoes_extras_select_policy" ON refeicoes_extras;
DROP POLICY IF EXISTS "refeicoes_extras_update_policy" ON refeicoes_extras;

-- Enable RLS
ALTER TABLE refeicoes_extras ENABLE ROW LEVEL SECURITY;

-- Create insert policy that properly checks admin permissions
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
            AND autorizado_por::uuid = auth.uid()
        )
    );

-- Create select policy
CREATE POLICY "refeicoes_extras_select_policy" ON refeicoes_extras
    FOR SELECT TO authenticated
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
    );

-- Create update policy
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
    );

-- Add helpful comments
COMMENT ON POLICY "refeicoes_extras_insert_policy" ON refeicoes_extras IS 
'Permite inserção de refeições extras apenas para administradores com permissões adequadas e garante que autorizado_por seja o usuário atual';

COMMENT ON POLICY "refeicoes_extras_select_policy" ON refeicoes_extras IS 
'Permite visualização de refeições extras apenas para administradores com permissões adequadas';

COMMENT ON POLICY "refeicoes_extras_update_policy" ON refeicoes_extras IS 
'Permite atualização de refeições extras apenas para administradores com permissões adequadas';