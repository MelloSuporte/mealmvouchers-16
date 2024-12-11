-- Atualizar políticas RLS para voucher comum
DROP POLICY IF EXISTS "usuarios_voucher_select_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_voucher_update_policy" ON usuarios;
DROP POLICY IF EXISTS "uso_voucher_comum_insert_policy" ON uso_voucher;
DROP POLICY IF EXISTS "uso_voucher_comum_select_policy" ON uso_voucher;

-- Políticas para tabela usuarios (voucher)
CREATE POLICY "usuarios_voucher_select_policy" ON usuarios
    FOR SELECT TO authenticated
    USING (
        id = auth.uid()
        OR 
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );

CREATE POLICY "usuarios_voucher_update_policy" ON usuarios
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'sistema' = 'true'
        )
    );

-- Políticas para tabela uso_voucher
CREATE POLICY "uso_voucher_comum_insert_policy" ON uso_voucher
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'sistema' = 'true'
        )
    );

CREATE POLICY "uso_voucher_comum_select_policy" ON uso_voucher
    FOR SELECT TO authenticated
    USING (
        usuario_id = auth.uid()
        OR
        EXISTS (
            SELECT 1 FROM admin_users au
            WHERE au.id = auth.uid()
            AND au.permissoes->>'gerenciar_usuarios' = 'true'
            AND NOT au.suspenso
        )
    );

-- Adicionar comentários para documentação
COMMENT ON POLICY "usuarios_voucher_select_policy" ON usuarios IS 'Controla acesso de leitura aos vouchers comuns';
COMMENT ON POLICY "usuarios_voucher_update_policy" ON usuarios IS 'Apenas sistema pode atualizar vouchers';
COMMENT ON POLICY "uso_voucher_comum_insert_policy" ON uso_voucher IS 'Controla registro de uso de vouchers comuns';
COMMENT ON POLICY "uso_voucher_comum_select_policy" ON uso_voucher IS 'Controla visualização do histórico de uso';