-- Enable RLS
ALTER TABLE tipos_refeicao ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura (SELECT)
CREATE POLICY "tipos_refeicao_select_policy" ON tipos_refeicao
    FOR SELECT TO authenticated, anon
    USING (true);

-- Políticas de Inserção (INSERT)
CREATE POLICY "tipos_refeicao_insert_policy" ON tipos_refeicao
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
        OR 
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND (
                au.permissoes->>'gerenciar_vouchers_extra' = 'true'
                OR au.permissoes->>'gerenciar_vouchers_descartaveis' = 'true'
            )
            AND NOT au.suspenso
        )
    );

-- Políticas de Atualização (UPDATE)
CREATE POLICY "tipos_refeicao_update_policy" ON tipos_refeicao
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
        OR 
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND (
                au.permissoes->>'gerenciar_vouchers_extra' = 'true'
                OR au.permissoes->>'gerenciar_vouchers_descartaveis' = 'true'
            )
            AND NOT au.suspenso
        )
    );

-- Políticas de Deleção (DELETE)
CREATE POLICY "tipos_refeicao_delete_policy" ON tipos_refeicao
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM usuarios u
            WHERE u.id = auth.uid()
            AND u.role = 'admin'
            AND NOT u.suspenso
        )
        OR 
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND (
                au.permissoes->>'gerenciar_vouchers_extra' = 'true'
                OR au.permissoes->>'gerenciar_vouchers_descartaveis' = 'true'
            )
            AND NOT au.suspenso
        )
    );

-- Grant necessary permissions
GRANT ALL ON tipos_refeicao TO authenticated;
GRANT SELECT ON tipos_refeicao TO anon;
GRANT ALL ON tipos_refeicao TO service_role;

-- Add documentation
COMMENT ON TABLE tipos_refeicao IS 'Tabela de tipos de refeição com políticas RLS para controle de acesso';
COMMENT ON POLICY "tipos_refeicao_select_policy" ON tipos_refeicao IS 'Permite que qualquer usuário visualize os tipos de refeição';
COMMENT ON POLICY "tipos_refeicao_insert_policy" ON tipos_refeicao IS 'Permite que apenas admins e gestores com permissões específicas insiram tipos de refeição';
COMMENT ON POLICY "tipos_refeicao_update_policy" ON tipos_refeicao IS 'Permite que apenas admins e gestores com permissões específicas atualizem tipos de refeição';
COMMENT ON POLICY "tipos_refeicao_delete_policy" ON tipos_refeicao IS 'Permite que apenas admins e gestores com permissões específicas excluam tipos de refeição';