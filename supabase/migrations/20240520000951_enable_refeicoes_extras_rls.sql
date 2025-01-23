-- Enable RLS on refeicoes_extras
ALTER TABLE refeicoes_extras ENABLE ROW LEVEL SECURITY;

-- Create policies for refeicoes_extras
CREATE POLICY "refeicoes_extras_select_policy" ON refeicoes_extras
    FOR SELECT TO authenticated
    USING (true);

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
    );

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

-- Grant necessary permissions
GRANT ALL ON refeicoes_extras TO authenticated;
GRANT SELECT ON refeicoes_extras TO anon;

-- Add helpful comment
COMMENT ON TABLE refeicoes_extras IS 'Tabela de refeições extras com RLS habilitado';